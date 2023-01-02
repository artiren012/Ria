const Discord = require('discord.js');
const fs = require('fs');

module.exports = {
    data: new Discord.SlashCommandBuilder()
        .setName('포인트_기부')
        .setDescription('포인트를 다른 분께 기부하실 수 있어요.')
        .addUserOption(option => option.setName('기부_대상')
            .setDescription('기부하실 대상을 선택해주세요.').setRequired(true))
        .addIntegerOption(option => option.setName('기부_포인트')
            .setDescription('기부하실 포인트를 입력해주세요.').setRequired(true)),
    /**
     * 
     * @param {Discord.Client} client 
     * @param {Discord.Interaction} interaction 
     */
    async execute(client, interaction) {
        const user = interaction.user;
        const target = interaction.options.getUser('기부_대상');
        const donation = interaction.options.getInteger('기부_포인트');
        const embed = new Discord.EmbedBuilder();

        const file = fs.readFileSync('./data/users.json', 'utf-8');
        const users = JSON.parse(file);
        
        embed.setTitle('기부가 불가해요!');
        embed.setColor(0xFF0000);

        if (users[user.id] == undefined) {
            users[user.id] = {name: user.username, points: 0, attendance: "0", attendance_count: 0};
            embed.setDescription(`${user.username}님이 보유하신 포인트가 없어요!`);
        } else if (users[user.id].points == 0 || users[user.id].points < donation) {
            embed.setDescription(`${user.username}님이 보유하신 포인트가 기부하실 포인트보다 부족해요!`);
        } else {
            if (users[target.id] == undefined) {
                users[target.id] = {name: target.username, points: donation, attendance: "0", attendance_count: 0};
                users[user.id].points -= donation;
            } else {
                users[target.id].points += donation;
                users[user.id].points -= donation;
            }
            embed.setTitle('기부가 완료되었습니다!');
            embed.setDescription(`${target.username}님께 ${donation}포인트가 기부되었습니다.`);
            embed.setColor(0x1FF0B2);
        }

        users[user.id].name = user.username;
        users[target.id].name = target.username;

        fs.writeFileSync('./data/users.json', JSON.stringify(users));
        await interaction.reply({embeds: [embed]});
    }
}