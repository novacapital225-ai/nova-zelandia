const { Client, GatewayIntentBits, Collection, REST, Routes } = require('discord.js');
const express = require('express');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// ========================================================= //
//             SERVIDOR WEB PARA MANTER 24/7 ON              //
// ========================================================= //
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('🇳🇿 Bot Nova Zelândia está Vivo e Operante 24/7!');
});

app.listen(PORT, () => {
    console.log(`[WEB] Servidor Express ativo na porta ${PORT}`);
});

// ========================================================= //
//                    INICIALIZAÇÃO DO BOT                   //
// ========================================================= //
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});

client.commands = new Collection();
const commandsJson = [];

// Importando os módulos de botões/handlers da pasta admin
const passaporteBotoes = require('./commands/admin/passaporte_botoes.js');
const ticketBotoes = require('./commands/admin/ticket_botoes.js');
const wlBotoes = require('./commands/admin/wl_botoes.js');

// Carregador Automático de Comandos (Pasta /commands/rp/)
const rpCommandsPath = path.join(__dirname, 'commands', 'rp');
if (fs.existsSync(rpCommandsPath)) {
    const commandFiles = fs.readdirSync(rpCommandsPath).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const filePath = path.join(rpCommandsPath, file);
        const command = require(filePath);
        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
            commandsJson.push(command.data.toJSON());
            console.log(`[CARREGADOR] Comando /${command.data.name} carregado com sucesso.`);
        }
    }
}

// ========================================================= //
//                REGISTRO DOS COMANDOS DE BARRA              //
// ========================================================= //
client.once('ready', async () => {
    console.log(`[NZ-BOT] Conectado globalmente como: ${client.user.tag}`);
    
    const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);
    try {
        console.log('[NZ-BOT] Atualizando comandos de barra (/) na API do Discord...');
        await rest.put(
            Routes.applicationCommands(client.user.id),
            { body: commandsJson }
        );
        console.log('[NZ-BOT] Comandos de barra (/) registrados globalmente!');
    } catch (error) {
        console.error('[ERRO] Falha ao registrar comandos de barra:', error);
    }
});

// ========================================================= //
//             GERENCIADOR CENTRAL DE INTERAÇÕES             //
// ========================================================= //
client.on('interactionCreate', async (interaction) => {
    // 1. Trata Execução de Comandos de Barra (/)
    if (interaction.isChatInputCommand()) {
        const command = client.commands.get(interaction.commandName);
        if (!command) return;
        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'Ocorreu um erro ao executar este comando!', ephemeral: true }).catch(() => null);
        }
        return;
    }

    // 2. Trata Cliques em Botões (Buttons)
    if (interaction.isButton()) {
        const customId = interaction.customId;

        // Sistema de Passaporte
        if (customId === 'passaporte_abrir_formulario') {
            const passaporteCmd = client.commands.get('passaporte');
            if (passaporteCmd) return passaporteCmd.abrirFormulario(interaction);
        }
        if (customId.startsWith('passaporte_aprovar_')) {
            return passaporteBotoes.aprovarCidadao(interaction);
        }
        if (customId.startsWith('passaporte_reprovar_')) {
            return passaporteBotoes.reprovarCidadao(interaction);
        }

        // Sistema de Whitelist
        if (customId === 'wl_abrir_formulario') {
            const wlCmd = client.commands.get('wl');
            if (wlCmd) return wlCmd.abrirFormularioWL(interaction);
        }
        if (customId.startsWith('wl_aprovar_')) {
            return wlBotoes.aprovarWLStaff(interaction);
        }
        if (customId.startsWith('wl_reprovar_')) {
            return wlBotoes.reprovarWLStaff(interaction);
        }

        // Sistema de Ticket
        if (customId === 'ticket_abrir_canal' || customId === 'ticket_fechar_canal') {
            return ticketBotoes.handleButton(interaction);
        }
    }

    // 3. Trata Envios de Formulários (Modals)
    if (interaction.isModalSubmit()) {
        if (interaction.customId === 'passaporte_modal_enviar') {
            return passaporteBotoes.processarEnvio(interaction);
        }
        if (interaction.customId === 'wl_modal_enviar') {
            return wlBotoes.processarWL(interaction);
        }
    }
});

// Suporte adicional ao comando de consulta por menu secundário se necessário
client.on('interactionCreate', async (interaction) => {
    if (interaction.isChatInputCommand() && interaction.commandName === 'doc') {
        const passaporteCmd = client.commands.get('passaporte');
        if (passaporteCmd) return passaporteCmd.handleDocCommand(interaction);
    }
});

client.login(process.env.TOKEN);
