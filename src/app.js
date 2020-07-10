import Discord from 'discord.js'
import ytdl from 'ytdl-core'
import { readJsonFile } from './Utils/ReadJsonFile.js'
import { isUndefined } from './Utils/IsUndefined.js'
import {
  COMMAND_ADD,
  COMMAND_REMOVE,
  DISCORD_TOKEN_FILE_LOCATION,
  COMMAND_PREFIX,
  MAX_PLAY_TIME,
} from './Utils/Constants.js'
import { fetchIntroMusic } from './Storage/Storage.js'
import { add } from './Commands/Add.js'
import { remove } from './Commands/Remove.js'

const client = new Discord.Client()

client.on('ready', async () => {
  console.log(`Logged in as ${client.user.tag}!`)
})

client.on('guildCreate', async (guild) => {
  guild.channels.cache
    .find((t) => t.name == 'general')
    .send(
      `Thanks for inviting my bot! You can use it via the following commands:\n` +
        `- \`${COMMAND_PREFIX}${COMMAND_ADD} <youtube_link>\`\n` +
        `- \`${COMMAND_PREFIX}${COMMAND_REMOVE}\`\n` +
        `Note: only the first 10 seconds of the video you pick will play, so choose wisely.`
    )
})

// handles adding/removing intro music
client.on('message', async (message) => {
  // ignore any messages not prefixed, or by a bot
  if (!message.content.startsWith(COMMAND_PREFIX) || message.author.bot) return

  const args = message.content.slice(COMMAND_PREFIX.length).split(' ')
  const command = args.shift()

  if (command === COMMAND_ADD) {
    if (args.length !== 1) {
      message.reply(
        `The command format is incorrect, please use the following format: \n\`${COMMAND_PREFIX}<Command> <youtube link>\``
      )
    } else {
      add(message, args[0])
    }
  } else if (command === COMMAND_REMOVE) {
    if (args.length !== 0) {
      message.reply(
        `The command format is incorrect, please use the following format: \n\`${COMMAND_PREFIX}${COMMAND_REMOVE}\``
      )
    } else {
      remove(message)
    }
  } else {
    message.reply(
      `This command (\`${COMMAND_PREFIX}${command}\`) isn't supported, please use one of:\n` +
        `- \`${COMMAND_PREFIX}${COMMAND_ADD}\`\n` +
        `- \`${COMMAND_PREFIX}${COMMAND_REMOVE}\``
    )
  }
})

// handles playing the video when somebody joins the server
client.on('voiceStateUpdate', async (oldState, newState) => {
  let newUserChannel = newState.channelID
  let oldUserChannel = oldState.channelID

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

      setTimeout(function () {
        dispatcher.pause()
      }, MAX_PLAY_TIME)
    })
  }
})

readJsonFile(DISCORD_TOKEN_FILE_LOCATION).then((data) => {
  client.login(data.token)
})
