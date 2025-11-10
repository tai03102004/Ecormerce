'use strict'

const {
    Client,
    GatewayIntentBits
} = require('discord.js')
const clients = new Client({
    intents: [GatewayIntentBits.DirectMessages, GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
})

clients.once('ready', () => {
    console.log('Bot is ready!')
})
const token = process.env.DISCORD_BOT_TOKEN
clients.login(token).catch(console.error)
clients.on('messageCreate', async message => {
    if (message.author.bot) return
    if (message.content === 'ping') {
        message.channel.send('pong')
    }
})