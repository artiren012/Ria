const Discord = require('discord.js');
const fs = require('fs');
const rankUp = [20, 50, 100, 160, 280, 360, 500];

module.exports = {
    data: new Discord.SlashCommandBuilder()
        .setName('아이템')
        .setDescription('아이템 메뉴')
        .addSubcommand(subcommand =>
            subcommand.setName('강화')
                .setDescription('보유 중이신 아이템을 강화해요. 1레벨 강화에 1포인트가 소모돼요.')
                .addStringOption(option => option.setName('이름')
                    .setDescription('강화하실 아이템 이름를 입력해주세요. 없는 아이템일 경우 새로 생성돼요.')
                    .setRequired(true))
                .addIntegerOption(option => option.setName('포인트')
                    .setDescription('강화에 사용할 포인트를 입력해주세요. 입력하신 포인트만큼 일괄적으로 강화해요.')))
        .addSubcommand(subcommand =>
            subcommand.setName('파괴')
                .setDescription('입력하신 아이템을 파괴해요. 파괴할 아이템의 등급과 이름에 따라 포인트가 환급돼요.')
                .addStringOption(option => option.setName('이름')
                    .setDescription('파괴하실 아이템 이름을 입력해주세요.')
                    .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand.setName('각성')
                .setDescription('보유 중이신 아이템을 레벨에 따라 각성해요. 각성에는 ((현 등급) + 1)*20포인트가 소모돼요.')
                .addStringOption(option => option.setName('이름')
                    .setDescription('각성하실 아이템 이름를 입력해주세요.')
                    .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand.setName('보유')
                .setDescription('보유 중이신 아이템 목록을 보여드려요.'))
        .addSubcommand(subcommand =>
            subcommand.setName('판매')
                .setDescription('입력하신 아이템을 판매 등록해요. 다른 분께서 구매하실 때 판매 금액을 받으실 수 있어요.')
                .addStringOption(option => option.setName('이름')
                    .setDescription('파괴하실 아이템 이름을 입력해주세요.')
                    .setRequired(true))
                .addIntegerOption(option => option.setName('금액')
                    .setDescription('아이템을 판매할 금액을 입력해주세요. 금액이 -1인 경우 판매 등록이 취소돼요.')
                    .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand.setName('구매')
                .setDescription('입력하신 아이템을 구매해요.')
                .addStringOption(option => option.setName('이름')
                    .setDescription('구매하실 아이템 이름을 입력해주세요.')
                    .setRequired(true)))
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
        const subcommand = interaction.options.getSubcommand();
        const embed = new Discord.EmbedBuilder();

        const file = fs.readFileSync('./data/users.json', 'utf-8');
        const itemFile = fs.readFileSync('./data/items.json', 'utf-8');
        const users = JSON.parse(file);
        const items = JSON.parse(itemFile);

        if (users[user.id] == undefined) {
            users[user.id] = { name: user.username, points: 0, attendance: "0", attendance_count: 0 };
        }

        if (subcommand != '보유') {
            const itemName = interaction.options.getString('이름');
            let itemIndex = -1;
            let itemOwner = '';
            for (index in items) {
                if (items[index].name == itemName) {
                    itemIndex = index;
                    itemOwner = items[index].ownerID;
                    break;
                }
            }

            embed.setColor(0xFF0000);
            if (subcommand != '강화' && itemIndex == -1) {
                embed.setTitle('아이템을 찾을 수 없어요!');
                embed.setDescription(`\'${itemName}\'은(는) 존재하지 않는 아이템이에요.`);
                ephemeral = true;
            }

            switch (subcommand) {
                case '강화':
                    let levelUp = 1;
                    let currentRank = 1;
                    let currentLevel = 0;
                    if (items[itemIndex] != undefined) {
                        currentRank = items[itemIndex].rank;
                        currentLevel = items[itemIndex].level;
                    }
                    if (interaction.options.getInteger('포인트') != undefined) {
                        levelUp = interaction.options.getInteger('포인트');
                        if (levelUp > users[user.id].points) {
                            embed.setTitle('아이템을 강화할 수 없어요!');
                            embed.setDescription(`${user.username}님이 보유하신 포인트가 강화에 사용하실 포인트보다 부족해요!`);
                            embed.addFields({ name: `${user.username}님의 포인트`, value: `${users[user.id].points}포인트 보유 중` });
                            ephemeral = true;
                            break;
                        } else if (levelUp > rankUp[currentRank - 1]) {
                            embed.setTitle('아이템을 강화할 수 없어요!');
                            embed.setDescription(`${rankUp[currentRank - 1]}레벨 이상 강화는 각성을 통해 등급을 먼저 올려주셔야 해요.`);
                            if (currentLevel != 0) {
                                embed.addFields({ name: `${itemName}의 현재 레벨`, value: `Lv. ${currentLevel}` });
                            }
                            ephemeral = true;
                            break;
                        }
                    }

                    if (itemIndex == -1) {
                        items.push({
                            name: itemName,
                            rank: 1,
                            level: levelUp,
                            ownerID: user.id,
                            selling: false,
                            price: 0
                        });
                        users[user.id].points -= levelUp;
                        embed.setTitle(`${itemName} 강화 완료!`);
                        embed.addFields([
                            { name: '레벨', value: `Lv. ${levelUp} (+${levelUp})` },
                            { name: '등급', value: `1성` },
                            { name: `${user.username}님의 잔여 포인트`, value: `${users[user.id].points}포인트` }
                        ]);
                        embed.setColor(0x1FF0B2);
                    } else if (items[itemIndex].ownerID == user.id) {
                        if (items[itemIndex].level == rankUp[items[itemIndex].rank - 1]) {
                            embed.setTitle(`${itemName} 강화 불가!`);
                            embed.setDescription(`${itemName}을 더이상 강화할 수 없어요! 각성을 통해 등급을 올려주세요.`);
                            ephemeral = true;
                        } else {
                            items[itemIndex].level += levelUp;
                            users[user.id].points -= levelUp;
                            embed.setTitle(`${itemName} 강화 완료!`);
                            embed.addFields([
                                { name: '레벨', value: `Lv. ${items[itemIndex].level} (+${levelUp})` },
                                { name: '등급', value: `${items[itemIndex].rank}성` },
                                { name: `${user.username}님의 잔여 포인트`, value: `${users[user.id].points}포인트` }
                            ]);
                            embed.setColor(0x1FF0B2);
                        }
                    } else {
                        embed.setTitle(`${itemName} 강화 불가!`);
                        embed.setDescription('등록된 아이템 중 소유하지 않으신 아이템은 강화할 수 없어요.');
                        ephemeral = true;
                    }
                    break;
                case '파괴':
                    if (ephemeral) break;
                    if (items[itemIndex].ownerID == user.id) {
                        const refund = items[itemIndex].level + ((items[itemIndex].rank - 1) * 10);
                        users[user.id].points += refund;
                        items.splice(itemIndex, 1);
                        embed.setTitle(`아이템 파괴 완료`);
                        embed.setDescription(`${itemName}이(가) 파괴되었습니다.`);
                        embed.addFields([
                            { name: '환급된 포인트', value: `${refund}포인트` },
                            { name: `${user.username}님의 잔여 포인트`, value: `${users[user.id].points}포인트` }
                        ]);
                        embed.setColor(0x1FF0B2);
                    } else {
                        embed.setTitle(`${itemName} 파괴 불가!`);
                        embed.setDescription('등록된 아이템 중 소유하지 않으신 아이템은 파괴할 수 없어요.');
                        ephemeral = true;
                    }
                    break;
                case '각성':
                    if (ephemeral) break;
                    if (items[itemIndex].ownerID == user.id) {
                        if (rankUp[items[itemIndex].rank - 1] == items[itemIndex].level) {
                            if (users[user.id].points >= rankUp[items[itemIndex].rank - 1]) {
                                users[user.id].points -= rankUp[items[itemIndex].rank - 1];
                                items[itemIndex].rank++;
                                embed.setTitle(`${itemName} 각성 완료!`);
                                embed.addFields([
                                    { name: '레벨', value: `Lv. ${items[itemIndex].level}` },
                                    { name: '등급', value: `${items[itemIndex].rank}성 (+1)` },
                                    { name: `${user.username}님의 잔여 포인트`, value: `${users[user.id].points}포인트` }
                                ]);
                                embed.setColor(0x1FF0B2);
                            } else {
                                embed.setTitle(`${itemName} 각성 불가!`);
                                embed.setDescription(`보유하신 포인트가 각성에 필요한 포인트보다 부족해요!`);
                                embed.addFields([
                                    { name: '등급', value: `${items[itemIndex].rank}성` },
                                    { name: '다음 등급 각성에 필요한 포인트', value: `${rankUp[items[itemIndex].rank - 1]}포인트` },
                                    { name: `${user.username}님의 잔여 포인트`, value: `${users[user.id].points}포인트` }
                                ]);
                                ephemeral = true;
                            }
                        } else {
                            embed.setTitle(`${itemName} 각성 불가!`);
                                embed.setDescription('아이템의 레벨이 각성 가능한 레벨이 아니에요!');
                                embed.addFields([
                                    { name: '현재 레벨', value: `Lv. ${items[itemIndex].level}` },
                                    { name: '다음 등급 각성이 가능한 레벨', value: `Lv. ${rankUp[items[itemIndex].rank - 1]}` }                                ]);
                                ephemeral = true;
                        }
                    } else {
                        embed.setTitle(`${itemName} 각성 불가!`);
                        embed.setDescription('등록된 아이템 중 소유하지 않으신 아이템은 각성할 수 없어요.');
                        ephemeral = true;
                    }
                    break;
                case '판매':
                    if (ephemeral) break;
                    if (items[itemIndex].ownerID != user.id) {
                        embed.setTitle('판매 불가!');
                        embed.setDescription('등록된 아이템 중 소유하지 않으신 아이템은 판매할 수 없어요.');
                        ephemeral = true;
                    } else {
                        const price = interaction.options.getInteger('금액');
                        if (price == -1) {
                            items[itemIndex].selling = false;
                            embed.setTitle(`${itemName} 판매 등록 취소!`);
                            embed.setDescription(`${itemName}의 판매 등록이 취소되었습니다.`);
                            break;
                        }
                        items[itemIndex].price = price;
                        items[itemIndex].selling = true;
                        embed.setTitle(`${itemName} 판매 등록 완료!`);
                        embed.setDescription(`아이템이 ${price}포인트로 판매 등록되었습니다.`);
                        embed.setColor(0x1FF0B2);
                    }
                    break;
                case '구매':
                    if (ephemeral) break;
                    if (items[itemIndex].selling) {
                        if (items[itemIndex].price <= users[user.id].points) {
                            users[items[itemIndex].ownerID].points += items[itemIndex].price;
                            users[user.id].points -= items[itemIndex].price;
                            items[itemIndex].ownerID = user.id;
                            items[itemIndex].selling = false;

                            embed.setTitle(`${itemName} 구매 완료!`);
                            embed.addFields({ name: `${user.username}님의 잔여 포인트`, value: `${users[user.id].points}포인트` });
                            embed.setColor(0x1FF0B2);
                        } else {
                            embed.setTitle('구매 불가!');
                            embed.setDescription(`보유하고 계신 포인트보다 ${itemName}의 가격이 더 높아요.`);
                            embed.addFields([
                                { name: `${itemName} 가격`, value: `${items[itemIndex].price}포인트\n${items[itemIndex].price - users[user.id].points}포인트 부족` },
                                { name: `${user.username}님의 보유 포인트`, value: `${users[user.id].points}포인트` }
                            ]);
                            ephemeral = true;
                        }
                    } else {
                        embed.setTitle('구매 불가!');
                        embed.setDescription(`\'${itemName}\'은(는) 판매중이지 않은 아이템이에요.`);
                        ephemeral = true;
                    }
                    break;
                case '정보':
                    if (ephemeral) break;
                    embed.setTitle(items[itemIndex].name);
                    if (itemOwner == user.id) { embed.setDescription('아이템 보유 중'); }
                    else { embed.setDescription('아이템 미보유'); }
                    embed.addFields([
                        { name: '레벨', value: `Lv. ${items[itemIndex].level}`, inline: true },
                        { name: '등급', value: `${items[itemIndex].rank}성`, inline: true }
                    ]);
                    if (items[itemIndex].selling) {
                        embed.addFields({ name: '판매 여부', value: `판매 중 (${items[itemIndex].price}포인트)`, inline: true });
                    } else {
                        embed.addFields({ name: '판매 여부', value: `미판매`, inline: true });
                    }
                    embed.setColor(0x1FF0B2);
                    break;
            }
        } else if (subcommand == '보유') {
            embed.setTitle(`${user.username}님의 보유 아이템 목록`);
            for (index in items) {
                if (items[index].ownerID == user.id) {
                    let desc = `${items[index].rank}성 / Lv. ${items[index].level}`;
                    if (items[index].selling) {
                        desc += ` / 판매 중 (${items[index].price}포인트)`;
                    }
                    embed.addFields({ name: items[index].name, value: desc, inline: true });
                }
            }
        }

        fs.writeFileSync('./data/users.json', JSON.stringify(users));
        fs.writeFileSync('./data/items.json', JSON.stringify(items));
        await interaction.reply({ embeds: [embed], ephemeral: ephemeral });
    }
}