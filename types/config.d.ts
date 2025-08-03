import type { Feature as FeatureEnum } from '@/lib/feature';

declare global {
	type Feature = FeatureEnum;

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
