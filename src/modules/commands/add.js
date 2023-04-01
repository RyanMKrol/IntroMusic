import { SlashCommandBuilder, BaseInteraction } from 'discord.js';
import ytdl from 'ytdl-core';

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
    // the next bit of processing may take time, and discord demands a response within 3s,
    // deferReply, extends that window for us by displaying something to the user before we
    // actually reply
    await interaction.deferReply();

    const link = interaction.options.getString(SUBCOMMAND_OPTION_NAMES.LINK);
    const video = await parseYouTubeVideoLink(interaction, link);

    if (video) {
      interaction.followUp('Doing something here!');
    }
  },
};

/**
 * Pull a representation of a video, if the link is valid
 *
 * @param {BaseInteraction} interaction User interaction object
 * @param {string} link A link to validate
 * @returns {object} Video object from YouTube API
 * @example Example unavailable video: https://www.youtube.com/watch?v=PE3IslWaB4E
 */
async function parseYouTubeVideoLink(interaction, link) {
  const isLinkToVideo = ytdl.validateURL(link);

  if (!isLinkToVideo) {
    await interaction.followUp(`Problem with link:\n\`${link}\`\nReason: It doesn't appear to be associated with YouTube`);
    return undefined;
  }

  const video = await ytdl.getInfo(link).catch(() => undefined);
  const isAvailable = video && video.formats.length > 0;

  if (!isAvailable) {
    await interaction.followUp(`Problem with link:\n\`${link}\`\nReason: It is not available`);
    return undefined;
  }

  return video;
}
