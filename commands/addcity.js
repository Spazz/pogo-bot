const dym = require('didyoumean');

exports.public =  true;
exports.usage = '<city role>';
exports.description = "Add a city role to yourself. You can add multiple cities at one time by separating them by commas.";
exports.process = function(bot, msg, suffix) {
    if (!suffix) {
        console.log(msg.author.username + " did not designate any cities.");
        return msg.channel.send(`${msg.author} You did not provide any cities. Please use .addcity <city> separated by comma's to be assigned to their roles.`);
    }

    try {
        var config = {};
        var config = require('../config.json');
        var bannedRoles = config.bannedRoles;
        var chan = msg.channel;
        var member = msg.member;
        var cities = suffix.trim().split(/\s*,\s*/);
        var notAdd = [];
        var canAdd = [];
    } catch (e) {
        console.log(`Unable to set variables.`);
        return msg.channel.send('I am sorry, I was unable to complete that command.');
    }

    //check the value against the banned roles.
    for(var i = 0; i < cities.length; i++) {
        let input = cities[i];
        let found = dym(input, bannedRoles);
        if(found === null) {
            canAdd.push(input);
        } else {
            notAdd.push(input);
        }
    }

    // The role(s) is not a banned role so lets check to see if it is availble in the guild.
    
    var foundCity = [];
    if(canAdd.length > 0) {
        canAdd.forEach( city => {
            // This isn't working because I need the text values to match exactly (case sensitive). How can I use DYM here???
            
        })

        msg.channel.send(`I found these roles. ${Array.from(msg.guild.roles)}`);
    }
    if(notAdd.length > 0) msg.channel.send(`I was unable to add ${notAdd} to your roles.`);
    
}

//     try {
//         var role = msg.guild.roles.find('name', arg);
//     } catch(e) {
//         msg.channel.send(msg.author + " I could not identify " + arg + " as a role in this server.");
//         return console.log("Error: " + e);
//     }

//     console.log(`Found: ${role.name}`);
//     try {
//         // must come after role check and assignment
//         var editable = checkForRole(msg, role, teams);  
        
//     } catch (e) {
//         console.log(`Error: ${e} (Unable to check if User already has a role assigned)`);
//     }
//     console.log('editable', editable);
//     if(editable.status === false) {
//         return msg.channel.send(`${msg.author} Adding ${role} was unsuccessful. You are already a member of ${msg.guild.roles.find('name', editable.role)}. If you need to swap roles for any reason please reach out to an ${msg.guild.roles.find('name', 'Officer Jenny')}.`);
//     }

//     console.log(`Trying to add ${role.name} to ${msg.member.user.username}`);
//     try {
//         member.addRole(role);
//         msg.channel.send(`${msg.author} is now part of Team ${role}`);
//         console.log(msg.author.username + " was added to " + role.name);
//     } catch (e) {
//         console.log("Error: " + e);
//     }

//     function checkForRole(msg, role, teams) {
//         var addable = true;
//         var checkMember = function() {
//             if(msg.member._roles === 'undefined') {
//                 msg.guild.fetchMember(msg.author)
//                 .then(member => {
//                     return member;
//                 })
//             } else {
//                 return msg.member;
//             }
//         }
//         var member = checkMember();

//         // Check if the role they are requesting is part of the static roles
//         if (teams.includes(role.name)) {
//             // If it is, check if they already have one of the roles.
//             teams.forEach(function(localRole) {
//                 console.log('memberRoles', member);
//                 var hasRole = member._roles.exists('name', role);
                
//                 if (hasRole) {
//                     console.log(msg.author.username + ' has the role ' + role + " and cannot be added to another Team role.");
//                     addable = {"status": false, "role": role};
//                     return false;
//                 }
//             }, this);
//         }
//         return addable;
//     }
// }