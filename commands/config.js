const fs        = require('fs');

exports.public = false;
exports.description = "Command to view or update configuration items.";
exports.process = function(bot, msg, suffix) {
    switch (suffix) {
        case 'view':
            view(msg);
            break;
        case 'update':
            update(msg);
            break;
        case 'delete':
            remove(msg)
            break;
        case 'add':
            add(msg);
            break;
        default:
            return msg.channel.send('I am sorry, I couldn\'t find a command that matched.');
            break;
    }
}

function view(msg) {
    fs.readFile('./config.json', (err, data) => {
        if(err) {
            return msg.channel.send('I am sorry, there was an issue reading the config file: ' + err);
        }
        var msgText = "\n";
        configItems = JSON.parse(data);
        for (var key in configItems) {
            msgText += `\`\`\`${key}: ${configItems[key]}\n\`\`\``;
        }
        return msg.channel.send(msgText);
    })
}

function add(msg) {
    return msg.channel.send('This command isn\'t quite ready for prime time yet!')
}
function update(msg) {
    return msg.channel.send('This command isn\'t quite ready for prime time yet!')
}
function remove(msg) {
    return msg.channel.send('This command isn\'t quite ready for prime time yet!')
}