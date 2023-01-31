const Discord = require('discord.js');
const fs = require('fs');

module.exports = {
    data: new Discord.SlashCommandBuilder()
        .setName('뽑기')
        .setDescription('지정하신 범위 내의 숫자를 임의로 추첨해요.')
        .addIntegerOption(option => option.setName('최솟값')
            .setDescription('뽑을 수 있는 숫자 중 최솟값을 입력해주세요.')
            .setRequired(true))
        .addIntegerOption(option => option.setName('최댓값')
            .setDescription('뽑을 수 있는 숫자 중 최댓값을 입력해주세요.')
            .setRequired(true)),
    /**
     * 
     * @param {Discord.Client} client 
     * @param {Discord.Interaction} interaction 
     */
    async execute(client, interaction) {
        const max = interaction.options.getInteger('최댓값');
        const min = interaction.options.getInteger('최솟값');
        const random = Math.floor(Math.random() * (max - min)) + min;

        const embed = new Discord.EmbedBuilder();
        embed.setColor(0x1F85DE);
        embed.setTitle(`뽑으신 숫자는 ${random}입니다!`);
        embed.setDescription(`${min}부터 ${max}까지의 숫자 중 뽑으신 숫자는 ${random}이에요.`);

        const button = new Discord.ButtonBuilder()
            .setCustomId('pick_retry')
            .setLabel('다시 뽑기')
            .setStyle(Discord.ButtonStyle.Primary);

        const row = new Discord.ActionRowBuilder()
            .addComponents(button);

        await interaction.reply({ embeds: [embed], components: [row] });

        let times = 0;
        let interval = setInterval(function () {
            times += 1;
            if (times === 15) {
                clearInterval(interval);
                button.setDisabled(true);
            }
        }, 1000);

        client.on('interactionCreate', async interaction => {
            if (!interaction.isButton) return;
            if (interaction.customId == 'pick_retry') {
                const retry = Math.floor(Math.random() * (max - min)) + min;
                embed.setTitle(`뽑으신 숫자는 ${retry}입니다!`);
                embed.setDescription(`${min}부터 ${max}까지의 숫자 중 뽑으신 숫자는 ${retry}이에요.`);
                await interaction.update({ embeds: [embed], components: [row] });
            }
        })
    }
}