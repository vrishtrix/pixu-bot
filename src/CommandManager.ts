import { type ChatInputCommandInteraction, Collection, type GuildMember } from 'discord.js';
import type { ConfigManager } from '@/ConfigManager';
import type { BaseCommand } from '@/commands/BaseCommand';
import { getCommandMetadata } from '@/lib/decorators';

export class CommandManager {
	private commands = new Collection() as CommandCollection;

	constructor(private configManager: ConfigManager) {}

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

	async executeCommand(commandName: string, interaction: ChatInputCommandInteraction): Promise<void> {
		const command = this.commands.get(commandName);
		if (!command) {
			await interaction.reply({
				content: '❌ Command not found.',
				ephemeral: true,
			});
			return;
		}

		if (!interaction.member) {
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
			const permissionCheck = await this.checkPermissions(command.metadata, interaction.member as GuildMember);
			if (!permissionCheck.success) {
				await command.instance.onValidationFailure(context, permissionCheck.reason);
				return;
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
