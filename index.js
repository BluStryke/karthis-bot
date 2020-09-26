const Discord = require('discord.js')
const jsonfile = require('jsonfile')
const fs = require('fs')
const botconfig = require('./botconfig')
const colors = require('./colors')
const roles = require('./roles')

const client = new Discord.Client()

var saveData = {}
LoadJsonData()

client.on('raw', event => {
    if (event.t == 'GUILD_CREATE') {
        guildID = event.d.id
        const guildSaveData = saveData[guildID] = saveData[guildID] || { buffer:0, prefix:botconfig.prefix, welcomeChannel:0, goodbyeChannel:0, privateGreeting:`We're glad to have you!` }
        guildSaveData.welcomeChannel = guildSaveData.welcomeChannel || event.d.channel_id || guildSaveData.welcomeChannel
        guildSaveData.goodbyeChannel = guildSaveData.goodbyeChannel || event.d.channel_id || guildSaveData.goodbyeChannel
        SaveJsonData()
    }
    
    if (event.t === 'GUILD_MEMBER_ADD') {
        guildID = event.d.guild_id
        userID = event.d.user.id
        guildSaveData = saveData[guildID]
        guildSaveData[userID] = guildSaveData[userID] || { verifyMessage:0 }
        SaveJsonData()
        LoadJsonData()
        SendPrivateGreeting(guildID, userID)//`> Once you have read the rules, *introduce yourself* in <#754278008969363476>\n> You can verify yourself there to become an *official member*\n> If you have any questions about the mod, head to <#749978104445009941>\nThanks for joining us, and enjoy your stay`
        SendGreeting(guildID, userID)       
    }
    if (event.t === 'GUILD_MEMBER_REMOVE') {
        guildID = event.d.guild_id
        userID = event.d.user.id
        guildSaveData = saveData[guildID]
        SaveJsonData()
        LoadJsonData()
        client.users.fetch(userID).then(user => {
            farewellMessage = new Discord.MessageEmbed()
            .setColor(colors.error)
            .setDescription(`**${user.username} has left us,** farewell friend...`)
            client.channels.fetch(guildSaveData.goodbyeChannel, true).then(channel => {
                channel.send(farewellMessage).catch(err => console.log(err))
            }).catch(err => console.log(err))
        })
    }
    if (event.t === 'MESSAGE_REACTION_ADD') {
        guildID = event.d.guild_id
        userID = event.d.user.id
        var messageID = event.d.message_id
        var emoji = event.d.emoji.name
        if (userID in serverSaveData === false) {
            InitializeUserSaveData(serverSaveData, userID)
        }
        const userSaveData = serverSaveData[userID]
        client.guilds.fetch(guildID, true).then(guild => {
            client.channels.fetch(event.d.channel_id, true).then(channel => {
                channel.messages.fetch(messageID, true).then(msg => {
                    if (userSaveData.verifyMessage === messageID) {
                        VerifyMember(msg, userID, true)
                    }
                    if (messageID == 756048151818928189n) {
                        if (emoji === '❗') {
                            var roleToGive = roles.SpoilerNotifications
                        } else if (emoji === '🔥') {
                            var roleToGive = roles.ExtraChats
                        } else if (emoji === '👾') {
                            var roleToGive = roles.SpritingApprentice
                        } else if (emoji === '🎮') {
                            var roleToGive = roles.Tester
                        } else if (emoji === '📖') {
                            var roleToGive = roles.WikiEditor
                        } else if (emoji === '💚') {
                            var roleToGive = roles.Contributor
                        } else return
                        guild.member(userID).roles.add(roleToGive)
                    }  
                }).catch(err => console.log(err))
            }).catch(err => console.log(err))  
        }).catch(err => console.log(err))
    }
    if (event.t === 'MESSAGE_REACTION_REMOVE') {
        guildID = event.d.guild_id
        userID = event.d.user.id
        var messageID = event.d.message_id
        var emoji = event.d.emoji.name
        if (messageID == 756048151818928189n) {
            client.guilds.fetch(guildID, true).then(guild => {
                if (emoji === '❗') {
                    var roleToTake = roles.SpoilerNotifications
                } else if (emoji === '🔥') {
                    var roleToTake = roles.ExtraChats
                } else if (emoji === '👾') {
                    var roleToTake = roles.SpritingApprentice
                } else if (emoji === '🎮') {
                    var roleToTake = roles.Tester
                } else if (emoji === '📖') {
                    var roleToTake = roles.WikiEditor
                } else if (emoji === '💚') {
                    var roleToTake = roles.Contributor
                } else return
                guild.member(userID).roles.remove(roleToTake)
            }).catch(err => console.log(err))
        }
    }
    if (event.t === 'MESSAGE_CREATE') {
        guildID = event.d.guild_id
        userID = event.d.author.id
        guildSaveData = saveData[guildID]
        const prefix = guildSaveData.prefix
        client.channels.fetch(event.d.channel_id).then(channel => {
            channel.messages.fetch(event.d.id).then(msg => {
                if (msg.author.bot || msg.channel.type === 'dm') return
                const messageArray = msg.content.split(' ')
                const cmd = messageArray[0].toLowerCase()
                const args = messageArray.slice(1)
                args.forEach (function(arg) {
                    if (!args[arg] === undefined) args[arg].toLowerCase()
                })
                if (msg.content.startsWith(prefix)) {
                    const command = cmd.slice(prefix.length)
                    replyText = new Discord.MessageEmbed()
                    if (command === 'set-welcome' && !args[0]) {
                        guildSaveData.welcomeChannel = msg.channel.id
                        SaveJsonData()
                        replyText.setColor(colors.success)
                        replyText.setDescription(`${msg.channel.name} has been set as this server's welcome channel!`)
                        msg.channel.send(replyText)
                    }
                    if (command === 'set-goodbye' && !args[0]) {
                        guildSaveData.goodbyeChannel = msg.channel.id
                        SaveJsonData()
                        replyText.setColor(colors.success)
                        replyText.setDescription(`${msg.channel.name} has been set as this server's goodbye channel!`)
                        msg.channel.send(replyText)
                    }
                    if (command === 'set-privategreeting') {
                        var message
                        if (args[0] == 'KnightsGlory') {
                            message = `> Once you have read the rules, introduce yourself in #welcome\n> You can verify yourself there to become an official member\n> If you have any questions about the mod, head to #about-knight-glory\nThanks for joining us, and enjoy your stay`
                        } else message = args.join(' ')
                        SetPrivateGreeting(guildID, message)
                        replyText.setColor(colors.success)
                        replyText.setDescription(`New members will now recieve the following message:`)
                        msg.channel.send(replyText)
                        privateMessage = new Discord.MessageEmbed()
                        .setColor(colors.karthis)
                        .setTitle(`Hey ${msg.author.username}, welcome to ${msg.guild.name}`)
                        .setDescription(guildSaveData.privateGreeting)
                        msg.channel.send(privateMessage)
                    }
                    if (command === `verify`) { //Verify (user)
                        var selfVerified = true
                        if (!args[0]) var memberID = msg.author.id  
                        else {
                            var memberID = args[0].match(/(\d+)/)
                            memberID = memberID[0]
                            BigInt(memberID)
                            selfVerified = false
                        }
                        VerifyMember(msg, memberID, selfVerified)
                    }
                    //
                    //Admin Commands
                    if (!msg.member.roles.cache.has(roles.Admin)) return
                    if (command === `roles` && !args[0]) {
                        replyText.setColor(colors.karthis)
                        replyText.setTitle("React with an emoji below to select that role!")
                        replyText.addField(':exclamation: Spoiler Notifications', 'Opts you in to be pinged when new showcases and spoilers are released', true)
                        replyText.addField(':fire: Extra Chats', 'Get access to non mod-related chats like art-and-media, memes, rant, and off-topic', true)
                        replyText.addField(':space_invader: Spriting Apprentice', 'Will give u access to special spriters-only chats to receive feedback and tips', true)
                        replyText.addField(':video_game: Tester', 'Select to get pings every time a new item is ready to be beta-tested on Sand Bot', true)
                        replyText.addField(':book: Wiki Editor', 'If you help with the wiki give yourself this role ~~to show your dominance~~', true)
                        replyText.addField(':green_heart: Contributor', 'For those who want to help with things like ideas, music, code, or sprites', true)
                        msg.channel.send(replyText).then(msg => {
                            msg.react('❗')
                            msg.react('🔥')
                            msg.react('👾')
                            msg.react('🎮')
                            msg.react('📖')
                            msg.react('💚')
                        })
                    }
                }
            }).catch(err => console.log(err))
        }).catch(err => console.log(err))
    }
})

