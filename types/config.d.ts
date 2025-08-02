declare global {
	enum Feature {
		UserInfo = 'userinfo',
		Config = 'config',
	}

	interface FeatureConfigMap {
		[Feature.UserInfo]?: {
			endpoint: string;
			methods: HTTPMethod[];
			headers: Record<string, string>;
		};
		[Feature.Config]?: Record<string, unknown>;
	}

	interface Config extends FeatureConfigMap {
		api: {
			baseUrl: string;
		};
		features: Feature[];
	}
}

export {};
