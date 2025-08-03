import type { ApplicationCommandOptionType, ChannelType, ChatInputCommandInteraction, Collection, PermissionFlagsBits, RestOrArray } from 'discord.js';
import type { ConfigManager } from '@/ConfigManager';
import type { BaseCommand } from '@/commands/BaseCommand';

declare global {
	interface CommandMetadata {
		name: string;
		description: string;
		requiredPermissions?: (keyof typeof PermissionFlagsBits)[];
		requiredFeatures?: Feature[];
		options?: SlashCommandOption[];
		defaultMemberPermissions?: bigint | null;
		dmPermission?: boolean;
	}

	interface CommandContext {
		interaction: ChatInputCommandInteraction;
		configManager: ConfigManager;
	}

	interface Command {
		instance: BaseCommand;
		metadata: CommandMetadata;
	}

	type ChannelTypeForOption =
		| ChannelType.GuildText
		| ChannelType.GuildVoice
		| ChannelType.GuildCategory
		| ChannelType.GuildAnnouncement
		| ChannelType.AnnouncementThread
		| ChannelType.PublicThread
		| ChannelType.PrivateThread
		| ChannelType.GuildStageVoice
		| ChannelType.GuildForum
		| ChannelType.GuildMedia;

	interface SlashCommandOption {
		name: string;
		description: string;
		type: ApplicationCommandOptionType;
		required?: boolean;
		choices?: ApplicationCommandOptionChoiceData[];
		minValue?: number;
		maxValue?: number;
		minLength?: number;
		maxLength?: number;
		autocomplete?: boolean;
		channelTypes?: RestOrArray<ChannelTypeForOption>;
	}

	type CommandCollection = Collection<string, Command>;
}
