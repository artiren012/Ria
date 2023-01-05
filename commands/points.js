const Discord = require('discord.js');
const fs = require('fs');

module.exports = {
    data: new Discord.SlashCommandBuilder()
        .setName('포인트')
        .setDescription('포인트 관련 명령어에요.')
        .addSubcommand(subcommand =>
            subcommand.setName('보유')
                .setDescription('보유 중인 포인트를 확인하실 수 있어요.'))
        .addSubcommand(subcommand =>
            subcommand.setName('기부')
                .setDescription('포인트를 다른 분께 기부하실 수 있어요.')
                .addUserOption(option => option.setName('대상')
                    .setDescription('기부하실 대상을 선택해주세요.').setRequired(true))
                .addIntegerOption(option => option.setName('포인트')
                    .setDescription('기부하실 포인트를 입력해주세요.').setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand.setName('랭킹')
                .setDescription('서버 포인트 랭킹을 10위 까지 확인하실 수 있어요.')),
    /**
     * 
     * @param {Discord.Client} client 
     * @param {Discord.Interaction} interaction 
     */
    async execute(client, interaction) {
        let isRow = false;
        const user = interaction.user;
        const embed = new Discord.EmbedBuilder();
        const row = new Discord.ActionRowBuilder();
        const file = fs.readFileSync('./data/users.json', 'utf-8');
        const users = JSON.parse(file);

        if (users[user.id] == undefined) {
            users[user.id] = { name: user.username, points: 0, attendance: "0", attendance_count: 0 };
        }

        // 기부
        switch (interaction.options.getSubcommand()) {
            case '보유':
                users[user.id].name = user.username;
                embed.setTitle(`${user.username}님의 포인트`);
                embed.setDescription(`${users[user.id].points}포인트 보유 중`);
                embed.setColor(0x1FF0B2);
                break;
            case '기부':
                const target = interaction.options.getUser('대상');
                const donation = interaction.options.getInteger('포인트');

                embed.setTitle('기부가 불가해요!');
                embed.setColor(0xFF0000);

                if (target.bot) {
                    embed.setDescription('봇에게 포인트를 기부하실 수 없어요!');
                } else if (users[user.id].points == 0 || users[user.id].points < donation) {
                    embed.setDescription(`${user.username}님이 보유하신 포인트가 기부하실 포인트보다 부족해요!`);
                } else {
                    if (users[target.id] == undefined) {
                        users[target.id] = { name: target.username, points: donation, attendance: "0", attendance_count: 0 };
                        users[user.id].points -= donation;
                    } else {
                        users[target.id].points += donation;
                        users[user.id].points -= donation;
                    }
                    embed.setTitle('기부가 완료되었습니다!');
                    embed.setDescription(`${target.username}님께 ${donation}포인트가 기부되었습니다.`);
                    embed.addFields({ name: `${user.username}님의 잔여 포인트`, value: `${users[user.id].points}` });
                    embed.setColor(0x1FF0B2);
                }
                break;
            case '랭킹':
                const guild = interaction.guild;
                let serverUserList = [];
                let desc = '';
                embed.setTitle(`${guild.name} 포인트 랭킹`);

                (await interaction.guild.members.fetch()).each(member => {
                    if (member.user.bot) return;
                    if (users[member.user.id] == undefined) {
                        users[member.user.id] = { name: member.user.username, points: 0, attendance: "0", attendance_count: 0 };
                    }
                    serverUserList.push({ username: member.displayName, points: users[member.user.id].points });
                });

                serverUserList.sort((a, b) => {
                    if (a.points < b.points) return 1;
                    if (a.points > b.points) return -1;
                    return 0;
                });

                for (let i = 0; i < 10; i++) {
                    if (serverUserList.length <= i) break;
                    embed.addFields({ name: `${i + 1}위: ${serverUserList[i].username}`, value: `${serverUserList[i].points}포인트`, inline: false });
                }
                embed.setColor(0x1FF0B2);
                break;
        }

        fs.writeFileSync('./data/users.json', JSON.stringify(users));
        await interaction.reply({ embeds: [embed] });
    }
}