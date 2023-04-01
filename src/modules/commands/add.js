import { SlashCommandBuilder, BaseInteraction } from 'discord.js';

const SUBCOMMAND_OPTION_NAMES = {
  LINK: 'link',
  START: 'start',
  RUNTIME: 'runtime',
};

export default {
  data: new SlashCommandBuilder()
    .setName('add')
    .setDescription('Add some intro music!')
    .addStringOption((option) => option.setName(SUBCOMMAND_OPTION_NAMES.LINK)
      .setDescription('A link to a YouTube video')
      .setRequired(true))
    .addStringOption((option) => option.setName(SUBCOMMAND_OPTION_NAMES.START)
      .setDescription('Where you want the video to begin (timestamp in seconds)'))
    .addStringOption((option) => option.setName(SUBCOMMAND_OPTION_NAMES.RUNTIME)
      .setDescription('How long you want the video to run for (max 10s)')),

  /**
   * Executes the command
   *
   * @param {BaseInteraction} interaction User interaction object
   */
  async execute(interaction) {
    interaction.reply('Added!');
  },
};
