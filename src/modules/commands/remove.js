import { SlashCommandBuilder, BaseInteraction } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('remove')
    .setDescription('Remove your intro music!'),

  /**
   * Executes the command
   *
   * @param {BaseInteraction} interaction User interaction object
   */
  async execute(interaction) {
    interaction.reply('Removed!');
  },
};
