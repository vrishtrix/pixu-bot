import type { DiscordjsError } from 'discord.js';
import { Client, DiscordjsErrorCodes as ErrorCodes, Events, GatewayIntentBits } from 'discord.js';
import { CommandManager } from '@/CommandManager';
import { ConfigManager } from '@/ConfigManager';

// Commands
import { PingCommand } from '@/commands/ping.command';

const client = new Client({
	intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildMessages],
});

const configManager = new ConfigManager('config.json');
const commandManager = new CommandManager(configManager);

commandManager.registerCommand(PingCommand);

client.once(Events.ClientReady, async (readyClient) => {
	console.log(`Ready! Logged in as ${readyClient.user.tag}`);

	try {
		await commandManager.registerSlashCommands(client, process.env.GUILD_ID);
	} catch (error) {
		console.error('Failed to register slash commands:', error);
	}
});

client.on('interactionCreate', async (interaction) => {
	if (interaction.isChatInputCommand()) {
		await commandManager.executeCommand(interaction.commandName, interaction);
	} else if (interaction.isAutocomplete()) {
		await commandManager.handleAutocomplete(interaction);
	}
});

client.login(process.env.BOT_TOKEN).catch((err: DiscordjsError) => {
	switch (err.code) {
		case ErrorCodes.TokenMissing:
			console.error('A bot token was not provided for log in. Please make sure that the BOT_TOKEN environment variable is set.');
			break;
		case ErrorCodes.TokenInvalid:
			console.error('Invalid bot token provided. Please check your BOT_TOKEN environment variable and try again.');
			break;
		default:
			console.error('An unknown error occurred while logging in. Please report this to the developers!');
			console.error(err.stack);
			break;
	}

	process.exit(1);
});
