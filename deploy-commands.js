const fs = require('node:fs');
const path = require('node:path');
const { REST, SlashCommandBuilder, Routes } = require('discord.js');
const { clientID, guildID, token } = require('./config.json');

const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	commands.push(command.data.toJSON());
}

const rest = new REST({ version: '10' }).setToken(token);

rest.put(Routes.applicationGuildCommands(clientID, guildID), { body: [] })
	.then(() => console.log('길드의 모든 명령어가 제거되었습니다.'))
	.catch(console.error);

rest.put(Routes.applicationGuildCommands(clientID, guildID), { body: commands })
    .then((data) => { console.log(`${data.length} 개의 명령어가 등록되었습니다.`) })
    .catch(console.error);