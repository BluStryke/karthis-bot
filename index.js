const Discord = require('discord.js')
const botconfig = require('./botconfig.json')
const colors = require('./colors.json')
const getRoleID = require('./roles.json')
const fs = require('fs')
const jsonfile = require('jsonfile')
const client = new Discord.Client()
const prefix = botconfig.prefix

var saveData = {}
var items = {}

LoadJsonData()

client.on('raw', event => {
    if (!event.d == null) var guildID = event.d.guild_id
    if (guildID in saveData === false) {
        saveData[guildID] = {}
    }
    const serverSaveData = saveData[guildID]

    var eventName = event.t
    if (eventName === 'GUILD_MEMBER_ADD') {
        var userID = event.d.user.id
        guildID = event.d.guild_id
        if (userID in serverSaveData === false) {
            InitializeUserSaveData(serverSaveData, userID)
        }
        const userSaveData = serverSaveData[userID]

        client.users.fetch(userID).then(user => {
            privateMessage = new Discord.MessageEmbed()
            .setColor(colors.success)
            .setTitle(`Hey ${user.username}, welcome to **Knight's Glory Mod**`)
            .setDescription(`> Once you have read the rules, *introduce yourself* in <#754278008969363476>\n> You can verify yourself there to become an *official member*\n> If you have any questions about the mod, head to <#749978104445009941>\nThanks for joining us, and enjoy your stay`)
            user.send(privateMessage).catch(err => console.log(err))
        })
        client.guilds.fetch(guildID, true).then(guild => {
            client.channels.fetch(754278008969363476n, true).then(channel => {
                channel.send(`${guild.member(userID)} has joined us! Welcome!\n> (Member #${guild.memberCount})\n*react to this message to get member role*`).then(msg => {
                    msg.react('👍')
                    userSaveData.verifyMessage = msg.id
                    SaveJsonData()
                }).catch(err => console.log(err))
            }).catch(err => console.log(err))
        }).catch(err => console.log(err))
    }
    if (eventName === 'GUILD_MEMBER_REMOVE') {
        var userID = event.d.user.id
        client.users.fetch(userID).then(user => {
            farewellMessage = new Discord.MessageEmbed()
            .setColor(colors.error)
            .setDescription(`**${user.username} has left us,** farewell friend...`)
            client.channels.fetch(749976425712451696n, true).then(channel => {
                channel.send(farewellMessage).catch(err => console.log(err))
            }).catch(err => console.log(err))
        })
    }
    if (eventName === 'MESSAGE_REACTION_ADD') {
        var messageID = event.d.message_id
        var userID = event.d.user_id
        var guildID = event.d.guild_id
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
                            var roleToGive = getRoleID.SpoilerNotifications
                        } else if (emoji === '🔥') {
                            var roleToGive = getRoleID.ExtraChats
                        } else if (emoji === '👾') {
                            var roleToGive = getRoleID.SpritingApprentice
                        } else if (emoji === '🎮') {
                            var roleToGive = getRoleID.Tester
                        } else if (emoji === '📖') {
                            var roleToGive = getRoleID.WikiEditor
                        } else if (emoji === '💚') {
                            var roleToGive = getRoleID.Contributor
                        } else return
                        guild.member(userID).roles.add(roleToGive)
                    }  
                }).catch(err => console.log(err))
            }).catch(err => console.log(err))  
        }).catch(err => console.log(err))
    }
    if (eventName === 'MESSAGE_REACTION_REMOVE') {
        var messageID = event.d.message_id
        var userID = event.d.user_id
        var guildID = event.d.guild_id
        var emoji = event.d.emoji.name
        if (messageID == 756048151818928189n) {
            client.guilds.fetch(guildID, true).then(guild => {
                if (emoji === '❗') {
                    var roleToTake = getRoleID.SpoilerNotifications
                } else if (emoji === '🔥') {
                    var roleToTake = getRoleID.ExtraChats
                } else if (emoji === '👾') {
                    var roleToTake = getRoleID.SpritingApprentice
                } else if (emoji === '🎮') {
                    var roleToTake = getRoleID.Tester
                } else if (emoji === '📖') {
                    var roleToTake = getRoleID.WikiEditor
                } else if (emoji === '💚') {
                    var roleToTake = getRoleID.Contributor
                } else return
                guild.member(userID).roles.remove(roleToTake)
            }).catch(err => console.log(err))
        }
    }
})

