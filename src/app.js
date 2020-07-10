import Discord from 'discord.js'
import { getClientToken } from './Utils/GetClientToken.js'
import { COMMAND_ADD, COMMAND_REMOVE } from './Utils/Constants.js'

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
    // do something to add
  } else if (command === COMMAND_REMOVE) {
    // do something to remove
  } else {
    message.reply(
      `This command isn't supported, please use either !intro${COMMAND_ADD}, or !intro${COMMAND_REMOVE}`
    )
  }
})

getClientToken().then((token) => {
  client.login(token)
})
