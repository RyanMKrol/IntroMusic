import Discord from 'discord.js'
import ytdl from 'ytdl-core'
import { readJsonFile } from './Utils/ReadJsonFile.js'
import { isUndefined } from './Utils/IsUndefined.js'
import PlayerState from './Utils/PlayerState.js'
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
import { defaultCommand } from './Commands/DefaultCommand.js'

const client = new Discord.Client()
let isClientPlaying = false

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
  // ignore any messages not prefixed with our command prefix, or messages made by a bot
  if (!message.content.startsWith(COMMAND_PREFIX) || message.author.bot) return

  const args = message.content.slice(COMMAND_PREFIX.length).split(' ')
  const command = args.shift()

  if (command === COMMAND_ADD) {
    add(message, args)
  } else if (command === COMMAND_REMOVE) {
    remove(message, args)
  } else {
    defaultCommand(message, command)
  }
})

// handles playing the video when somebody joins the server
client.on('voiceStateUpdate', async (oldState, newState) => {
  const playerState = new PlayerState()

  let newUserChannel = newState.channelID
  let oldUserChannel = oldState.channelID

  if (
    isUndefined(oldUserChannel) &&
    !isUndefined(newUserChannel) &&
    !newState.member.user.bot &&
    !playerState.isPlaying()
  ) {
    playerState.setIsPlaying(true)
    const introMusicData = await fetchIntroMusic(newState.member.user.id)

    if (introMusicData.Count !== 1) return

    newState.channel.join().then(async (connection) => {
      const stream = await ytdl(introMusicData.Items[0].link)

      const dispatcher = await connection.play(stream, {
        volume: 0.5,
      })

      const playerTimeout = setTimeout(async function () {
        if (playerState.isPlaying()) {
          playerState.setIsPlaying(false)
          await connection.disconnect()
        }
      }, MAX_PLAY_TIME)

      dispatcher.on('finish', async () => {
        playerState.setIsPlaying(false)
        clearTimeout(playerTimeout)
        await connection.disconnect()
      })
    })
  }
})

readJsonFile(DISCORD_TOKEN_FILE_LOCATION).then((data) => {
  client.login(data.token)
})
