const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js'); 

// ========================================================= // 
//     CONFIGURAÇÃO DE WHITELIST — NOVA ZELÂNDIA (IDS)        // 
// ========================================================= // 
const ID_CANAL_LOGS_STAFF = '1526958208063770776'; 
const ID_CARGO_PARA_GANHAR = '1526958035845644430'; 
const ID_CARGO_PARA_PERDER = '1526958038081339523'; 
const ID_CARGO_STAFF_PARA_MARCAR = '1526957966614597652'; // Cole aqui o ID do cargo da Staff que vai avaliar a Whitelist

module.exports = { 
    async processarWL(interaction) { 
        const { guild, user, fields } = interaction; 
        const canalLogs = guild.channels.cache.get(ID_CANAL_LOGS_STAFF); 
        if (!canalLogs) return interaction.reply({ content: 'Erro: Canal de logs da imigração não encontrado.', ephemeral: true }).catch(() => null); 

        const cpfAns = fields.getTextInputValue('wl_cpf'); 
        const rdmVdmAns = fields.getTextInputValue('wl_rdm_vdm'); 
        const morteVidaAns = fields.getTextInputValue('wl_morte_vida'); 
        const antiRpAns = fields.getTextInputValue('wl_anti_rp'); 
        const powerAns = fields.getTextInputValue('wl_power'); 

        const embedStaff = new EmbedBuilder() 
            .setColor('#FFFFFF') 
            .setTitle('🇳🇿 Triagem de Imigração — Novo Formulário de Whitelist') 
            .setDescription(`**Candidato:** ${user} (ID: \`${user.id}\`)\n\n• **Conceito RP:**\n${cpfAns}\n\n• **RDM/VDM:**\n${rdmVdmAns}\n\n• **Amor à Vida:**\n${morteVidaAns}\n\n• **Anti-RP:**\n${antiRpAns}\n\n• **Power Gaming:**\n${powerAns}`) 
            .setFooter({ text: 'DEPARTAMENTO DE IMIGRAÇÃO DA NOVA ZELÂNDIA' }) 
            .setTimestamp(); 

        const botoes = new ActionRowBuilder().addComponents( 
            new ButtonBuilder().setCustomId(`wl_aprovar_${user.id}`).setLabel('Conceder Visto').setStyle(ButtonStyle.Success), 
            new ButtonBuilder().setCustomId(`wl_reprovar_${user.id}`).setLabel('Deportar / Recusar').setStyle(ButtonStyle.Danger) 
        ); 

        // Enviando o formulário com o ping no cargo dos avaliadores
        await canalLogs.send({ 
            content: `🔔 <@&${ID_CARGO_STAFF_PARA_MARCAR}> | Nova Whitelist enviada! Conceitos prontos para avaliação.`, 
            embeds: [embedStaff], 
            components: [botoes] 
        }).catch(() => null); 

        return interaction.reply({ content: 'Suas respostas da Whitelist foram enviadas com sucesso!', ephemeral: true }).catch(() => null); 
    }, 

    async aprovarWLStaff(interaction) { 
        const { guild, customId } = interaction; 
        const jogadorId = customId.replace('wl_aprovar_', ''); 
        const member = await guild.members.fetch(jogadorId).catch(() => null); 

        if (member) { 
            if (ID_CARGO_PARA_GANHAR) await member.roles.add(ID_CARGO_PARA_GANHAR).catch(() => null); 
            if (ID_CARGO_PARA_PERDER) await member.roles.remove(ID_CARGO_PARA_PERDER).catch(() => null); 

            try { 
                const embedDM = new EmbedBuilder()
                    .setColor('#FFFFFF')
                    .setTitle('🇳🇿 Visto de Entrada Aprovado!')
                    .setDescription('Parabéns! Suas respostas foram aprovadas. Sua entrada na Nova Zelândia foi autorizada!'); 
                await member.send({ embeds: [embedDM] }); 
            } catch (err) { console.log('DM Trancada.'); } 
        } 

        const embedAtualizada = EmbedBuilder.from(interaction.message.embeds).setColor('#FFFFFF').setTitle(`🇳🇿 VISTO CONCEDIDO por @${interaction.user.username}`); 
        await interaction.message.edit({ content: `✅ Whitelist aprovada por <@${interaction.user.id}>`, embeds: [embedAtualizada], components: [] }).catch(() => null); 
        return interaction.reply({ content: 'Whitelist aprovada com sucesso!', ephemeral: true }).catch(() => null); 
    }, 

    async reprovarWLStaff(interaction) { 
        const { customId, guild } = interaction; 
        const jogadorId = customId.replace('wl_reprovar_', ''); 
        const member = await guild.members.fetch(jogadorId).catch(() => null); 

        if (member) { 
            try { 
                const embedDM = new EmbedBuilder()
                    .setColor('#FFFFFF')
                    .setTitle('❌ Imigração Recusada')
                    .setDescription('Suas respostas da Whitelist foram reprovadas. Estude as regras com atenção antes de refazer.'); 
                await member.send({ embeds: [embedDM] }); 
            } catch (err) { console.log('DM Trancada.'); } 
        } 

        const embedAtualizada = EmbedBuilder.from(interaction.message.embeds).setColor('#FFFFFF').setTitle(`❌ CIDADÃO DEPORTADO por @${interaction.user.username}`); 
        await interaction.message.edit({ content: `❌ Whitelist recusada por <@${interaction.user.id}>`, embeds: [embedAtualizada], components: [] }).catch(() => null); 
        return interaction.reply({ content: 'Teste de Whitelist reprovado!', ephemeral: true }).catch(() => null); 
    } 
};
