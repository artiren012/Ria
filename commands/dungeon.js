// 대충 던전탐사 코드
const Discord = require('discord.js');
const fs = require('fs');

module.exports = {
    data: new Discord.SlashCommandBuilder()
        .setName('던전')
        .setDescription('던전을 탐험해 포인트를 획득하실 수 있어요.')
        .addSubcommand(subcommand =>
            subcommand.setName('탐사')
                .setDescription('던전을 탐험합니다.'))
        .addSubcommand(subcommand =>
            subcommand.setName('스탯')
                .setDescription('현재 스탯을 확인합니다.')),
        /**
         * 
         * @param {Discord.Client} client 
         * @param {Discord.Interaction} interaction 
         */
    async execute(client, interaction) {
        
    }
}