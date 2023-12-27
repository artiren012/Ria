const Discord = require('discord.js');
const fs = require('fs');

module.exports = {
    data: new Discord.SlashCommandBuilder()
        .setName('추첨')
        .setDescription('특정 범위 내의 항목을 임의로 추첨해요.')
        .addSubcommand(subcommand => subcommand.setName('숫자')
            .setDescription('지정하신 범위 내의 숫자를 임의로 추첨해요.')
            .addIntegerOption(option => option.setName('최솟값')
                .setDescription('뽑을 수 있는 숫자 중 최솟값을 입력해주세요.')
                .setRequired(true))
            .addIntegerOption(option => option.setName('최댓값')
                .setDescription('뽑을 수 있는 숫자 중 최댓값을 입력해주세요.')
                .setRequired(true)))
        .addSubcommand(subcommand => subcommand.setName('목록')
        .setDescription('입력하신 목록에서 한 개의 항목을 추첨해요.')
            .addStringOption(option => option.setName('목록')
                .setDescription('추첨을 진행할 목록을 입력해주세요. 항목 간 구분은 쉼표(,)로 구분되어요.')
                .setRequired(true))),
    /**
     * 
     * @param {Discord.Client} client 
     * @param {Discord.Interaction} interaction 
     */
    async execute(client, interaction) {
        let desc = '';
        let item = null;

        if (interaction.options.getSubcommand() === '숫자') {
            const max = interaction.options.getInteger('최댓값');
            const min = interaction.options.getInteger('최솟값');
            if (max == min) return await interaction.reply({ content: '최댓값과 최솟값이 같아요!', ephemeral: true });

            item = random(min, max);
            desc = `뽑으신 숫자는 ${min}부터 ${max}까지의 숫자 중에서 ${item}이에요.`;
        } else if (interaction.options.getSubcommand() === '목록') {
            const itemList = interaction.options.getString('목록').split(',');
            item = itemList[random(0, itemList.length - 1)];
            desc = `입력하신 목록 중에서 \'${item}\'이(가) 나왔어요.`;
        }
        
        const embed = new Discord.EmbedBuilder();
        embed.setColor(0x1F85DE);
        embed.setTitle(`추첨된 항목은 \"${item}\" 입니다!`);
        embed.setDescription(desc);

        await interaction.reply({ embeds: [embed] });

        function random(min, max) {
            return Math.floor(Math.random() * (max - min)) + min;
        }
    }
}