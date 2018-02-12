"use strict";
const Discord   = require('discord.js');
const fs        = require('fs');
const bot       = new Discord.Client();

// Get Auth token
try {
    var AuthDetails = require('./auth.json');
} catch(e) {
    console.log("Authorization file does not exist. Please create an auth file.");
    process.exit();
}

// Load Config data
var Config = {};
try {
    Config = require('./config.json');
} catch(e) {
    // No config file, use defaults
    // Additional defaults can be added here if needed. If you add more defaults, then be sure to add them to the config file as well.
    Config.commandPrefix = '!';
}

// Secondary check to make sure there is at minimum a command prefix
if(!Config.hasOwnProperty('commandPrefix')) {
    Config.commandPrefix = '!';
}

process.on('unhandledRejection', (reason, p) => {
    console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
});

// if(AuthDetails.hasOwnProperty("client_id")) {
//     commands["invite"] = {
//         public: false,
//         description: "generates an invite link you can use to invite the bot to your server. WARNING: This bot will only function on the Team Harmony server",
//         process: function(bot, msg, suffix) {
//             msg.channel.send("invite link: https://discordapp.com/oauth2/authorize?permissions=268950592&scope=bot&client_id=" + AuthDetails.client_id);
//         }
//     }
// }

function checkMessageForCommands(msg) {
    // Check if the message is a command
    if(msg.author.id != bot.user.id && (msg.content.startsWith(Config.commandPrefix))) {
        var cmdTxt = msg.content.split(/\s+/g)[0].substring(Config.commandPrefix.length).toLowerCase();
        var suffix = msg.content.substring(cmdTxt.length+Config.commandPrefix.length+1); // Adding prefix length and one for the space

        console.log("Command " + msg.content + " requested by " + msg.author.username);
        
        try {
            var cmd = cmdTxt;
            
            if (cmdTxt === 'help') {
                // Help is a little different since it iterates over all of the other commands
                if(suffix) {
                    var cmds = suffix.split(/\s+/g).filter(function(cmd){return commands[cmd]});
                    var info = "";
                    
                        for(var i=0;i<cmds.length;i++) {
                            var cmd = cmds[i];

                                info += "**"+Config.commandPrefix + cmd+"**";
                                var usage = commands[cmd].usage;
                                if(usage) {
                                    info += " " + usage;
                                }

                                var description = commands[cmd].description;
                                if(description instanceof Function) {
                                    description = description();
                                }
                                if(description) {
                                    info += "\n\t" + description;
                                }
                                info += "\n";
                        }
                    msg.channel.send(info);
                } else {
                    var info = "";
                    info += "**Available Commands:**\n";
                   
                    var sortedCommands = Object.keys(commands).sort();

                    for(var i in sortedCommands) {
                        // TODO: Add a check for cmd.public to see if it should be accessible by everybody. If not, then check for permissions against current user
                        // to see if they have minimum (define minimum) permissions to perform command. 
                        var cmd = sortedCommands[i];
                        
                        console.log(cmd.public);

                        if(commands[cmd].public) {
                            info += "**" + Config.commandPrefix + cmd + "** ";
                        
                            var usage = commands[cmd].usage;
                            if(usage) { // If there is anything in usage
                                info += " " + usage + "\n";
                            } else {
                                info += "\n";
                            }
                            var description = commands[cmd].description;
                            if(description instanceof Function) {
                                description = description();
                            }
                            if(description) {
                                info += description + "\n\n";
                            }
                        }
                    }
                    console.log(info);
                    msg.author.send(info);
                }
            } else if(cmd) {
                try {

                    if(cmd.startsWith('../')) {
                        //Make sure users can't find extra files on the server
                        cmd = cmd.replace(/(\.\.\/)+/g, "");
                        console.log('User tried to search for folders!!!! We removed the malicious code')
                        return msg.channel.send('Tisk Tisk Tisk... Why do you want to do that?');
                    }

                    fs.accessSync(`./commands/${cmd}.js`, fs.constants.R_OK);
                    console.log(`I can see ${cmd}.js!`);
                    cmd = require(`./commands/${cmd}.js`);
                    cmd.process(bot,msg,suffix);
                } catch (err) {
                    msg.channel.send("I'm sorry, that command does not exist :/. " + err);
                }
            }
  
        } catch(e) {
            msg.channel.send("I am sorry, there was an issue executing that command.");
            console.log("Error with command: " + e);
            return;
        }
    }
}

String.prototype.ucfirst = function() {
    return this.charAt(0).toUpperCase() + this.substr(1).toLowerCase();
}

function fetchMember(msg) {
    msg.guild.fetchMember(msg.author)
    .then(member => {
        return member._roles;
    })
}

bot.on('ready', () => {
    console.log("Logged In! Serving in " + bot.guilds.array().length + " servers");
    bot.user.setPresence({
        game: {
            name: Config.commandPrefix + 'help for commands',
            type: 0
        }
    })
    .then(console.log("Presence Set!"))
    .catch(console.error)
});

bot.on('disconnected', () => {
    console.log("Disconnected!");
    process.exit(1);
});

bot.on('message', (msg) => checkMessageForCommands(msg));
bot.on('messageUpdate', (oMsg, nMsg) => {
    checkMessageForCommands(nMsg);
});

bot.login(AuthDetails.token)
.catch(err => {
    console.log("Something bad happened!", err);
})