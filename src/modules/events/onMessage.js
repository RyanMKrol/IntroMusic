import { COMMAND_PREFIX } from '../constants';
import { add, remove } from '../commands';

/**
 * Method to handle when the bot is messaged by a user
 *
 * @param {module:app.Message} message The message that the user has sent
 */
async function onMessage(message) {
  // ignore any messages not prefixed with our command prefix, or messages made by a bot
  if (!message.content.startsWith(COMMAND_PREFIX) || message.author.bot) return;

  add(message);
  remove(message);
}

export default onMessage;