//Commands
async function VerifyMember(msg, memberID, selfVerified) { 
    _replyText = new Discord.MessageEmbed()
    GiveRole(msg.guild, memberID, roles.OG)//Remove upon release
    successStatus = await GiveRole(msg.guild, memberID, roles.Member)
    switch (successStatus) {
        case 'AlreadyHasRole':
            _replyText.setColor(colors.error)
            _replyText.setDescription(`${msg.guild.member(memberID).displayName} has already been verified`)
            break;
        case 'UserNotFound':
            _replyText.setColor(colors.error)
            _replyText.setDescription(`I couldn't find that user`)
            break;
        case 'Verified':
            _replyText.setColor(colors.success)
            _replyText.setDescription(`${msg.guild.member(memberID).displayName} has been verified`)
            break;
        case 'UserIsBot':
            _replyText.setColor(colors.error)
            _replyText.setDescription(`Bots cannot be verified`)
            break;
        default: 
            _replyText.setColor(colors.error)
            _replyText.setDescription("Something went wrong")
    }
    msg.channel.send(_replyText)
    msg.delete()
    if (successStatus === 'Verified') {
        client.users.fetch(memberID, true).then(member => {
            privateMessage = new Discord.MessageEmbed() 
            .setColor(colors.success)
            .setTitle(`${member.username} - Thank you for verifying!`)
            if (!selfVerified) {
                privateMessage.setTitle('You were verified by an admin!')
            }
            privateMessage.setDescription('You now have access to the rest of the server')
            member.send(privateMessage).catch(err => console.log(err))
        })
        .catch(err => console.log(err))
    }
}
//
//Functions
function LoadJsonData(){
    if (fs.existsSync('savedata.json')) {
        saveData = jsonfile.readFileSync('savedata.json')
    }
}
function SaveJsonData() { jsonfile.writeFileSync('savedata.json', saveData) }

