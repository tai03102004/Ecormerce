'use strict'

const {
    Client,
    GatewayIntentBits
} = require('discord.js')
const {
    DISCORD_CHANNEL_ID,
    DISCORD_BOT_TOKEN
} = process.env

class LoggerService {
    constructor() {
        this.client = new Client({
            intents: [
                GatewayIntentBits.DirectMessages,
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.MessageContent
            ]
        })
        // add channel id
        this.channelId = DISCORD_CHANNEL_ID
        this.client.on('ready', () => {
            console.log('Bot is ready!')
        })

        this.client.login(DISCORD_BOT_TOKEN).catch(console.error)

    }

    sendToMessage(message = 'message') {
        const channel = this.client.channels.cache.get(this.channelId)
        if (!channel) {
            console.error('Channel not found!', this.channelId)
            return
        }
        channel.send(message).catch(e => console.error(e))
    }

    sendToFormatCode(logData) {
        const {
            code,
            message = 'This is some addtional about the code. ',
            title = 'Log Data'
        } = logData

        console.log("LogData:", logData)

        const codeMessage = {
            content: message,
            embeds: [{
                color: parseInt('OOff00', 16),
                title,
                description: '```json\n' + JSON.stringify(code, null, 2) + '\n```',
                timestamp: new Date().toISOString()
            }]
        }
        const channel = this.client.channels.cache.get(this.channelId)
        if (!channel) {
            console.error('Channel not found!', this.channelId)
            return
        }
        channel.send(codeMessage).catch(e => console.error(e))
    }
}

// const loggerService = new LoggerService()

module.exports = new LoggerService()