import ytdl from 'ytdl-core';
import { DynamoWriteQueue } from 'noodle-utils';
import {
  COMMAND_PREFIX,
  COMMAND_ADD,
  DYNAMO_CREDENTIALS,
  DYNAMO_REGION,
  DYNAMO_TABLE,
} from '../constants';

const REGEX_BASE = `${COMMAND_PREFIX} ${COMMAND_ADD} `;
const WRITE_QUEUE = new DynamoWriteQueue(DYNAMO_CREDENTIALS, DYNAMO_REGION, DYNAMO_TABLE);

/**
 * Handles the add command
 *
 * @param {module:app.Message} messageHook The hook that contains the cmomand being used
 */
async function add(messageHook) {
  const command = messageHook.content;

  if (!isAdd(command)) return;

  // should be an array with one item - the link to set the intro music to
  const youtubeLinkArray = command.slice(REGEX_BASE.length).split(' ');
  const link = youtubeLinkArray[0];

  if (!validateYoutubeLink(messageHook, link)) return;
  if (!validateYoutubeVideoAvailable(messageHook, link)) return;

  storeNewLink(messageHook, link);
}

/**
 * Verifies that the current command is an add command
 *
 * @param {string} command The command being used
 * @returns {boolean} Whether the command is an add command or not
 */
function isAdd(command) {
  const isAddPattern = new RegExp(`${REGEX_BASE}.*`);
  return command.match(isAddPattern);
}

/**
 * Method to validate if the youtube link is valid
 *
 * @param {module:app.Message} responseHook The hook to send a message with if the link is invalid
 * @param {string} link The youtube link to test
 * @returns {boolean} Whether the link is valid or not
 */
async function validateYoutubeLink(responseHook, link) {
  const isLinkValid = await ytdl.validateURL(link);

  if (!isLinkValid) {
    await responseHook.reply("Sorry, we couldn't recognise your link as a valid youtube video!");
  }

  return isLinkValid;
}

/**
 * Method to validate if the youtube video is available in the region we're streaming from
 *
 * @param {module:app.Message} responseHook The hook to respond with if the video is unavailable
 * @param {string} link The youtube link to test
 * @returns {boolean} Whether the video is available to stream or not
 */
async function validateYoutubeVideoAvailable(responseHook, link) {
  const information = await ytdl.getInfo(link);
  const isAvailable = information.formats.length > 0;

  if (!isAvailable) {
    await responseHook.reply("Sorry, could not add your video, it doesn't appear to be available!");
  }

  return isAvailable;
}

/**
 * Method to store a new youtube link for the given requester
 *
 * @param {module:app.Message} responseHook The hook to send a message with once the link is stored
 * @param {string} link The youtube link to store
 */
async function storeNewLink(responseHook, link) {
  const storageItem = {
    userId: responseHook.author.id,
    link,
  };

  /**
   * Callback to use once the new link has been stored
   *
   * @returns {void} Nothing
   */
  const storageCallback = () => {
    responseHook.reply('Added your new intro music!');
  };

  WRITE_QUEUE.push(storageItem, storageCallback);
}

export default add;
