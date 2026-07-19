const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, PermissionFlagsBits } = require('discord.js'); 

const ID_CARGO_SUPORTE_STAFF = '1526957966614597652'; 

module.exports = { 
    async handleButton(interaction) { 
        const { guild, user, customId } = interaction; 

        if (customId === 'ticket_abrir_canal') { 
            await interaction.deferReply({ ephemeral: true }).catch(() => null); 

            const canalExistente = guild.channels.cache.find(c => c.name === `🇳🇿-suporte-${user.username.toLowerCase()}`); 
            if (canalExistente) return interaction.editReply({ content: `❌ Você já possui um canal aberto em ${canalExistente}!` }); 

            const canalTicket = await guild.channels.create({ 
                name: `🇳🇿-suporte-${user.username}`, 
                type: ChannelType.GuildText, 
                permissionOverwrites: [ 
                    { id: guild.id, deny: [PermissionFlagsBits.ViewChannel] }, 
                    { id: user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] }, 
                    { id: ID_CARGO_SUPORTE_STAFF, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] } 
                ] 
            }).catch(() => null); 

            if (!canalTicket) return interaction.editReply({ content: '❌ Erro interno ao abrir o canal de suporte.' }); 

            const embedCanal = new EmbedBuilder() 
                .setColor('#FFFFFF') 
                .setTitle('🇳🇿 Atendimento Oficial — Nova Zelândia') 
                .setDescription(`Saudações ${user},\n\nSeu canal privado de suporte foi aberto. Aguarde um oficial da nossa equipe para dar início ao seu atendimento.\n\n• Para encerrar este protocolo, clique no botão abaixo.`)
                .setFooter({ text: 'DEPARTAMENTO DE SUPORTE E IMIGRAÇÃO' });

            const botaoFechar = new ActionRowBuilder().addComponents( 
                new ButtonBuilder().setCustomId('ticket_fechar_canal').setLabel('Encerrar Atendimento').setStyle(ButtonStyle.Danger)
            ); 

            await canalTicket.send({ content: `<@&${ID_CARGO_SUPORTE_STAFF}> | Solicitação de ${user}`, embeds: [embedCanal], components: [botaoFechar] }); 
            return interaction.editReply({ content: `✅ Canal estabelecido com sucesso em ${canalTicket}!` }); 
        } 

        if (customId === 'ticket_fechar_canal') { 
            await interaction.reply({ content: '🔒 **Protocolo Encerrado.** Canal deletado em 5 segundos...' }).catch(() => null); 
            setTimeout(async () => { await interaction.channel.delete().catch(() => null); }, 5000); 
        } 
    } 
};
