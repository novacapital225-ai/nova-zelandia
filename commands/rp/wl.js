const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle, PermissionFlagsBits } = require('discord.js'); 

module.exports = { 
    data: new SlashCommandBuilder() 
        .setName('wl') 
        .setDescription('Envia o painel oficial de Whitelist e teste de regras da Nova Zelândia.') 
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator), 

    async execute(interaction) { 
        await interaction.reply({ content: 'Painel de Whitelist enviado com sucesso!', ephemeral: true }).catch(() => null); 

        const embedPainel = new EmbedBuilder() 
            .setColor('#FFFFFF') // Branco Clean
            .setTitle('🇳🇿 FORMULÁRIO DE WHITELIST — NOVA ZELÂNDIA RP') 
            .setDescription( 
                `• Bem-vindo ao portal de imigração e triagem de diretrizes da Nova Zelândia.\n\n` + 
                `Para obter o seu visto permanente de permanência e ter acesso integral à nossa cidade, você precisa comprovar à nossa equipe Consular que domina as regras de convivência fundamentais.\n\n` + 
                `Clique no botão abaixo e responda com atenção e seriedade o questionário contendo os conceitos essenciais (Conceito de RP, RDM, VDM, Amor à Vida, Anti-RP e Power Gaming).` 
            ) 
            .setFooter({ text: 'ALFÂNDEGA DA NOVA ZELÂNDIA • Teste de Cidadania' }); 

        const botao = new ActionRowBuilder().addComponents( 
            new ButtonBuilder().setCustomId('wl_abrir_formulario').setLabel('Iniciar Teste de Entrada').setStyle(ButtonStyle.Secondary) 
        ); 

        return interaction.channel.send({ embeds: [embedPainel], components: [botao] }).catch(() => null); 
    }, 

    async abrirFormularioWL(interaction) { 
        const modal = new ModalBuilder().setCustomId('wl_modal_enviar').setTitle('Banca Consular — Nova Zelândia'); 

        const campoCpf = new TextInputBuilder()
            .setCustomId('wl_cpf')
            .setLabel('O que significa RP para você?')
            .setStyle(TextInputStyle.Short)
            .setRequired(true); 

        const campoRdmVdm = new TextInputBuilder()
            .setCustomId('wl_rdm_vdm')
            .setLabel('Explique com suas palavras o que é RDM e VDM:')
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true); 

        const campoMorteVida = new TextInputBuilder()
            .setCustomId('wl_morte_vida')
            .setLabel('O que significa Amor à Vida dentro do RP?')
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true); 

        const campoAntiRp = new TextInputBuilder()
            .setCustomId('wl_anti_rp')
            .setLabel('Dê um exemplo prático de conduta Anti-RP:')
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true); 

        const campoPowerGaming = new TextInputBuilder()
            .setCustomId('wl_power')
            .setLabel('O que significa e exemplifique Power Gaming:')
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true); 

        modal.addComponents( 
            new ActionRowBuilder().addComponents(campoCpf), 
            new ActionRowBuilder().addComponents(campoRdmVdm), 
            new ActionRowBuilder().addComponents(campoMorteVida), 
            new ActionRowBuilder().addComponents(campoAntiRp), 
            new ActionRowBuilder().addComponents(campoPowerGaming) 
        ); 

        return interaction.showModal(modal).catch(() => null); 
    } 
};
