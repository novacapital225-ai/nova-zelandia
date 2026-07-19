const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js'); 
const fs = require('fs'); 
const path = require('path'); 

// ========================================================= // 
//  CONFIGURAÇÃO DE DOCUMENTOS — NOVA ZELÂNDIA (COLE OS IDS)  // 
// ========================================================= // 
const ID_CANAL_LOGS_STAFF = '1526958209494159361'; 
const ID_CANAL_DOCUMENTOS_APROVADOS = '1526958112714658047'; 
const ID_CARGO_PARA_GANHAR = '1526958038081339523'; 
const ID_CARGO_PARA_PERDER = '1526958037619970079'; 
const ID_CARGO_STAFF_PARA_MARCAR = '1526957966614597652'; // Cole aqui o ID do cargo da Staff que vai avaliar o Passaporte

const dbPath = path.join(process.cwd(), 'usuarios.json'); 

function gerarCpfExclusivo() { 
    let banco = {}; 
    if (fs.existsSync(dbPath)) { 
        try { banco = JSON.parse(fs.readFileSync(dbPath, 'utf-8')); } catch { banco = {}; } 
    } 
    const cpfsExistentes = Object.values(banco).map(user => user.cpf); 
    let cpfGerado = ''; 
    let repetido = true; 
    while (repetido) { 
        const parte1 = Math.floor(Math.random() * 90 + 10); 
        const parte2 = Math.floor(Math.random() * 90 + 10); 
        cpfGerado = `${parte1}-${parte2}`; 
        if (!cpfsExistentes.includes(cpfGerado)) repetido = false; 
    } 
    return cpfGerado; 
} 

