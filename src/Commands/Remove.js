import { removeIntroMusic } from './../Storage/Storage.js'
import { doCommandWithRateLimit } from './CommandWrapper.js'

export async function remove(messageHook) {
  const method = async () => {
    await removeIntroMusic(messageHook.author.id)
    messageHook.reply('Removed your preference!')
  }

  doCommandWithRateLimit(messageHook, method)
}
