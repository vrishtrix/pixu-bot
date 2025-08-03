import type { BaseInteraction } from 'discord.js';

export abstract class BaseCommand {
	abstract execute(context: CommandContext): Promise<void>;

	async validate(_context: CommandContext): Promise<boolean> {
		return true;
	}

	async onValidationFailure(context: CommandContext, reason: string): Promise<void> {
		await context.interaction.reply({
			content: `❌ ${reason}`,
			ephemeral: true,
		});
	}

	async handleAutocomplete?(interaction: BaseInteraction): Promise<void>;
}
