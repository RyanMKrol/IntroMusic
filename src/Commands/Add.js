import { storeIntroMusic } from './../Storage/Storage.js'
import { doCommandWithRateLimit } from './CommandWrapper.js'

export async function add(messageHook, youtubeLink) {
  const method = async () => {
    await storeIntroMusic(messageHook.author.id, youtubeLink)
    messageHook.reply('Added your new intro music!')
  }

  doCommandWithRateLimit(messageHook, method)
}
