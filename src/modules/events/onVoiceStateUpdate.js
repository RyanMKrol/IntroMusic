import { isUndefined, DynamoReadQueue } from 'noodle-utils';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import ytdl from 'ytdl-core';

import {
  MAX_PLAY_TIME,
  DYNAMO_CREDENTIALS,
  DYNAMO_REGION,
  DYNAMO_TABLE,
  TIMESTAMP_QUERY_PARAM,
} from '../constants';

import PLAYER_MANAGER from '../data-structures';

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

const READ_QUEUE = new DynamoReadQueue(DYNAMO_CREDENTIALS, DYNAMO_REGION, DYNAMO_TABLE);

/**
 * @typedef DynamoReadResult
 * @type {object}
 * @property {string} userId The userId that the link is stored for
 * @property {string} link The link to play over discord
 */

/**
 * Method to handle when the voice state changes in any discord server this bot is in
 *
 * @param {module:app.VoiceState} oldState The old voice state
 * @param {module:app.VoiceState} newState The new voice state
 */
async function voiceStateUpdate(oldState, newState) {
  try {
    const guildId = oldState.guild.id;

    if (shouldPlayIntro(oldState, newState)) {
      PLAYER_MANAGER.setIsPlayerPlaying(guildId, true);

      /**
       * Closure to let us pass some values to the actual read callback
       *
       * @param {Array.<DynamoReadResult>} result Result of the database read
       * @returns {void} Nothing
       */
      const callback = (result) => databaseReadCallback(result, guildId, newState.channel);

      const expression = 'userId = :userId';
      const expressionData = {
        ':userId': newState.member.user.id,
      };

      READ_QUEUE.push(
        {
          expression,
          expressionData,
        },
        callback,
      );
    }
  } catch (e) {
    process.stdout.write(`There was an error playing the intro: ${e}`);
  }
}

/**
 * Callback to start playing music when the database is done reading
 *
 * @param {Array.<DynamoReadResult>} result The result of the database read
 * @param {string} guildId The ID of the guild we're considering playing in
 * @param {module:app.VoiceChannel} channel The voice channel to play in
 */
async function databaseReadCallback(result, guildId, channel) {
  if (!validateDatabaseRead(result)) return;

  const { link } = result[0];

  const stream = ytdl(link);
  const rawTimestamp = new URL(link).searchParams.get(TIMESTAMP_QUERY_PARAM);
  const timestamp = Number.parseInt(rawTimestamp, 10) || 0;

  const download = ffmpeg(stream)
    .audioBitrate(48)
    .format('mp3')
    .seekInput(timestamp);

  const pipedStream = download.pipe();

  playVideo(guildId, channel, pipedStream);
}

/**
 * function to join the channel and start playing video
 *
 * @param {string} guildId The ID of the guild we're considering playing in
 * @param {module:app.VoiceChannel} channel The voice channel to play in
 * @param {module:app.PassThrough} stream The data we want to stream to our channel
 */
function playVideo(guildId, channel, stream) {
  channel.join().then(async (connection) => {
    const dispatcher = await connection.play(stream);

    const playerTimeout = setTimeout(async () => {
      if (PLAYER_MANAGER.getIsPlayerPlaying(guildId)) {
        await connection.disconnect();
        PLAYER_MANAGER.setIsPlayerPlaying(guildId, false);
      }
    }, MAX_PLAY_TIME);

    dispatcher.on('finish', async () => {
      PLAYER_MANAGER.setIsPlayerPlaying(guildId, false);
      await connection.disconnect();
      clearTimeout(playerTimeout);
    });
  });
}

/**
 * Method to check if the app should start playing on this server or not
 *
 * @param {module:app.VoiceState} oldState The old voice state
 * @param {module:app.VoiceState} newState The new voice state
 * @returns {boolean} Whether the bot should start playing
 */
function shouldPlayIntro(oldState, newState) {
  const newUserChannel = newState.channelID;
  const oldUserChannel = oldState.channelID;

  const guildId = oldState.guild.id;

  return (
    isUndefined(oldUserChannel)
    && !isUndefined(newUserChannel)
    && !newState.member.user.bot
    && !PLAYER_MANAGER.getIsPlayerPlaying(guildId)
  );
}

/**
 * Validates whether we can use the response from the database or not
 *
 * @param {Array.<DynamoReadResult>} dbResponse The result of the database read
 * @returns {boolean} Whether the response was validated or not
 */
async function validateDatabaseRead(dbResponse) {
  return dbResponse.length === 1;
}

export default voiceStateUpdate;
