const Discord = require('discord.js');
const fs = require('fs');

module.exports = {
    data: new Discord.SlashCommandBuilder()
        .setName('출석')
        .setDescription('일일 출석체크'),
    /**
     * 
     * @param {Discord.Client} client 
     * @param {Discord.Interaction} interaction 
     */
    async execute(client, interaction) {
        const user = interaction.user;
        const embed = new Discord.EmbedBuilder();
        embed.setTitle('출석 완료!');
        embed.setColor(0x1F85DE);

        const file = fs.readFileSync('./data/users.json', 'utf-8');
        const users = JSON.parse(file);
        const date = new Date();
        const now = date.getFullYear().toString() + "." + 
        (date.getMonth() + 1).toString() + "." + date.getDate().toString();
        
        if (users[user.id] == undefined) {
            users[user.id] = {name: user.username, points: 10, attendance: now, attendance_count: 1};
            embed.setDescription(`10포인트가 적립되었어요!\n출석 횟수: ${users[user.id].attendance_count}`);
        } else if (now == users[user.id].attendance) { 
            embed.setTitle('이미 출석 완료!');
            embed.setColor(0xFF0000);
            embed.setDescription(`이미 오늘 출석을 완료하셨어요.\n출석 횟수: ${users[user.id].attendance_count}`);
        } else {
            users[user.id].points += 10;
            users[user.id].attendance = now;
            users[user.id].attendance_count += 1;
            embed.setDescription(`10포인트가 적립되었어요!\n출석 횟수: ${users[user.id].attendance_count}`);
        }
        
        users[user.id].name = user.username;
        fs.writeFileSync('./data/users.json', JSON.stringify(users));
        await interaction.reply({embeds: [embed]});
    }
}