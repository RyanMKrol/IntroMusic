import { COMMAND_PREFIX } from '../constants';

/**
 * Method to handle when the bot is added to a server
 *
 * @param {module:app.Guild} guild The guild that the bot has been added to
 */
async function onGuildCreate(guild) {
  guild.channels.cache
    .find((t) => t.name === 'general')
    .send(
      'Thanks for inviting my bot! You can use it via the following commands:\n'
        + `- \`${COMMAND_PREFIX} add -link <youtube_link>\`\n`
        + `- \`${COMMAND_PREFIX} add -link <youtube_link> -start <start_seconds>\`\n`
        + `- \`${COMMAND_PREFIX} add -link <youtube_link> -runtime <runtime_seconds>\`\n`
        + `- \`${COMMAND_PREFIX} add -link <youtube_link> -start <start_seconds> -runtime <runtime_seconds>\`\n`
        + `- \`${COMMAND_PREFIX} remove\``,
      +'Note: only the first 10 seconds of the video you pick will play, so choose wisely.',
    );
}

export default onGuildCreate;
