import { isUndefined } from 'noodle-utils';
import ytdl from 'ytdl-core';

import { MAX_PLAY_TIME } from '../constants';
import playerManager from '../data-structures';

/**
 * Method to handle when the voice state changes in any discord server this bot is in
 *
 * @param {module:app.VoiceState} oldState The old voice state
 * @param {module:app.VoiceState} newState The new voice state
 */
async function voiceStateUpdate(oldState, newState) {
  const newUserChannel = newState.channelID;
  const oldUserChannel = oldState.channelID;

  const guildId = oldState.guild.id;

  if (
    isUndefined(oldUserChannel)
    && !isUndefined(newUserChannel)
    && !newState.member.user.bot
    && !playerManager.getIsPlayerPlaying(guildId)
  ) {
    playerManager.setIsPlayerPlaying(guildId, true);

    const introMusicData = 'https://www.youtube.com/watch?v=fTwKPot-ds0';

    newState.channel.join().then(async (connection) => {
      const stream = await ytdl(introMusicData);

      const dispatcher = await connection.play(stream, {
        volume: 0.5,
      });

      const playerTimeout = setTimeout(async () => {
        if (playerManager.getIsPlayerPlaying(guildId)) {
          await connection.disconnect();
          playerManager.setIsPlayerPlaying(guildId, false);
        }
      }, MAX_PLAY_TIME);

      dispatcher.on('finish', async () => {
        playerManager.setIsPlayerPlaying(guildId, false);
        await connection.disconnect();
        clearTimeout(playerTimeout);
      });
    });
  }
}

export default voiceStateUpdate;
