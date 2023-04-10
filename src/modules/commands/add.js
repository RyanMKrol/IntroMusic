import { SlashCommandBuilder, BaseInteraction } from 'discord.js';
import ytdl from 'ytdl-core';
import { DynamoWriteQueue } from 'noodle-utils';

import {
  DYNAMO_CREDENTIALS,
  DYNAMO_REGION,
  DYNAMO_TABLE,
} from '../constants';

// only allow 10s per intro
const MAX_RUNTIME_VALUE = 10;

const WRITE_QUEUE = new DynamoWriteQueue(DYNAMO_CREDENTIALS, DYNAMO_REGION, DYNAMO_TABLE);

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
    .addIntegerOption((option) => option.setName(SUBCOMMAND_OPTION_NAMES.START)
      .setMinValue(0)
      .setDescription('Where you want the video to begin (timestamp in seconds)'))
    .addIntegerOption((option) => option.setName(SUBCOMMAND_OPTION_NAMES.RUNTIME)
      .setMinValue(0)
      .setMaxValue(MAX_RUNTIME_VALUE)
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
    const start = interaction.options.getInteger(SUBCOMMAND_OPTION_NAMES.START)
    || 0;
    const runtime = interaction.options.getInteger(SUBCOMMAND_OPTION_NAMES.RUNTIME)
    || MAX_RUNTIME_VALUE;

    const isValid = await validateUserInput(interaction, link, start);

    if (isValid) {
      storeIntroMusicConfig(interaction, link, start, runtime);
    }
  },
};

/**
 * Pull a representation of a video, if the link is valid
 *
 * @param {BaseInteraction} interaction User interaction object
 * @param {string} requestedlink A link to validate
 * @param {number} requestedStart The requested start of the video
 * @returns {boolean} Whether the link is a link to an available YouTube video
 * @example Example unavailable video: https://www.youtube.com/watch?v=PE3IslWaB4E
 */
async function validateUserInput(interaction, requestedlink, requestedStart) {
  const isLinkToVideo = ytdl.validateURL(requestedlink);

  if (!isLinkToVideo) {
    await interaction.followUp(`Problem with link:\n\`${requestedlink}\`\nReason: It doesn't appear to be associated with YouTube`);
    return false;
  }

  const videoInformation = await ytdl.getInfo(requestedlink).catch(() => undefined);
  const isAvailable = videoInformation && videoInformation.formats.length > 0;

  if (!isAvailable) {
    await interaction.followUp(`Problem with link:\n\`${requestedlink}\`\nReason: It is not available`);
    return false;
  }

  const videoRuntime = Number.parseInt(videoInformation.videoDetails.lengthSeconds, 10);

  if (requestedStart > videoRuntime) {
    await interaction.followUp(`Problem with start:\n\`${requestedStart}\`\nReason: Requested start is later than video runtime`);
    return false;
  }

  return true;
}

/**
 * Stores the intro music config in Dynamo
 *
 * @param {BaseInteraction} interaction User interaction object
 * @param {string} link The intro music link
 * @param {number} start The starting timestamp of the video in seconds
 * @param {number} runtime The specified runtime of the video in seconds
 */
async function storeIntroMusicConfig(interaction, link, start, runtime) {
  const userId = interaction.member.user.id;

  const storageItem = {
    userId,
    link,
    start,
    runtime,
  };

  /**
   * Post a message in the channel once the video is saved
   *
   * @returns {void} Nothing
   */
  const storageCallback = () => {
    interaction.followUp('Added your new intro music!');
  };

  WRITE_QUEUE.push(storageItem, storageCallback);
}
