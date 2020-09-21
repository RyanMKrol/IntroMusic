/** @memberof events */

import { isUndefined } from 'noodle-utils';
import ytdl from 'ytdl-core';

import { MAX_PLAY_TIME } from '../constants';

/**
 * Method to handle when the voice state changes in any discord server this bot is in
 *
 * @param {module:app.VoiceState} oldState The old voice state
 * @param {module:app.VoiceState} newState The new voice state
 */
async function voiceStateUpdate(oldState, newState) {
  const newUserChannel = newState.channelID;
  const oldUserChannel = oldState.channelID;

  if (isUndefined(oldUserChannel) && !isUndefined(newUserChannel) && !newState.member.user.bot) {
    const introMusicData = 'https://www.youtube.com/watch?v=fTwKPot-ds0';

    newState.channel.join().then(async (connection) => {
      const stream = await ytdl(introMusicData);

      const dispatcher = await connection.play(stream, {
        volume: 0.5,
      });

      const playerTimeout = setTimeout(async () => {
        await connection.disconnect();
      }, MAX_PLAY_TIME);

      dispatcher.on('finish', async () => {
        clearTimeout(playerTimeout);
        await connection.disconnect();
      });
    });
  }
}

export default voiceStateUpdate;
