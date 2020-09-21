/** @memberof events */

import { COMMAND_PREFIX, COMMAND_ADD, COMMAND_REMOVE } from '../constants';

/**
 * Method to handle when the bot is messaged by a user
 *
 * @param {module:app.Message} message The message that the user has sent
 */
async function onMessage(message) {
  // ignore any messages not prefixed with our command prefix, or messages made by a bot
  if (!message.content.startsWith(COMMAND_PREFIX) || message.author.bot) return;

  const args = message.content.slice(COMMAND_PREFIX.length).split(' ');
  const command = args.shift();

  if (command === COMMAND_ADD) {
    // add new intro music
  } else if (command === COMMAND_REMOVE) {
    // remove current intro music
  } else {
    // send a default response
  }
}

export default onMessage;
