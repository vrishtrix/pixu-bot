import type { DiscordjsError } from 'discord.js';
import { Client, DiscordjsErrorCodes as ErrorCodes, Events, GatewayIntentBits } from 'discord.js';

const client = new Client({
	intents: [GatewayIntentBits.Guilds],
});

client.once(Events.ClientReady, (readyClient) => {
	console.log(`Ready! Logged in as ${readyClient.user.tag}`);
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
