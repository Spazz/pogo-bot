exports.public = false;
exports.description = "List all roles in the guild";
exports.process = function(bot, msg, suffix) {
    var guildRoles = getGuildRoles(msg);
    
    var msgTxt = "```";
    guildRoles.forEach(role => {
        msgTxt += `${role.position}  ${role.name}\n`;
    });
    msgTxt += "```";
    
    return msg.channel.send(msgTxt);
}

function getGuildRoles(msg) {
    var roleArray = [];
    var roles = msg.guild.roles;
    roles.forEach(element => {
        roleArray.push({
            position: element.position,
            id: element.id,
            permissions: element.permissions,
            name: element.name
        });
    });
    function sortCompare(a, b) {
        return a - b;
    }
    roleArray.sort(function (a, b) {
        return b.position - a.position;
    });
    return roleArray;
}