/*
	Enhancements:
		1. Check if the features array can be converted to a Set for faster lookups. This also prevents having to programatically check if a feature is enabled.
*/

import type { BunFile } from 'bun';

export class ConfigManager {
	private config: Config | null = null;

	constructor(private filePath: string | URL) {
		this.config = Bun.file(this.filePath, { type: 'application/json' }) as unknown as Config;
	}

	getConfig(): Config {
		if (!this.config) throw new Error('Config was not loaded.', {});
		return this.config;
	}

	getFeatureConfig(feature: Feature): Config[Feature] | undefined {
		return this.getConfig()[feature];
	}

	isFeatureEnabled(feature: Feature): boolean {
		return this.getConfig().features.includes(feature);
	}

	async enableFeature(feature: Feature): Promise<boolean> {
		if (this.isFeatureEnabled(feature)) {
			return true;
		}

		this.getConfig().features.push(feature);

		await Bun.write(this.filePath, this.config as unknown as BunFile);
		return true;
	}

	async disableFeature(feature: Feature): Promise<boolean> {
		const config = this.getConfig();
		const index = config.features.indexOf(feature);

		if (index !== -1) {
			config.features.splice(index, 1);
			return true;
		}

		await Bun.write(this.filePath, this.config as unknown as BunFile);
		return true;
	}

	async updateFeatureConfig<F extends Feature>(feature: F, data: Partial<Config[F]>): Promise<boolean> {
		const config = this.getConfig();

		// Initialize config for the particular feature if it doesn't already exist.
		if (!config[feature]) {
			config[feature] = {} as Config[F];
		}

		config[feature] = {
			...config[feature],
			...data,
		};

		await Bun.write(this.filePath, this.config as unknown as BunFile);
		return true;
	}
}
