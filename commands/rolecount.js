exports.public = false;
exports.description = "User count of each Role.";
exports.process = function(bot, msg, suffix) {
    var txt = "";
    var roles = msg.guild.roles;
    
    if(suffix) {
        var role = msg.guild.roles.find('name', suffix);
        var roleMembers = role.members;
        
        txt = 'Members with ' + suffix + ' role. \n';

        roleMembers.forEach(function(member) {
            txt += member.user.username + '\n';
        });

        if(txt.length > 1999) {
            txt = "This list is longer than a single discord message can send."
        }
    } else {

        roles.forEach(function(val, ind) {
            
            if(msg.member.hasPermission("MANAGE_ROLES", false, true, true)) {
                txt += val.name + " - " + val.members.size + "\n";
            } else {
                if(val.name === "Mystic" || val.name === "Valor" || val.name === "Instinct") {
                    txt += val.name + " - " + val.members.size + "\n";
                }
            }
        });
    }
    msg.channel.send(txt);
}