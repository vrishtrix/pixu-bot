/*
	Enhancements:
		1. Stop supressing Biome's linter and use the exact type of the BaseCommand constructor instead of using Function.
*/

import 'reflect-metadata';

import type { PermissionFlags } from 'discord.js';

// biome-ignore format: This is more readable without biome formatting.
const
	COMMAND_METADATA_KEY = Symbol('command'),
	FEATURES_METADATA_KEY = Symbol('features'),
	PERMISSION_METADATA_KEY = Symbol('permissions');

export const Permissions = (permissions: PermissionFlags[]) => {
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

export const Command = (name: string, description: string) => {
	// biome-ignore lint/complexity/noBannedTypes: The target is the constructor.
	return (target: Function) => {
		const metadata: CommandMetadata = {
			name,
			description,
			requiredFeatures: Reflect.getMetadata(FEATURES_METADATA_KEY, target),
			requiredPermissions: Reflect.getMetadata(PERMISSION_METADATA_KEY, target),
		};

		Reflect.defineMetadata(COMMAND_METADATA_KEY, metadata, target);
	};
};

// biome-ignore lint/complexity/noBannedTypes: The target is the constructor.
export const getCommandMetadata = (target: Function) => {
	return Reflect.getMetadata(COMMAND_METADATA_KEY, target);
};
