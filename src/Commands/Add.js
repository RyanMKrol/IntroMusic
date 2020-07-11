import ytdl from 'ytdl-core-discord'

import { COMMAND_PREFIX, COMMAND_ADD } from './../Utils/Constants.js'
import { storeIntroMusic } from './../Storage/Storage.js'
import { doCommandWithRateLimit } from './CommandWrapper.js'

export async function add(messageHook, args) {
  if (!(await validatedArgs(messageHook, args))) return

  const method = async () => {
    await storeIntroMusic(messageHook.author.id, args[0])
    await messageHook.reply('Added your new intro music!')
  }

  await doCommandWithRateLimit(messageHook, method)
}

async function validatedArgs(messageHook, args) {
  if (args.length !== 1) {
    await messageHook.reply(
      `The command format is incorrect, please use the following format: \n\`${COMMAND_PREFIX}${COMMAND_ADD} <youtube_link>\``
    )
    return false
  }

  if (!(await ytdl.validateURL(args[0]))) {
    await messageHook.reply(
      "Sorry, we couldn't recognise your link as a valid youtube video!"
    )
    return false
  }

  const information = await ytdl.getInfo(args[0])
  const isAvailable = information.formats.length > 0

  if (!isAvailable) {
    await messageHook.reply(
      "Sorry, could not add your video, it doesn't appear to be available!"
    )
    return false
  }

  return true
}
