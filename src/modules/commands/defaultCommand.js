import { COMMAND_PREFIX, COMMAND_REMOVE, COMMAND_ADD } from '../constants';

const IS_BOT_COMMAND_REGEX = `${COMMAND_PREFIX} .*`;

/**
 * Handles any command not caught by the previous processing
 *
 * @param {module:app.Message} messageHook The hook that contains the command being used
 * @returns {boolean} Whethe the message was handled by this handler
 */
async function defaultCommand(messageHook) {
  const command = messageHook.content;

  if (!isBotCommand(command)) return false;

  await messageHook.reply(
    `This command (\`${command}\`) isn't supported, please use one of:\n`
      + `- \`${COMMAND_PREFIX} ${COMMAND_ADD} <youtube_link>\`\n`
      + `- \`${COMMAND_PREFIX} ${COMMAND_REMOVE}\``,
  );

  return true;
}

/**
 * Verifies that the current command belongs to this bot
 *
 * @param {string} command The command being used
 * @returns {boolean} Whether the command belongs to our bot or not
 */
function isBotCommand(command) {
  const isBotCommandPattern = new RegExp(IS_BOT_COMMAND_REGEX);
  return command.match(isBotCommandPattern);
}

export default defaultCommand;