module.exports = { 
    async processarEnvio(interaction) { 
        const { guild, user, fields } = interaction; 
        const canalLogs = guild.channels.cache.get(ID_CANAL_LOGS_STAFF); 
        if (!canalLogs) return interaction.reply({ content: 'Erro: Canal da imigração/staff não encontrado.', ephemeral: true }).catch(() => null); 

        const nome = fields.getTextInputValue('pas_nome'); 
        const idade = fields.getTextInputValue('pas_idade'); 
        const nacionalidade = fields.getTextInputValue('pas_nacio'); 
        const nickRoblox = fields.getTextInputValue('pas_roblox'); 
        let fotoRobloxUrl = 'https://imgur.com'; 

        try { 
            const resUser = await fetch(`https://roblox.com{encodeURIComponent(nickRoblox)}&limit=1`); 
            const dataUser = await resUser.json(); 
            if (dataUser.data && dataUser.data.length > 0) { 
                const robloxId = dataUser.data.id; 
                const resThumb = await fetch(`https://roblox.com{robloxId}&size=420x420&format=Png&isCircular=false`); 
                const dataThumb = await resThumb.json(); 
                if (dataThumb.data && dataThumb.data.length > 0) fotoRobloxUrl = dataThumb.data.imageUrl; 
            } 
        } catch (err) { console.log('Aviso: Falha ao carregar API do Roblox.'); } 

        const embedAvaliacao = new EmbedBuilder() 
            .setColor('#FFFFFF') 
            .setTitle('🇳🇿 Nova Solicitação de Passaporte (Nova Zelândia)') 
            .setThumbnail(fotoRobloxUrl) 
            .setDescription(`**Imigrante:** ${user}\n\n• **Nome RP:** ${nome}\n• **Idade:** ${idade} anos\n• **Nacionalidade Anterior:** ${nacionalidade}\n• **Nick Roblox:** \`${nickRoblox}\``)
            .setFooter({ text: 'Aguardando avaliação da imigração' });

        const dadosCompactados = `${user.id};${nome.substring(0,20)};${idade};${nacionalidade.substring(0,15)};${nickRoblox.substring(0,20)}`; 
        if (!global.fotosTemp) global.fotosTemp = {}; 
        global.fotosTemp[user.id] = fotoRobloxUrl; 

        const botoes = new ActionRowBuilder().addComponents( 
            new ButtonBuilder().setCustomId(`passaporte_aprovar_${dadosCompactados}`).setLabel('Conceder Passaporte').setStyle(ButtonStyle.Success), 
            new ButtonBuilder().setCustomId(`passaporte_reprovar_${user.id}`).setLabel('Deportar / Recusar').setStyle(ButtonStyle.Danger) 
        ); 

        // Agora ele envia marcando a Staff fora da embed para gerar a notificação real
        await canalLogs.send({ 
            content: `🔔 <@&${ID_CARGO_STAFF_PARA_MARCAR}> | Nova ficha de passaporte aguardando triagem!`, 
            embeds: [embedAvaliacao], 
            components: [botoes] 
        }).catch(() => null); 

        return interaction.reply({ content: 'Seus dados de passaporte foram enviados para a triagem da Imigração da Nova Zelândia!', ephemeral: true }).catch(() => null); 
    }, 

    async aprovarCidadao(interaction) { 
        const { guild, customId } = interaction; 
        const dados = customId.replace('passaporte_aprovar_', '').split(';'); 
        const [jogadorId, nome, idade, nacionalidade, nickRoblox] = dados; 
        const member = await guild.members.fetch(jogadorId).catch(() => null); 
        const canalDocumentos = guild.channels.cache.get(ID_CANAL_DOCUMENTOS_APROVADOS); 
        
        if (!canalDocumentos) return interaction.reply({ content: 'Erro: Canal de vistos/documentos oficiais não encontrado.', ephemeral: true }); 
        
        const cpfGerado = gerarCpfExclusivo(); 
        let fotoFinalUrl = (global.fotosTemp && global.fotosTemp[jogadorId]) ? global.fotosTemp[jogadorId] : 'https://imgur.com'; 
        
        let banco = {}; 
        if (fs.existsSync(dbPath)) { 
            try { banco = JSON.parse(fs.readFileSync(dbPath, 'utf-8')); } catch { banco = {}; } 
        } 
        
        banco[jogadorId] = { nome, idade, cpf: cpfGerado, nacionalidade, roblox: nickRoblox, foto: fotoFinalUrl }; 
        fs.writeFileSync(dbPath, JSON.stringify(banco, null, 4)); 

        if (member) { 
            await member.setNickname(nickRoblox.substring(0, 32)).catch(() => null); 
            if (ID_CARGO_PARA_GANHAR) await member.roles.add(ID_CARGO_PARA_GANHAR).catch(() => null); 
            if (ID_CARGO_PARA_PERDER) await member.roles.remove(ID_CARGO_PARA_PERDER).catch(() => null); 
        } 

        const embedDocumento = new EmbedBuilder() 
            .setColor('#FFFFFF') 
            .setTitle('🇳🇿 NEW ZEALAND PASSPORT — DOCUMENTO DE IDENTIDADE') 
            .setThumbnail(fotoFinalUrl) 
            .setDescription(`• **Nome Civil:** ${nome}\n• **Idade:** ${idade} anos\n• **Nacionalidade:** Neozelandês(a)\n• **Nick Roblox:** \`${nickRoblox}\`\n\n• **Registro de Cidadania (ID):** \`${cpfGerado}\``) 
            .setFooter({ text: 'DEPARTAMENTO DE IMIGRAÇÃO DA NOVA ZELÂNDIA' }) 
            .setTimestamp(); 

        await canalDocumentos.send({ content: `Visto permanente concedido. Bem-vindo à Nova Zelândia, <@${jogadorId}>!`, embeds: [embedDocumento] }).catch(() => null); 

        if (member) { 
            try { 
                const embedDM = new EmbedBuilder()
                    .setColor('#FFFFFF')
                    .setTitle('🎉 Cidadania Concedida!')
                    .setDescription(`Seu passaporte da **Nova Zelândia** foi expedido com sucesso!\nSeu apelido foi atualizado para \`${nickRoblox}\` e seu Registro Geral é: \`${cpfGerado}\`.`); 
                await member.send({ embeds: [embedDM] }); 
            } catch (err) { console.log(`ID ${jogadorId} DM trancada.`); } 
        } 

        const embedAtualizada = EmbedBuilder.from(interaction.message.embeds).setColor('#FFFFFF').setTitle(`🇳🇿 Passaporte EMITIDO por @${interaction.user.username}`); 
        await interaction.message.edit({ content: `✅ Passaporte avaliado por <@${interaction.user.id}>`, embeds: [embedAtualizada], components: [] }).catch(() => null); 
        return interaction.reply({ content: 'Passaporte aprovado com sucesso!', ephemeral: true }).catch(() => null); 
    }, 

    async reprovarCidadao(interaction) { 
        const { customId, guild } = interaction; 
        const jogadorId = customId.replace('passaporte_reprovar_', ''); 
        const member = await guild.members.fetch(jogadorId).catch(() => null); 

        if (member) { 
            try { 
                const embedDM = new EmbedBuilder()
                    .setColor('#FFFFFF')
                    .setTitle('❌ Solicitação Rejeitada')
                    .setDescription('Seu pedido de passaporte para ingressar na Nova Zelândia foi recusado pela banca de imigração.'); 
                await member.send({ embeds: [embedDM] }); 
            } catch (err) { console.log(`Erro DM ID ${jogadorId}`); } 
        } 

        const embedAtualizada = EmbedBuilder.from(interaction.message.embeds).setColor('#FFFFFF').setTitle(`❌ Passaporte RECUSADO por @${interaction.user.username}`); 
        await interaction.message.edit({ content: `❌ Passaporte recusado por <@${interaction.user.id}>`, embeds: [embedAtualizada], components: [] }).catch(() => null); 
        return interaction.reply({ content: 'Passaporte recusado e cidadão notificado!', ephemeral: true }).catch(() => null); 
    } 
};
