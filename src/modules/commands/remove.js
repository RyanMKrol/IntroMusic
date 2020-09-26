import { DynamoDeleteQueue } from 'noodle-utils';
import {
  COMMAND_PREFIX,
  COMMAND_REMOVE,
  DYNAMO_CREDENTIALS,
  DYNAMO_REGION,
  DYNAMO_TABLE,
} from '../constants';

const REGEX_BASE = `${COMMAND_PREFIX} ${COMMAND_REMOVE}`;
const DELETE_QUEUE = new DynamoDeleteQueue(DYNAMO_CREDENTIALS, DYNAMO_REGION, DYNAMO_TABLE);

/**
 * Handles the remove command
 *
 * @param {module:app.Message} messageHook The hook that contains the cmomand being used
 */
async function remove(messageHook) {
  const command = messageHook.content;

  if (!isRemove(command)) return;

  removeLink(messageHook);
}

/**
 * Verifies that the current command is a remove command
 *
 * @param {string} command The command being used
 * @returns {boolean} Whether the command is a remove command or not
 */
function isRemove(command) {
  const isRemovePattern = new RegExp(`${REGEX_BASE}`);
  return command.match(isRemovePattern);
}

/**
 * Method to remove the link associated with the requester ID
 *
 * @param {module:app.Message} responseHook The hook to send a message with once the link is stored
 */
async function removeLink(responseHook) {
  const removeItem = {
    userId: responseHook.author.id,
  };

  /**
   * Callback to use once the user has been updated
   *
   * @returns {void} Nothing
   */
  const removeCallback = () => {
    responseHook.reply('Removed your intro music!');
  };

  DELETE_QUEUE.push(removeItem, removeCallback);
}

export default remove;
