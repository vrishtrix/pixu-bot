/*
	Enhancements:
		1. Stop supressing Biome's linter and use the exact type of the BaseCommand constructor instead of using Function.
*/

import 'reflect-metadata';

import { PermissionFlagsBits } from 'discord.js';

// biome-ignore format: This is more readable without biome formatting.
const
	OPTIONS_METADATA_KEY = Symbol('options'),
	COMMAND_METADATA_KEY = Symbol('command'),
	FEATURES_METADATA_KEY = Symbol('features'),
	PERMISSION_METADATA_KEY = Symbol('permissions');

export const Permissions = (permissions: (keyof typeof PermissionFlagsBits)[]) => {
	// biome-ignore lint/complexity/noBannedTypes: The target is the constructor.
	return (target: Function) => {
		Reflect.defineMetadata(PERMISSION_METADATA_KEY, permissions, target);
	};
};

export const Features = (features: Feature[]) => {
	// biome-ignore lint/complexity/noBannedTypes: The target is the constructor.
	return (target: Function) => {
		Reflect.defineMetadata(FEATURES_METADATA_KEY, features, target);
	};
};

export const Option = (option: SlashCommandOption) => {
	// biome-ignore lint/complexity/noBannedTypes: The target is the constructor.
	return (target: Function) => {
		const existingOptions: SlashCommandOption[] = Reflect.getMetadata(OPTIONS_METADATA_KEY, target) || [];
		existingOptions.push(option);
		Reflect.defineMetadata(OPTIONS_METADATA_KEY, existingOptions, target);
	};
};

export const Command = (
	name: string,
	description: string,
	options?: {
		defaultMemberPermissions?: bigint | null; // null to override auto-detection
		dmPermission?: boolean;
	},
) => {
	// biome-ignore lint/complexity/noBannedTypes: The target is the constructor.
	return (target: Function) => {
		const requiredPermissions: (keyof typeof PermissionFlagsBits)[] = Reflect.getMetadata(PERMISSION_METADATA_KEY, target);

		let defaultMemberPermissions = options?.defaultMemberPermissions;
		if (defaultMemberPermissions === undefined && requiredPermissions && requiredPermissions.length > 0) {
			defaultMemberPermissions = requiredPermissions.reduce((acc: bigint, permName: keyof typeof PermissionFlagsBits) => {
				return acc | PermissionFlagsBits[permName];
			}, 0n);
		}

		const metadata: CommandMetadata = {
			name,
			description,
			requiredPermissions,
			requiredFeatures: Reflect.getMetadata(FEATURES_METADATA_KEY, target),
			options: Reflect.getMetadata(OPTIONS_METADATA_KEY, target) || [],
			defaultMemberPermissions,
			dmPermission: options?.dmPermission ?? false,
		};

		Reflect.defineMetadata(COMMAND_METADATA_KEY, metadata, target);
	};
};

// biome-ignore lint/complexity/noBannedTypes: The target is the constructor.
export const getCommandMetadata = (target: Function) => {
	return Reflect.getMetadata(COMMAND_METADATA_KEY, target);
};
