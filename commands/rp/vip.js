const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js'); 

module.exports = { 
    data: new SlashCommandBuilder() 
        .setName('painel-vip') 
        .setDescription('Envia a tabela oficial de planos VIP.') 
        .addStringOption(option => 
            option.setName('imagem') 
                .setDescription('URL da imagem para a lateral do painel (Opcional)') 
                .setRequired(false)
        ) 
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator), 

    async execute(interaction) { 
        const urlImagem = interaction.options.getString('imagem') || ''; 
        
        const embed = new EmbedBuilder() 
            .setColor('#FFFFFF') // Branco Clean
            .setTitle('🇳🇿 TABELA DE PLANOS VIP — NOVA ZELÂNDIA RP') 
            .setDescription(
                `🔷 **VIP SAFIRA (PLANO SUPREMO)** | R$ 14,50\n✅ Todos os benefícios inferiores inclusos\n✅ Cargo supremo VIP Safira\n✅ Bônus de $1.000.000 e 1 Terreno nobre\n✅ 3 Carros com Blindagem Máxima\n\n` +
                `💎 **VIP DIAMANTE (PLANO ELITE)** | R$ 11,00\n✅ Cargo VIP Diamante e saldo de $750.000\n✅ 2 Carros Blindagem Nível 2 e 1 Moto esportiva\n✅ 1 Terreno e prioridade muito alta na fila\n\n` +
                `🟡 **VIP OURO (PLANO AVANÇADO)** | R$ 7,00\n✅ Cargo VIP Ouro e bônus de $500.000\n✅ 1 Veículo Premium e 1 Moto comum\n\n` +
                `⚪ **VIP PRATA (PLANO INTERMEDIÁRIO)** | R$ 5,00\n✅ Cargo VIP Prata e bônus de $300.000\n✅ Fila prioritária média e aprovação rápida\n\n` +
                `🟤 **VIP BRONZE (PLANO BÁSICO)** | R$ 3,50\n✅ Cargo VIP Bronze e bônus de $150.000\n✅ Acesso aos chats VIP e suporte prioritário`
            ) 
            .setFooter({ text: 'CENTRAL DE VENDAS • GOVERNO DA NOVA ZELÂNDIA' }); 

        // Coloca a foto na lateral direita
        if (urlImagem && (urlImagem.startsWith('http://') || urlImagem.startsWith('https://'))) { 
            embed.setThumbnail(urlImagem); 
        } 

        await interaction.reply({ content: 'Painel VIP enviado!', ephemeral: true }).catch(() => null); 
        return interaction.channel.send({ embeds: [embed] }).catch(() => null); 
    } 
};
ss