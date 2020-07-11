import { removeIntroMusic } from './../Storage/Storage.js'
import { doCommandWithRateLimit } from './CommandWrapper.js'
import { COMMAND_PREFIX, COMMAND_REMOVE } from './../Utils/Constants.js'

export async function remove(messageHook, args) {
  if (args.length !== 0) {
    await message.reply(
      `The command format is incorrect, please use the following format: \n\`${COMMAND_PREFIX}${COMMAND_REMOVE}\``
    )
    return
  }

  const method = async () => {
    await removeIntroMusic(messageHook.author.id)
    await messageHook.reply('Removed your preference!')
  }

  await doCommandWithRateLimit(messageHook, method)
}
