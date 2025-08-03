import type { ChatInputCommandInteraction, PermissionFlags } from 'discord.js';
import type { ConfigManager } from '@/ConfigManager';

declare global {
	interface CommandMetadata {
		name: string;
		description: string;
		requiredPermissions?: PermissionFlags[];
		requiredFeatures?: Feature[];
	}

	interface CommandContext {
		interaction: ChatInputCommandInteraction;
		configManager: ConfigManager;
	}
}
