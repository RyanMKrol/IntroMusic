import {
  COMMAND_PREFIX,
  COMMAND_REMOVE,
  COMMAND_ADD,
} from './../Utils/Constants.js'

export async function defaultCommand(messageHook, command) {
  await messageHook.reply(
    `This command (\`${COMMAND_PREFIX}${command}\`) isn't supported, please use one of:\n` +
      `- \`${COMMAND_PREFIX}${COMMAND_ADD} <youtube_link>\`\n` +
      `- \`${COMMAND_PREFIX}${COMMAND_REMOVE}\``
  )

  return
}
