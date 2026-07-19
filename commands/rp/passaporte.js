const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle, PermissionFlagsBits } = require('discord.js'); 
const fs = require('fs'); 
const path = require('path'); 

const dbPath = path.join(process.cwd(), 'usuarios.json'); 

module.exports = { 
    data: new SlashCommandBuilder() 
        .setName('passaporte') 
        .setDescription('Envia o painel oficial de imigração e emissão de passaporte da Nova Zelândia.') 
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator), 

    async execute(interaction) { 
        await interaction.reply({ content: 'Painel de imigração enviado com sucesso!', ephemeral: true }).catch(() => null); 

        const embedPainel = new EmbedBuilder() 
            .setColor('#FFFFFF') // Branco Clean
            .setTitle('🇳🇿 DEPARTAMENTO DE IMIGRAÇÃO — NOVA ZELÂNDIA') 
            .setDescription( 
                `• Bem-vindo ao portal oficial de emissão de passaportes da Nova Zelândia.\n\n` + 
                `Para registrar a identidade do seu personagem e solicitar o seu visto definitivo de moradia na cidade, clique no botão abaixo e preencha a sua ficha alfandegária.\n\n` + 
                `• **Informações Importantes:**\n` + 
                `• Seu número de registro geral exclusivo será gerado de forma 100% automática.\n` + 
                `• Certifique-se de digitar o seu Nick do Roblox corretamente. O sistema irá buscar a foto oficial do seu rosto automaticamente para estampar no seu documento oficial.\n` + 
                `• Após ter o visto aprovado pela banca de imigração, consulte seu documento a qualquer momento usando o comando \`/doc\`.` 
            ) 
            .setFooter({ text: 'GOVERNO DA NOVA ZELÂNDIA • Sistema de Identificação Civil' }); 

        const botao = new ActionRowBuilder().addComponents( 
            new ButtonBuilder().setCustomId('passaporte_abrir_formulario').setLabel('Solicitar Passaporte').setStyle(ButtonStyle.Secondary) 
        ); 

        return interaction.channel.send({ embeds: [embedPainel], components: [botao] }).catch(() => null); 
    }, 

    async handleDocCommand(interaction) { 
        await interaction.deferReply().catch(() => null); 

        let banco = {}; 
        if (fs.existsSync(dbPath)) { 
            try { banco = JSON.parse(fs.readFileSync(dbPath, 'utf-8')); } catch { banco = {}; } 
        } 

        const dadosUsuario = banco[interaction.user.id]; 
        const embedId = new EmbedBuilder().setColor('#FFFFFF').setTimestamp(); 

        if (dadosUsuario) { 
            embedId.setTitle('🇳🇿 NEW ZEALAND — CITIZEN IDENTIFICATION') 
                .setThumbnail(dadosUsuario.foto || 'https://imgur.com') 
                .setDescription( 
                    `Seu registro unificado de cidadania foi localizado na base de dados governamental da Nova Zelândia.\n\n` + 
                    `• **Nome Civil (Personagem):** ${dadosUsuario.nome}\n` + 
                    `• **Idade do Cidadão:** ${dadosUsuario.idade} anos\n` + 
                    `• **Nacionalidade:** Neozelandês(a)\n` + 
                    `• **Nick do Roblox:** \`${dadosUsuario.roblox}\`\n\n` + 
                    `• **REGISTRO DE CIDADANIA (ID):** \`${dadosUsuario.cpf}\`` 
                ) 
                .setFooter({ text: 'DEPARTAMENTO DE IDENTIFICAÇÃO CIVIL' }); 
        } else { 
            embedId.setColor('#FFFFFF') 
                .setTitle('❌ Registro Não Localizado') 
                .setDescription(`Olá ${interaction.user}, você ainda não possui um passaporte ativo em nosso sistema.\n\nPor favor, dirija-se ao canal de imigração e preencha o seu formulário de entrada para regularizar sua situação.`) 
                .setFooter({ text: 'ALFÂNDEGA DA NOVA ZELÂNDIA • Entrada Recusada' }); 
        } 

        return interaction.editReply({ embeds: [embedId] }).catch(() => null); 
    }, 

    async abrirFormulario(interaction) { 
        const modal = new ModalBuilder().setCustomId('passaporte_modal_enviar').setTitle('Ficha Governamental — Nova Zelândia'); 

        const campoNome = new TextInputBuilder().setCustomId('pas_nome').setLabel('Nome do Personagem (RP)').setStyle(TextInputStyle.Short).setRequired(true); 
        const campoIdade = new TextInputBuilder().setCustomId('pas_idade').setLabel('Idade do Personagem').setStyle(TextInputStyle.Short).setRequired(true); 
        const campoNacio = new TextInputBuilder().setCustomId('pas_nacio').setLabel('Nacionalidade Anterior').setStyle(TextInputStyle.Short).setRequired(true); 
        const campoRoblox = new TextInputBuilder().setCustomId('pas_roblox').setLabel('Nick Exato do Roblox').setStyle(TextInputStyle.Short).setRequired(true); 

        modal.addComponents( 
            new ActionRowBuilder().addComponents(campoNome), 
            new ActionRowBuilder().addComponents(campoIdade), 
            new ActionRowBuilder().addComponents(campoNacio), 
            new ActionRowBuilder().addComponents(campoRoblox) 
        ); 

        return interaction.showModal(modal).catch(() => null); 
    } 
};
