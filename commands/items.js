const Discord = require('discord.js');
const fs = require('fs');
const rankUp = [20, 50, 100, 160, 280, 360, 500];

module.exports = {
    data: new Discord.SlashCommandBuilder()
        .setName('아이템')
        .setDescription('아이템 메뉴')
        .addSubcommand(subcommand =>
            subcommand.setName('강화')
                .setDescription('보유 중이신 아이템을 레벨에 따라 강화해요. 강화에는 1포인트가 소모돼요.')
                .addStringOption(option => option.setName('이름')
                    .setDescription('강화하실 아이템 이름를 입력해주세요. 없는 아이템일 경우 새로 생성돼요.')
                    .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand.setName('파괴')
                .setDescription('입력하신 아이템을 파괴해요. 파괴할 아이템의 등급과 이름에 따라 포인트가 환급돼요.')
                .addStringOption(option => option.setName('이름')
                    .setDescription('파괴하실 아이템 이름을 입력해주세요.')
                    .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand.setName('보유')
                .setDescription('보유 중이신 아이템 목록을 보여드려요.'))
        .addSubcommand(subcommand =>
            subcommand.setName('판매')
                .setDescription('입력하신 아이템을 판매해요.')
                .addIntegerOption(option => option.setName('금액')
                    .setDescription('아이템을 판매할 금액을 입력해주세요.')
                    .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand.setName('구매')
                .setDescription('입력하신 아이템을 구매해요.'))
        .addSubcommand(subcommand =>
            subcommand.setName('정보')
                .setDescription('아이템 정보를 보여드려요.')
                .addStringOption(option => option.setName('이름')
                    .setDescription('정보를 확인하실 아이템 이름를 입력해주세요.')
                    .setRequired(true))),

    /**
     * 
     * @param {Discord.Client} client 
     * @param {Discord.Interaction} interaction 
     */
    async execute(client, interaction) {
        let ephemeral = false;
        const user = interaction.user;
        const embed = new Discord.EmbedBuilder();

        const file = fs.readFileSync('./data/users.json', 'utf-8');
        const itemFile = fs.readFileSync('./data/items.json', 'utf-8');
        const users = JSON.parse(file);
        const items = JSON.parse(itemFile);

        if (users[user.id] == undefined) {
            users[user.id] = { name: user.username, points: 0, attendance: "0", attendance_count: 0 };
        }

        /*const target = interaction.options.getString('이름');
        let searchItem = -1;
        for (index in userItems) {
            if (userItems[index].name == target) {
                searchItem = index;
                break;
            }
        }*/

        fs.writeFileSync('./data/users.json', JSON.stringify(users));
        fs.writeFileSync('./data/items.json', JSON.stringify(items));
        await interaction.reply({ embeds: [embed], ephemeral: ephemeral });
    }
}

function getRandom(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}