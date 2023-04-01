import { SlashCommandBuilder, BaseInteraction } from 'discord.js';
import { DynamoDeleteQueue } from 'noodle-utils';

import {
  DYNAMO_CREDENTIALS, DYNAMO_REGION, DYNAMO_TABLE,
} from '../constants';

const DELETE_QUEUE = new DynamoDeleteQueue(DYNAMO_CREDENTIALS, DYNAMO_REGION, DYNAMO_TABLE);

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
    const userId = interaction.member.user.id;

    const removeItem = {
      userId,
    };

    /**
     * Post a message in the channel once the video is removed
     *
     * @returns {void} Nothing
     */
    const removeCallback = () => {
      interaction.reply('Removed your intro music!');
    };

    DELETE_QUEUE.push(removeItem, removeCallback);
  },
};
