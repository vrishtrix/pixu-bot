import type { ChatInputCommandInteraction, Collection, PermissionFlagsBits } from 'discord.js';
import type { ConfigManager } from '@/ConfigManager';
import type { BaseCommand } from '@/commands/BaseCommand';

declare global {
	interface CommandMetadata {
		name: string;
		description: string;
		requiredPermissions?: PermissionFlagsBits[];
		requiredFeatures?: Feature[];
	}

	interface CommandContext {
		interaction: ChatInputCommandInteraction;
		configManager: ConfigManager;
	}

	interface Command {
		instance: BaseCommand;
		metadata: CommandMetadata;
	}

	type CommandCollection = Collection<string, Command>;
}
