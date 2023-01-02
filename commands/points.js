const Discord = require('discord.js');
const fs = require('fs');

module.exports = {
    data: new Discord.SlashCommandBuilder()
        .setName('포인트')
        .setDescription('보유 포인트를 확인하실 수 있어요'),
    /**
     * 
     * @param {Discord.Client} client 
     * @param {Discord.Interaction} interaction 
     */
    async execute(client, interaction) {
        const user = interaction.user;
        const embed = new Discord.EmbedBuilder();

        const file = fs.readFileSync('./data/users.json', 'utf-8');
        const users = JSON.parse(file);
        let points = 0;
        
        if (users[user.id] == undefined) {
            users[user.id] = {name: user.username, points: 0, attendance: "0", attendance_count: 0};
            fs.writeFileSync('./data/users.json', JSON.stringify(users));
        } else {
            points = users[user.id].points;
        }
        embed.setTitle(`${user.username}님의 포인트`);
        embed.setDescription(`${users[user.id].points}포인트 보유 중`);
        embed.setColor(0x1FF0B2);

        await interaction.reply({embeds: [embed]});
    }
}