function SetPrivateGreeting(_guildID, greeting) { 
    saveData[_guildID].privateGreeting = greeting 
    SaveJsonData()
}
function SendPrivateGreeting(_guildID, _userID) {
    _guildSaveData = saveData[_guildID]
    client.guilds.fetch(_guildID).then(guild => {
        client.users.fetch(_userID).then(user => {
            privateMessage = new Discord.MessageEmbed()
            .setColor(colors.karthis)
            .setTitle(`Hey ${user.username}, welcome to ${guild.name}`)
            .setDescription(_guildSaveData.privateGreeting)
            user.send(privateMessage).catch(err => console.log(err))
        }).catch(err => console.log(err))
    }).catch(err => console.log(err))
}
function SendGreeting(_guildID, _userID) {
    _guildSaveData = saveData[guildID]
    client.guilds.fetch(guildID, true).then(guild => {
        client.channels.fetch(_guildSaveData.welcomeChannel, true).then(channel => {
            channel.send(`${guild.member(_userID)} has joined us! Welcome!\n> (Member #${guild.memberCount})\n*react to this message to get member role*`).then(msg => {
                msg.react('👍')
                _guildSaveData[_userID].verifyMessage = msg.id
                SaveJsonData()
            }).catch(err => console.log(err))
        }).catch(err => console.log(err))
    }).catch(err => console.log(err))
}

async function GiveRole(guild, userID, role) {
    if (guild.members.cache.has(userID)){
        var isBot = false
        user = guild.member(userID)
        await client.users.fetch(userID, true).then(member => {
            if (member.bot) isBot = true
        })
        if (isBot) return 'UserIsBot'
        if (!user.roles.cache.has(role)) {
            user.roles.add(role)
            return 'Verified'
        } else return 'AlreadyHasRole'
    } else return 'UserNotFound' 
}
//
client.on('ready', () => {
    console.log(`${client.user.username} is online!`)
    client.user.setActivity('!!help', {type: ""})
})
client.login(botconfig.token)