client.on('message', msg => {
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
        //Help Commands
        if (command === `help`) {
            replyText.setTitle("Here are the types of commands you can do")
            replyText.setDescription("!!General Commands\n!!Profile Commands\n!!Market Commands\n!!Dungeon Commands\n!!Guild Commands")
            msg.channel.send(replyText)
        }
        if (command === `general` && args[0] === 'commands') {
            replyText.setTitle("Here are all the general commands")
            replyText.setDescription("!!verify")
            msg.channel.send(replyText)
        }
        if (command === `profile` && args[0] === 'commands') {
            replyText.setTitle("Here are all the profile commands")
            replyText.setDescription("!!profile\n!!gold\n!!inventory\n!!level\n!!use\n!!trash")
            msg.channel.send(replyText)
        }
        if (command === `market` && args[0] === 'commands') {
            replyText.setTitle("Here are all the market commands")
            replyText.setDescription("!!browse\n!!sell\n!!post\n!!buy\n!!give")
            msg.channel.send(replyText)
        }
        if (command === `dungeon` && args[0] === 'commands') {
            replyText.setTitle("Here are all the dungeon commands")
            replyText.setDescription("!!raid\n!!retreat")
            msg.channel.send(replyText)
        }
        if (command === `guild` && args[0] === 'commands') {
            replyText.setTitle("Here are all the guild commands")
            replyText.setDescription("Guilds will be on hold until I implement everything else")
            msg.channel.send(replyText)
        }
        //General Commands
        //
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
        //Profile Commands
        //
        if (command === `profile` && !args[0]) {//profile user
            replyText.setDescription("This will show an overview of your profile... eventually")
            msg.channel.send(replyText)
        }
        if (command === `gold` && !args[0]) {//gold user
            replyText.setDescription("This will show how much gold you have... eventually")
            msg.channel.send(replyText)
        }
        if (command === `inventory` && !args[0]) {//inventory user
            replyText.setDescription("This will show you your inventory... eventually")
            msg.channel.send(replyText)
        }
        if (command === `level` && !args[0]) {//level user
            replyText.setDescription("This will tell you your level... eventually")
            msg.channel.send(replyText)
        }
        if (command === `use` && !args[0]) {//use item
            replyText.setDescription("This will let you use items you own... eventually")
            msg.channel.send(replyText)
        }
        if (command === `trash` && !args[0]) {//trash item amount
            replyText.setDescription("This will let you throw away items you no longer want... eventually")
            msg.channel.send(replyText)
        }
        //Market Commands
        //
        if (command === `browse` && !args[0]) {
            replyText.setDescription("This will show you the available things to buy... eventually")
            msg.channel.send(replyText)
        }
        if (command === `sell` && !args[0]) {//sell item amount
            replyText.setDescription("This will let you sell items at the market... eventually")
            msg.channel.send(replyText)
        }
        if (command === `post` && !args[0]) {//post item amount price
            replyText.setDescription("This will let you post items on the market for sale to other members... eventually")
            msg.channel.send(replyText)
        }
        if (command === `buy` && !args[0]) {//buy item
            replyText.setDescription("This will let you buy items from the market... eventually")
            msg.channel.send(replyText)
        }
        if (command === `give` && !args[0]) {//give user item amount
            replyText.setDescription("This will let you give away your items to other members... eventually")
            msg.channel.send(replyText)
        }
        //Dungeon Commands
        //
        if (command === `raid` && !args[0]) {
            replyText.setDescription("This will let you enter the dungeon and begin a raiding session... eventually")
            msg.channel.send(replyText)
        }
        if (command === `retreat` && !args[0]) {
            replyText.setDescription("This will let you attempt to leave the dungeon to escape with your loot... eventually")
            msg.channel.send(replyText)
        }
        //Guild Gommands
        //
        if (command === `apply` && !args[0]) {//apply guild
            replyText.setDescription("This will let you apply to join a guild... eventually")
            msg.channel.send(replyText)
        }
        if (command === `leave` && !args[0]) {//apply guild
            replyText.setDescription("This will let you leave your guild... eventually")
            msg.channel.send(replyText)
        }
        //Admin Commands
        if (!msg.member.roles.cache.has(getRoleID.Admin)) return
        if (command === `roles` && !args[0]) {//purge amount
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

        if (command === `purge` && !args[0]) {//purge amount
            replyText.setDescription("This delete messages... eventually")
            msg.channel.send(replyText)
        }
        if (command === `grant` && !args[0]) {//apply guild
            replyText.setDescription("This will generate items with magic... eventually")
            msg.channel.send(replyText)
        }
        if (command === `take` && !args[0]) {//apply guild
            replyText.setDescription("This will take items away from other members... eventually")
            msg.channel.send(replyText)
        }
        //grant user gold amount
        //grant user item amount
        //grant gold amount
        //grant item amount
    }
})

//Commands
async function VerifyMember(msg, memberID, selfVerified) { 
    _replyText = new Discord.MessageEmbed()
    GiveRole(msg.guild, memberID, getRoleID.OG)//Remove upon release
    successStatus = await GiveRole(msg.guild, memberID, getRoleID.Member)
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
    if (fs.existsSync('items.json')) {
        items = jsonfile.readFileSync('items.json')
    }
}
function SaveJsonData(){
    jsonfile.writeFileSync('savedata.json', saveData)
}
function InitializeUserSaveData(_serverSaveData, _userID){
    _serverSaveData[_userID] = {
        verifyMessage: 0
        /*xp: 0,
        level: 0,
        last_message: 0,
        inventory: [[0,5],[1,1]],
        equipment: {
            hand: 'empty',
            secondary: 'empty',
            head: 'empty',
            body: 'empty',
            legs: 'empty',
            feet: 'empty'
        },
        dungeonStats: {
            inDungeon: false,
            floor: 0,
            maxHealth: 100,
            health: 100
        },
        guildStats: {
            inGuild: false,
            guild: 'none',
            rank: 'none'
        }*/
    }
    SaveJsonData()
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
function getItemID(item) {
    switch (item) {
        case 'gold':
            return 0
        case 'paperbadge':
            return 1
        case 'woodenbadge':
            return 2
        case 'ironbadge':
            return 3
        case 'copperbadge':
            return 4
        case 'silverbadge':
            return 5
        case 'goldbadge':
            return 6
        case 'platinumbadge':
            return 7
        case 'nightmarebadge':
            return 8
        case 'academyinvitation':
            return 9
        case 'whiteraffleticket':
            return 10
        case 'greenraffleticket':
            return 11
        case 'helmetwrit':
            return 12
        case 'chestplatewrit':
            return 13
        case 'greaveswrit':
            return 14
        default: return item
    }  
}
//

client.on('ready', () => {
    console.log(`${client.user.username} is online!`)
    client.user.setActivity('!!help', {type: ""})
})
client.login(botconfig.token)