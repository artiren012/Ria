const Discord = require('discord.js');

module.exports = {
    data: new Discord.SlashCommandBuilder()
        .setName('핑')
        .setDescription('핑을 확인해요!'),
        /**
         * 
         * @param {Discord.Client} client 
         * @param {Discord.Interaction} interaction 
         */
    async execute(client, interaction) {
        await interaction.reply(`핑: ${client.ws.ping}ms`);
    }
}