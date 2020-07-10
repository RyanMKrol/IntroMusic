import Discord from 'discord.js'
import ytdl from 'ytdl-core'
import { readJsonFile } from './Utils/ReadJsonFile.js'
import { isUndefined } from './Utils/IsUndefined.js'
import {
  COMMAND_ADD,
  COMMAND_REMOVE,
  DISCORD_TOKEN_FILE_LOCATION,
} from './Utils/Constants.js'
import {
  storeIntroMusic,
  fetchIntroMusic,
  removeIntroMusic,
} from './Storage/Storage.js'

const client = new Discord.Client()

const commandPrefix = '!intro'

client.on('ready', async () => {
  console.log(`Logged in as ${client.user.tag}!`)
})

client.on('message', async (message) => {
  // message.author.id - the user ID to store in the database

  // ignore any messages not prefixed, or by a bot
  if (!message.content.startsWith(commandPrefix) || message.author.bot) return

  const args = message.content.slice(commandPrefix.length).split(' ')
  const command = args.shift()

  if (command === COMMAND_ADD) {
    if (args.length !== 1) {
      message.reply(
        'The command format is incorrect, please use the following format: \n`!intro<Command> <youtube link>`'
      )
    } else {
      await storeIntroMusic(message.author.id, args[0])
      message.reply('Stored your preference!')
    }
  } else if (command === COMMAND_REMOVE) {
    await removeIntroMusic(message.author.id)
    message.reply('Removed your preference!')
  } else {
    message.reply(
      `This command (\`${commandPrefix}${command}\`) isn't supported, please use one of:\n` +
        `* \`${commandPrefix}${COMMAND_ADD}\`\n` +
        `* \`${commandPrefix}${COMMAND_REMOVE}\``
    )
  }
})

client.on('voiceStateUpdate', async (oldState, newState) => {
  let oldUserChannel = oldState.channelID
  let newUserChannel = newState.channelID

  if (
    isUndefined(oldUserChannel) &&
    !isUndefined(newUserChannel) &&
    !newState.member.user.bot
  ) {
    const introMusicData = await fetchIntroMusic(newState.member.user.id)

    if (introMusicData.Count !== 1) return

    newState.channel.join().then((connection) => {
      const stream = ytdl(introMusicData.Items[0].link, {
        filter: 'audioonly',
      })
      const dispatcher = connection.play(stream)
    })
  }
})

readJsonFile(DISCORD_TOKEN_FILE_LOCATION).then((data) => {
  client.login(data.token)
})
