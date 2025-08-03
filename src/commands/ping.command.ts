import { Command } from '@/lib/decorators';
import { BaseCommand } from './BaseCommand';

@Command('ping', 'Ping the bot to check if it is responsive.')
export class PingCommand extends BaseCommand {
	async execute(context: CommandContext) {
		await context.interaction.reply('Pong!');
	}
}
