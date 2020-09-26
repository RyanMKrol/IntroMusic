import { COMMAND_PREFIX } from '../constants';
import { add, remove, defaultCommand } from '../commands';

/**
 * A pipeline to run a series of functions until we find a truthy value
 *
 * @param {Array.<Function>} fns Array of functions to run over single value
 * @returns {void} Nothing
 */
const conditionalPipeline = (...fns) => (val) => fns.reduce(
  async (current, fn) => current.then((value) => value || fn(val)),
  Promise.resolve(false),
);

/**
 * Method to handle when the bot is messaged by a user
 *
 * @param {module:app.Message} message The message that the user has sent
 */
async function onMessage(message) {
  // ignore any messages not prefixed with our command prefix, or messages made by a bot
  if (!message.content.startsWith(COMMAND_PREFIX) || message.author.bot) return;

  // runs each command handler over the current message, short circuiting once it has
  // been handled
  await conditionalPipeline(add, remove, defaultCommand)(message);
}

export default onMessage;
