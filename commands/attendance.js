const Discord = require('discord.js');
const fs = require('fs');

module.exports = {
    data: new Discord.SlashCommandBuilder()
        .setName('출석')
        .setDescription('일일 출석체크')
        .addSubcommand(subcommand =>
            subcommand.setName('체크')
                .setDescription('일일 출석체크를 진행해요. 출석 시 10~50 포인트 이내의 포인트를 랜덤하게 획득하실 수 있어요.'))
        .addSubcommand(subcommand =>
            subcommand.setName('랭킹')
                .setDescription('서버 출석 순위를 현재 순위와 10위까지 확인하실 수 있어요.')),
    /**
     * 
     * @param {Discord.Client} client 
     * @param {Discord.Interaction} interaction 
     */
    async execute(client, interaction) {
        let ephemeral = false;
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
            users[user.id] = { name: user.username, points: 0, attendance: "0", attendance_count: 0 };
        }

        switch (interaction.options.getSubcommand()) {
            case '체크':
                if (now == users[user.id].attendance) {
                    embed.setTitle('이미 출석 완료!');
                    embed.setColor(0xFF0000);
                    embed.setDescription(`이미 오늘 출석을 완료하셨어요.\n출석 횟수: ${users[user.id].attendance_count}`);
                    ephemeral = true;
                } else {
                    const rand = randint(10, 50);
                    users[user.id].points += rand;
                    users[user.id].attendance = now;
                    users[user.id].attendance_count += 1;
                    embed.setDescription(`${rand}포인트가 적립되었어요!\n출석 횟수: ${users[user.id].attendance_count}`);
                }
                break;
            case '랭킹':
                let serverUserList = [];
                embed.setTitle(`${interaction.guild.name} 출석 랭킹`);

                (await interaction.guild.members.fetch()).each(member => {
                    if (member.user.bot) return;
                    if (users[member.user.id] == undefined) {
                        users[member.user.id] = { name: member.user.username, points: 0, attendance: "0", attendance_count: 0 };
                    }
                    serverUserList.push({ username: member.user.username, attendance_count: users[member.user.id].attendance_count });
                });

                serverUserList.sort((a, b) => {
                    if (a.attendance_count < b.attendance_count) return 1;
                    if (a.attendance_count > b.attendance_count) return -1;
                    return 0;
                });

                for (let i = 0; i < 10; i++) {
                    if (serverUserList.length <= i) break;
                    embed.addFields({ name: `${i + 1}위: ${serverUserList[i].username}`, 
                        value: `${serverUserList[i].attendance_count}회`, inline: false });
                }

                const userRank = serverUserList.findIndex(element => {
                    return element.username === user.username;
                });
                embed.setDescription(`${user.username}님의 순위: ${userRank + 1}위`);

                break;
        }

        users[user.id].name = user.username;
        fs.writeFileSync('./data/users.json', JSON.stringify(users));
        await interaction.reply({ embeds: [embed], ephemeral: ephemeral });
    }
}

function randint(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}