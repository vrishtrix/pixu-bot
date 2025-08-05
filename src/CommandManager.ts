import { Glob } from 'bun';
import {
	type APIApplicationCommand,
	type AutocompleteInteraction,
	type ChatInputCommandInteraction,
	type Client,
	Collection,
	type GuildMember,
	REST,
	Routes,
	type SlashCommandBuilder,
} from 'discord.js';
import type { ConfigManager } from '@/ConfigManager';
import type { BaseCommand } from '@/commands/BaseCommand';
import { getCommandMetadata } from '@/lib/decorators';
import { SlashCommandBuilderHelper } from '@/lib/discord/SlashCommandBuilder';

export class CommandManager {
	private commands = new Collection() as CommandCollection;

	constructor(
		private configManager: ConfigManager,
		private autoLoadCommands: boolean,
	) {
		if (this.autoLoadCommands) this.loadCommands();
	}

	private async loadCommands(): Promise<void> {
		try {
			const commandsDir = `${import.meta.dir}/commands`;
			const commandsList = new Glob('**/*.command.{ts,js}').scan(commandsDir);

			console.log(`Scanning for commands in: ${commandsDir}`);

			let commandsCount = 0;
			for await (const file of commandsList) {
				await this.loadCommandFile(commandsDir, file);
				commandsCount++;
			}

			console.log(`Found ${commandsCount} command files, successfully loaded ${this.commands.size} commands`);
		} catch (error) {
			console.error('Error loading commands:', error);
		}
	}

	private async loadCommandFile(baseDir: string, relativePath: string): Promise<void> {
		try {
			const absolutePath = `${baseDir}/${relativePath}`;

			console.log(`Loading command file: ${relativePath}`);

			const commandModule = await import(absolutePath);

			const exports = Object.values(commandModule);
			let commandsFound = 0;

			for (const exportedItem of exports) {
				try {
					this.registerCommand(exportedItem as new () => BaseCommand);
					commandsFound++;
					console.log(`✓ Loaded command from: ${relativePath}`);
				} catch (error) {
					console.error(`✗ Failed to register command from ${relativePath}:`, error);
				}
			}

			if (commandsFound === 0) {
				console.warn(`⚠ No valid commands found in: ${relativePath}`);
			}
		} catch (error) {
			console.error(`✗ Failed to load command file ${relativePath}:`, error);
		}
	}

	getCommand(name: string): Command | undefined {
		return this.commands.get(name);
	}

	getCommands(): CommandCollection {
		return this.commands;
	}

	registerCommand(CommandClass: new () => BaseCommand): void {
		const metadata = getCommandMetadata(CommandClass);

		if (!metadata) {
			throw new Error(`Command ${CommandClass.name} is missing the @Command decorator.`);
		}

		const instance = new CommandClass();
		this.commands.set(metadata.name, { instance, metadata });

		console.log(`Registered command: ${metadata.name}`);
	}

	registerCommands(CommandClasses: (new () => BaseCommand)[]): void {
		CommandClasses.forEach((CommandClass) => this.registerCommand(CommandClass));
	}

	getSlashCommandData(): SlashCommandBuilder[] {
		return Array.from(this.commands.values()).map(({ metadata }) => SlashCommandBuilderHelper.buildSlashCommand(metadata));
	}

	private async checkPermissions(
		metadata: CommandMetadata,
		member: GuildMember,
	): Promise<{
		success: boolean;
		reason: string;
	}> {
		if (!metadata.requiredPermissions || metadata.requiredPermissions.length === 0) {
			return { success: true, reason: '' };
		}

		const hasPermissions = member.permissions.has(metadata.requiredPermissions);

		if (!hasPermissions) {
			return {
				success: false,
				reason: `You are missing the following permissions: ${metadata.requiredPermissions.join(', ')}.`,
			};
		}

		return {
			success: true,
			reason: '',
		};
	}

	private async checkFeatures(metadata: CommandMetadata): Promise<{
		success: boolean;
		reason: string;
	}> {
		if (!metadata.requiredFeatures || metadata.requiredFeatures.length === 0) {
			return { success: true, reason: '' };
		}

		const disabledFeatures = metadata.requiredFeatures.filter((feature) => !this.configManager.isFeatureEnabled(feature));

		if (disabledFeatures.length > 0) {
			return {
				success: false,
				reason: `The following features are disabled: ${disabledFeatures.join(', ')}`,
			};
		}

		return { success: true, reason: '' };
	}

	async registerSlashCommands(client: Client, guildId?: string): Promise<void> {
		if (!client.user) {
			throw new Error('Client must be logged in before registering slash commands');
		}

		// biome-ignore lint/style/noNonNullAssertion: This is only called after the 'ready' event is triggered.
		const rest = new REST().setToken(client.token!);
		const slashCommands = this.getSlashCommandData();

		try {
			console.log(`Started refreshing ${slashCommands.length} application (/) commands.`);

			let data: APIApplicationCommand[];
			if (guildId) {
				data = (await rest.put(Routes.applicationGuildCommands(client.user.id, guildId), {
					body: slashCommands.map((cmd) => cmd.toJSON()),
				})) as APIApplicationCommand[];
			} else {
				data = (await rest.put(Routes.applicationCommands(client.user.id), {
					body: slashCommands.map((cmd) => cmd.toJSON()),
				})) as APIApplicationCommand[];
			}

			console.log(`Successfully reloaded ${data.length} application (/) commands.`);
		} catch (error) {
			console.error('Error registering slash commands:', error);
			throw error;
		}
	}

	async handleAutocomplete(interaction: AutocompleteInteraction): Promise<void> {
		const command = this.commands.get(interaction.commandName);
		if (!command?.instance.handleAutocomplete) {
			return;
		}

		try {
			await command.instance.handleAutocomplete(interaction);
		} catch (error) {
			console.error(`Error handling autocomplete for ${interaction.commandName}:`, error);
		}
	}

	async executeCommand(commandName: string, interaction: ChatInputCommandInteraction): Promise<void> {
		const command = this.commands.get(commandName);
		if (!command) {
			await interaction.reply({
				content: '❌ Command not found.',
				ephemeral: true,
			});
			return;
		}

		const member = interaction.member as GuildMember;
		if (!member && !command.metadata.dmPermission) {
			await interaction.reply({
				content: '❌ This command can only be used in a server.',
				ephemeral: true,
			});
			return;
		}

		const context: CommandContext = {
			interaction,
			configManager: this.configManager,
		};

		try {
			if (member) {
				const permissionCheck = await this.checkPermissions(command.metadata, member);
				if (!permissionCheck.success) {
					await command.instance.onValidationFailure(context, permissionCheck.reason);
					return;
				}
			}

			const featureCheck = await this.checkFeatures(command.metadata);
			if (!featureCheck.success) {
				await command.instance.onValidationFailure(context, featureCheck.reason);
				return;
			}

			const customValidation = await command.instance.validate(context);
			if (!customValidation) {
				await command.instance.onValidationFailure(context, 'Command validation failed.');
				return;
			}

			await command.instance.execute(context);
		} catch (err) {
			console.error(`Error executing command ${commandName}:`, err);

			if (!interaction.replied && !interaction.deferred) {
				await interaction.reply({
					content: '❌ An error occurred while executing the command.',
					ephemeral: true,
				});
			}
		}
	}
}
