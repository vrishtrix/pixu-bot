import {
	ApplicationCommandOptionType,
	type SlashCommandAttachmentOption,
	type SlashCommandBooleanOption,
	SlashCommandBuilder,
	type SlashCommandChannelOption,
	type SlashCommandIntegerOption,
	type SlashCommandMentionableOption,
	type SlashCommandNumberOption,
	type SlashCommandRoleOption,
	type SlashCommandStringOption,
	type SlashCommandUserOption,
} from 'discord.js';

// biome-ignore lint/complexity/noStaticOnlyClass: This is a helper class
export class SlashCommandBuilderHelper {
	static buildSlashCommand(metadata: CommandMetadata): SlashCommandBuilder {
		const builder = new SlashCommandBuilder().setName(metadata.name).setDescription(metadata.description);

		if (metadata.defaultMemberPermissions !== undefined) {
			builder.setDefaultMemberPermissions(metadata.defaultMemberPermissions);
		}

		builder.setDMPermission(metadata.dmPermission ?? false);

		if (metadata.options) {
			metadata.options.forEach((option) => {
				SlashCommandBuilderHelper.addOptionToBuilder(builder, option);
			});
		}

		return builder;
	}

	private static addOptionToBuilder(builder: SlashCommandBuilder, option: SlashCommandOption) {
		switch (option.type) {
			case ApplicationCommandOptionType.String:
				builder.addStringOption((opt: SlashCommandStringOption) => {
					opt.setName(option.name)
						.setDescription(option.description)
						.setRequired(option.required ?? false);

					if (option.choices) {
						opt.addChoices(...option.choices);
					}

					if (option.minLength !== undefined) opt.setMinLength(option.minLength);
					if (option.maxLength !== undefined) opt.setMaxLength(option.maxLength);
					if (option.autocomplete) opt.setAutocomplete(true);

					return opt;
				});
				break;

			case ApplicationCommandOptionType.Integer:
				builder.addIntegerOption((opt: SlashCommandIntegerOption) => {
					opt.setName(option.name)
						.setDescription(option.description)
						.setRequired(option.required ?? false);

					if (option.choices) {
						opt.addChoices(...option.choices);
					}

					if (option.minValue !== undefined) opt.setMinValue(option.minValue);
					if (option.maxValue !== undefined) opt.setMaxValue(option.maxValue);
					if (option.autocomplete) opt.setAutocomplete(true);

					return opt;
				});
				break;

			case ApplicationCommandOptionType.Number:
				builder.addNumberOption((opt: SlashCommandNumberOption) => {
					opt.setName(option.name)
						.setDescription(option.description)
						.setRequired(option.required ?? false);

					if (option.choices) {
						opt.addChoices(...option.choices);
					}

					if (option.minValue !== undefined) opt.setMinValue(option.minValue);
					if (option.maxValue !== undefined) opt.setMaxValue(option.maxValue);
					if (option.autocomplete) opt.setAutocomplete(true);

					return opt;
				});
				break;

			case ApplicationCommandOptionType.Boolean:
				builder.addBooleanOption((opt: SlashCommandBooleanOption) =>
					opt
						.setName(option.name)
						.setDescription(option.description)
						.setRequired(option.required ?? false),
				);
				break;

			case ApplicationCommandOptionType.User:
				builder.addUserOption((opt: SlashCommandUserOption) =>
					opt
						.setName(option.name)
						.setDescription(option.description)
						.setRequired(option.required ?? false),
				);
				break;

			case ApplicationCommandOptionType.Channel:
				builder.addChannelOption((opt: SlashCommandChannelOption) => {
					opt.setName(option.name)
						.setDescription(option.description)
						.setRequired(option.required ?? false);

					if (option.channelTypes) {
						opt.addChannelTypes(...option.channelTypes);
					}

					return opt;
				});
				break;

			case ApplicationCommandOptionType.Role:
				builder.addRoleOption((opt: SlashCommandRoleOption) =>
					opt
						.setName(option.name)
						.setDescription(option.description)
						.setRequired(option.required ?? false),
				);
				break;

			case ApplicationCommandOptionType.Mentionable:
				builder.addMentionableOption((opt: SlashCommandMentionableOption) =>
					opt
						.setName(option.name)
						.setDescription(option.description)
						.setRequired(option.required ?? false),
				);
				break;

			case ApplicationCommandOptionType.Attachment:
				builder.addAttachmentOption((opt: SlashCommandAttachmentOption) =>
					opt
						.setName(option.name)
						.setDescription(option.description)
						.setRequired(option.required ?? false),
				);
				break;
		}
	}
}
