"use strict";
var Discord = require('discord.js');
var fs      = require('fs');
var bot     = new Discord.Client();

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
    // Additional defaults can be added here if needed
    Config.commandPrefix = '!';
    Config.chanMinTime = 1;
    Config.chanMaxTime = 90;
}

// Secondary check to make sure there is at minimum a command prefix
if(!Config.hasOwnProperty('commandPrefix')) {
    Config.commandPrefix = '!';
}

var commands = {
    'iam': {
        public: true,
        usage: '<team>',
        description: "Add a team role (Mystic, Instint, or Valor) to yourself. If you are already assigned a team role then you must get a Moderator to help you.",
        process: function(bot, msg, suffix) {
            console.log(msg.channel.name);
            var chan = msg.channel;
            if(chan != msg.guild.channels.find('name', 'team-assignment')) {
                console.log(msg.channel.name + " is not equal to team-assignment");
                msg.author.send("Please send team requests in the " + msg.guild.channels.find('name', 'team-assignment') + " channel");
                return; //Requesting role in the wrong channel
            }

            var args = suffix.split(/\s+/g);
            
            var role = args.shift();
            role = role.ucfirst();
            role = msg.guild.roles.find('name', role);
            
            var member = msg.member;
            console.log(role.name);
            var editable = checkForRole(msg, role);
            
            if(editable != true) {
                msg.channel.send(msg.author + " Adding " + role + " was unsuccessful. You are already a member of a Team role. If you need to swap roles for any reason please reach out to an " + msg.guild.roles.find('name', 'Officer Jenny') + ".");
                return;
            }
            try {
                member.addRole(role);
                msg.channel.send("Adding " + role + " to " + msg.author);
            } catch (e) {
                console.log("There was an error: " + e);
            }
        }
    },
    "rolecount": {
        public: true,
        description: "User count of each Role.",
        process: function(bot, msg, suffix) {
            
            var roles = msg.guild.roles;

            var txt = ""
            roles.forEach(function(val, ind) {
                if(val.name === "Mystic" || val.name === "Valor" || val.name === "Instinct") {
                    txt += val.name + " - " + val.members.size + "\n";
                }
            });
            msg.author.send(txt);
        }
    },
    "chan": {
        //TODO: In progress: Add logic to create a temporary channel then add some sort of a script to go back and check delete the channel afterwards.
        public: false,
        usage: "<pokemon> <location-name> <duration>",
        description: "Create a temporary text channel intended for collaberating on gym specific raids. Max channel creation time is 90 minutes.",
        process: function(bot, msg, suffix) {
            var args = suffix.split(/\s+/g);
            var pokemon = args[0];
            var location = args[1];
            var duration = args[2];

            var channelName = pokemon + "-" + location;
            
            if(args.length > 3) {
                return msg.channel.send(msg.author + " I think something was entered wrong when writing the command. Please type .chan <pokemon> <location> <duration> to create a temporary channel. When entering the location, make sure there are no additional spaces. If the location is multiple words, please use a hyphen instead");
            }

            if(!Number.isInteger(duration) && duration < Config.chanMinTime && duration > Config.chanMaxTime) {
                return msg.channel.send(msg.author + " The duration you entered was not valid. Please enter a duration of minutes between 1 and 90");
            }
            // TODO: add channel information here so we know what channel to terminate later.
            var channelData = "";

            msg.guild.createChannel(channelName, 'text')
                .then(
                    msg.author.send(msg.author + ' your channel has been created. This channel will expire in ${duration} minutes'),
                    
                    fs.writeFile('/data', channelData, function(err) {
                        if(err) {
                            console.log(err);
                        }
                    })
                    
            ).catch(console.error);
        }
    }
}

if(AuthDetails.hasOwnProperty("client_id")) {
    commands["invite"] = {
        public: false,
        description: "generates an invite link you can use to invite the bot to your server. WARNING: This bot will only function on the Team Harmony server",
        process: function(bot, msg, suffix) {
            msg.channel.send("invite link: https://discordapp.com/oauth2/authorize?permissions=268950592&scope=bot&client_id=" + AuthDetails.client_id);
        }
    }
}

function checkMessageForCommands(msg) {
    // Check if the message is a command
    if(msg.author.id != bot.user.id && (msg.content.startsWith(Config.commandPrefix))) {
        console.log("Command " + msg.content + " requested from " + msg.author.username);
        var cmdTxt = msg.content.split(/\s+/g)[0].substring(Config.commandPrefix.length).toLowerCase();
        var suffix = msg.content.substring(cmdTxt.length+Config.commandPrefix.length+1); // Adding prefix length and one for the space
        
        try {
            var cmd = commands[cmdTxt];
            
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
                cmd.process(bot,msg,suffix);
            }

            
        } catch(e) {
            msg.channel.send("I am sorry, there was an issue with that command.");
            return;
        }
    }
}

function checkForRole(msg, role) {
    // Set static roles
    var teams = ['Instinct', 'Mystic', 'Valor'];
    var addable = true;

    // Check if the role they are requesting is part of the static roles
    if (teams.includes(role.name)) {
        // If it is, check if they already have one of the roles.
        teams.forEach(function(role) {
            var hasRole = msg.member.roles.exists('name', role);
            
            if(hasRole) {
                console.log(msg.author.username + ' has the role ' + role + " and cannot be added to another Team role.");
                addable = false;
                return false;
            }
        }, this);
    }
    return addable;
}

String.prototype.ucfirst = function() {
    return this.charAt(0).toUpperCase() + this.substr(1).toLowerCase();
}

// TODO: Add a function to check the file for channels that need to be terminated and terminate any that need to go.

bot.on('ready', () => {
    console.log("Logged In! Serving in " + bot.guilds.array().length + " servers");
    bot.user.setGame(".help for commands!")
        .then(console.log("Game set!"))
        .catch(console.error);
    bot.user.showCurrentGame = true;
});

bot.on('disconnected', () => {
    console.log("Disconnected!");
    process.exit(1);
});

bot.on('message', (msg) => checkMessageForCommands(msg));
bot.on('messageUpdate', (oMsg, nMsg) => {
    checkMessageForCommands(nMsg);
});

bot.login(AuthDetails.token);