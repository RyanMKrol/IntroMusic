import ytdl from 'ytdl-core';
import { DynamoWriteQueue } from 'noodle-utils';

import {
  COMMAND_PREFIX,
  DYNAMO_CREDENTIALS,
  DYNAMO_REGION,
  DYNAMO_TABLE,
  MAX_PLAY_TIME_S,
} from '../constants';

const IS_ADD_COMMAND_REGEX = `${COMMAND_PREFIX} add .*`;
const PROPERTIES_REGEX = {
  link: /.*-link (?<link>[^ ]*)/,
  start: /.*-start (?<start>[^ ]*)/,
  runtime: /.*-runtime (?<runtime>[^ ]*)/,
};

const WRITE_QUEUE = new DynamoWriteQueue(DYNAMO_CREDENTIALS, DYNAMO_REGION, DYNAMO_TABLE);

/**
 * Handles the add command
 *
 * @param {module:app.Message} messageHook The hook that contains the command being used
 * @returns {boolean} Whether this was the command to run or not
 */
async function add(messageHook) {
  const command = messageHook.content;

  if (!isAdd(command)) return false;

  const properties = parseCommandProperties(command);
  const { link, start, runtime } = properties;

  if (!(await validateYoutubeLink(messageHook, link))) return true;
  if (!(await validateYoutubeVideoAvailable(messageHook, link))) return true;
  if (!(await validateYoutubeVideoTimestamp(messageHook, link, start, runtime))) return true;

  storeNewLink(messageHook, link, start, runtime);

  return true;
}

/**
 * Parse the properties for the request command
 *
 * @param {string} command The command to parse
 * @returns {object} A store of properties for the command
 */
function parseCommandProperties(command) {
  return Object.keys(PROPERTIES_REGEX).reduce((acc, key) => {
    const matches = command.match(PROPERTIES_REGEX[key]);
    const value = matches === null ? undefined : matches.groups[key];

    acc[key] = value;
    return acc;
  }, {});
}

/**
 * Verifies that the current command is an add command
 *
 * @param {string} command The command being used
 * @returns {boolean} Whether the command is an add command or not
 */
function isAdd(command) {
  const isAddPattern = new RegExp(IS_ADD_COMMAND_REGEX);

  const addMatch = command.match(isAddPattern);
  const linkMatch = command.match(PROPERTIES_REGEX.link);

  return addMatch !== null && linkMatch !== null;
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
 * Method to validate if the timestamp on the URL is within the length of the video
 *
 * @param {module:app.Message} responseHook The hook to respond with if the timestamp is invalid
 * @param {string} link The youtube link to test
 * @param {number} start The starting timestamp in seconds
 * @param {number} runtime The time the request would like to run the video for
 * @returns {boolean} Whether the timestamp is valid or not
 */
async function validateYoutubeVideoTimestamp(responseHook, link, start, runtime) {
  const information = await ytdl.getInfo(link);

  const videoLength = information.videoDetails.lengthSeconds;

  const normalisedStart = typeof start === 'undefined' ? 0 : parseInt(start, 10);
  const normalisedRuntime = typeof runtime === 'undefined' ? MAX_PLAY_TIME_S : parseInt(runtime, 10);

  const isTimestampValid = !Number.isNaN(normalisedStart)
    && !Number.isNaN(normalisedRuntime)
    && normalisedStart < videoLength
    && normalisedRuntime <= MAX_PLAY_TIME_S;

  if (!isTimestampValid) {
    await responseHook.reply("Sorry, the timestamp you've provided for the video is invalid");
  }

  return isTimestampValid;
}

/**
 * Method to store a new youtube link for the given requester
 *
 * @param {module:app.Message} responseHook The hook to send a message with once the link is stored
 * @param {string} link The youtube link to store
 * @param {number} start The starting timestamp in seconds
 * @param {number} runtime The time the request would like to run the video for
 */
async function storeNewLink(responseHook, link, start, runtime) {
  const storageItem = {
    userId: responseHook.author.id,
    link,
    start,
    runtime,
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
