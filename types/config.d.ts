declare global {
	enum Feature {
		ReadUser = 'read:user',
		ReadConfig = 'read:config',
		UpdateConfig = 'update:config',
	}

	interface FeatureConfigMap {
		[Feature.ReadUser]?: {
			endpoint: string;
			methods: HTTPMethod[];
			headers?: Record<string, string>;
		};
		[Feature.ReadConfig]?: Record<string, unknown>;
		[Feature.UpdateConfig]?: Record<string, unknown>;
	}

	interface Config extends FeatureConfigMap {
		api: {
			baseUrl: string;
		};
		features: Feature[];
	}
}

export {};
