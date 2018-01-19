exports.public =  true;
exports.usage = '<team>';
exports.description = "Add a team role (Mystic, Instint, or Valor) to yourself. If you are already assigned a team role then you must get an Officer to help you.";
exports.process = function(bot, msg, suffix) {
    try {
        var teams = ['Instinct', 'Mystic', 'Valor'];
        var chan = msg.channel;
        var member = msg.member;
        var args = suffix.split(/\s+/g);
        var arg = args.shift();
        arg = arg.ucfirst();
    } catch (e) {
        console.log(`Unable to set variables.`);
        return msg.channel.send('I am sorry, I was unable to complete that command.');
    }

    //Check if the command was sent to the appropriate channel.
    if(chan != msg.guild.channels.find('name', 'team-assignment')) {
        console.log(msg.author.username + " requested .iam in an invalid channel. ("+ chan.name +")");
        return msg.author.send("Please send team requests in the " + msg.guild.channels.find('name', 'team-assignment') + " channel"); //Requesting role in the wrong channel
    }

    // Check for a suffix. If we don't find one, return an error.
    if (!arg) {
        console.log(msg.author.username + " did not designate a role.");
        return msg.channel.send(`${msg.author} You did not provide a role. Please use .iam <role> to be assigned a team role.`);
    }
    if(!teams.includes(arg)) {
        console.log(msg.author.username + " did not designate an appropriate role.");
        return msg.channel.send(`${msg.author} ${arg} is not an appropriate team role. Please use .iam <role> to be assigned a team role. Where <role> is an appropriate Pokemon Team.`);
    }

    try {
        var role = msg.guild.roles.find('name', arg);
    } catch(e) {
        msg.channel.send(msg.author + " I could not identify " + arg + " as a role in this server.");
        return console.log("Error: " + e);
    }

    console.log(`Found: ${role.name}`);
    try {
        // must come after role check and assignment
        var editable = checkForRole(msg, role, teams);  
        
    } catch (e) {
        console.log(`Error: ${e} (Unable to check if User already has a role assigned)`);
    }
    console.log('editable', editable);
    if(editable.status === false) {
        return msg.channel.send(`${msg.author} Adding ${role} was unsuccessful. You are already a member of ${msg.guild.roles.find('name', editable.role)}. If you need to swap roles for any reason please reach out to an ${msg.guild.roles.find('name', 'Officer Jenny')}.`);
    }

    console.log(`Trying to add ${role.name} to ${msg.member.user.username}`);
    try {
        member.addRole(role);
        msg.channel.send(`${msg.author} is now part of Team ${role}`);
        console.log(msg.author.username + " was added to " + role.name);
    } catch (e) {
        console.log("Error: " + e);
    }

    function checkForRole(msg, role, teams) {
        var addable = true;
        var checkMember = function() {
            if(msg.member._roles === 'undefined') {
                msg.guild.fetchMember(msg.author)
                .then(member => {
                    return member;
                })
            } else {
                return msg.member;
            }
        }
        var member = checkMember();

        // Check if the role they are requesting is part of the static roles
        if (teams.includes(role.name)) {
            // If it is, check if they already have one of the roles.
            teams.forEach(function(localRole) {
                console.log('memberRoles', member);
                var hasRole = member._roles.exists('name', role);
                
                if (hasRole) {
                    console.log(msg.author.username + ' has the role ' + role + " and cannot be added to another Team role.");
                    addable = {"status": false, "role": role};
                    return false;
                }
            }, this);
        }
        return addable;
    }
}