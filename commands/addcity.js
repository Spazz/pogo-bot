const dym = require('didyoumean');

exports.public =  true;
exports.usage = '<city role>';
exports.description = "Add a city role to yourself. You can add multiple cities at one time by separating them by commas.";
exports.process = function(bot, msg, suffix) {
    
    // If user did not add a suffix, then return an error
    if (!suffix) {
        console.log(msg.author.username + " did not designate any cities.");
        return msg.channel.send(`${msg.author} You did not provide any cities. Please use .addcity <city> separated by comma's to be assigned to their roles.`);
    }

    try {
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
            notAdd.push(found);
        }
    }

    // The role(s) is not a banned role so lets check to see if it is availble in the guild.
    
    var foundCity = [];
    if(canAdd.length > 0) {
        canAdd.forEach( city => {
            //## TODO: Figure out how to utilize didyoumean here.
           
            let found = msg.guild.roles.find('name', city);
            if(found) {
                foundCity.push(found);
            }
            
        })
        //Array.from(msg.guild.roles)
    }
    if(notAdd.length > 0) msg.channel.send(`I was unable to add ${notAdd} to your roles.`);

    //Add the roles I found and that are addable
    member.addRoles(foundCity, "Requested City Roles")
    .then(function() {
        msg.channel.send(`${foundCity} was added to you successfully`);
    })
    .catch(function(e) {
        msg.channel.send(`I was unable to add these roles. Error: ${e}`);
    });
    
}

/*
TODOS:

1. Figure out how to add DYM to searching roles in the guild.
2. Figure out how to send just text back to the channel instead of linking to the role.
3. Make sure there isn't anything else users can break...

*/