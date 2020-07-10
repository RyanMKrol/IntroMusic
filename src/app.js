import Discord from 'discord.js'
import { getClientToken } from './Utils/GetClientToken.js'

const client = new Discord.Client()

client.on('ready', async () => {
  console.log(`Logged in as ${client.user.tag}!`)
})

client.on('message', async (message) => {
  if (message.content === 'ping') {
    message.reply('pong')
  }
})

getClientToken().then((token) => {
  client.login(token)
})
