const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const axios = require('axios');

// Configuration - Uses environment variables for Railway deployment
const config = {
    token: process.env.DISCORD_TOKEN || 'MTQwODIwNjk0NjUyMzI4NzU3Mg.GcIXLI.ur2oZIh2eJzsKl6aysFOHvte2jdR8bKd5uIdA8',
    channelId: process.env.CHANNEL_ID || '1404564570533531738',
    serverIp: process.env.SERVER_IP || '89.42.88.212', // 
    serverName: process.env.SERVER_NAME || 'Afterburn RP',
    serverIcon: process.env.SERVER_ICON || 'hhttps://cdn.discordapp.com/avatars/1408206946523287572/f296a2187d51def6648bf065cd973b47.webp?size=1024', // Optional
    connectUrl: process.env.CONNECT_URL || 'fivem://connect/89.42.88.212', // FiveM connect URL
    websiteUrl: process.env.WEBSITE_URL || 'https://discord.gg/etsGb6j29v', // Optional
    updateInterval: parseInt(process.env.UPDATE_INTERVAL) || 60000 // Update every 60 seconds (in milliseconds)
};

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages
    ]
});

let statusMessage = null;

// Function to get server information
async function getServerInfo() {
    try {
        // FiveM server info endpoint
        const response = await axios.get(`http://${config.serverIp}/info.json`, {
            timeout: 10000,
            headers: {
                'User-Agent': 'FiveM-Discord-Bot/1.0'
            }
        });
        
        // Get player list
        const playersResponse = await axios.get(`http://${config.serverIp}/players.json`, {
            timeout: 10000,
            headers: {
                'User-Agent': 'FiveM-Discord-Bot/1.0'
            }
        });
        
        const serverData = response.data;
        const playersData = playersResponse.data;
        
        return {
            online: true,
            players: Array.isArray(playersData) ? playersData.length : 0,
            maxPlayers: (serverData.vars && serverData.vars.sv_maxClients) ? parseInt(serverData.vars.sv_maxClients) : 32,
            serverName: (serverData.vars && serverData.vars.sv_hostname) ? serverData.vars.sv_hostname : config.serverName,
            mapName: serverData.mapname || 'Los Santos',
            gameType: serverData.gametype || 'FiveM'
        };
    } catch (error) {
        console.log('Server appears to be offline or unreachable:', error.code || error.message);
        return {
            online: false,
            players: 0,
            maxPlayers: 32,
            serverName: config.serverName,
            mapName: 'Los Santos',
            gameType: 'FiveM'
        };
    }
}

// Function to create the status embed
function createStatusEmbed(serverInfo) {
    const embed = new EmbedBuilder()
        .setTitle(serverInfo.serverName)
        .setColor(serverInfo.online ? '#00FF00' : '#FF0000')
        .setTimestamp()
        .setFooter({ text: `Last updated • ${new Date().toLocaleTimeString()}` });

    if (config.serverIcon) {
        embed.setThumbnail(config.serverIcon);
    }

    // Server Status Field
    embed.addFields({
        name: 'Server Status',
        value: serverInfo.online ? '🟢 Online' : '🔴 Offline',
        inline: true
    });

    // Player Count Field
    embed.addFields({
        name: 'Player Count',
        value: `${serverInfo.players} / ${serverInfo.maxPlayers}`,
        inline: true
    });

    // Additional info if server is online
    if (serverInfo.online) {
        embed.addFields({
            name: 'Map',
            value: serverInfo.mapName,
            inline: true
        });
    }

    return embed;
}

// Function to create action buttons
function createActionRow() {
    const row = new ActionRowBuilder();

    // Join Server button
    row.addComponents(
        new ButtonBuilder()
            .setLabel('Join Server')
            .setStyle(ButtonStyle.Link)
            .setURL(config.connectUrl)
            .setEmoji('🎮')
    );

    // Website button (if configured)
    if (config.websiteUrl) {
        row.addComponents(
            new ButtonBuilder()
                .setLabel('Visit Website')
                .setStyle(ButtonStyle.Link)
                .setURL(config.websiteUrl)
                .setEmoji('🌐')
        );
    }

    return row;
}

// Function to update the status message
async function updateStatus() {
    try {
        const channel = client.channels.cache.get(config.channelId);
        if (!channel) {
            console.error('❌ Status channel not found!');
            return;
        }

        const serverInfo = await getServerInfo();
        const embed = createStatusEmbed(serverInfo);
        const actionRow = createActionRow();

        if (statusMessage) {
            // Update existing message
            try {
                await statusMessage.edit({
                    embeds: [embed],
                    components: [actionRow]
                });
            } catch (editError) {
                console.log('Could not edit existing message, creating new one:', editError.message);
                statusMessage = null;
            }
        }
        
        if (!statusMessage) {
            // Create new message
            try {
                statusMessage = await channel.send({
                    embeds: [embed],
                    components: [actionRow]
                });
            } catch (sendError) {
                console.error('❌ Error creating status message:', sendError.message);
                return;
            }
        }

        const statusEmoji = serverInfo.online ? '🟢' : '🔴';
        console.log(`${statusEmoji} Status updated: ${serverInfo.online ? 'Online' : 'Offline'} - ${serverInfo.players}/${serverInfo.maxPlayers} players`);
    } catch (error) {
        console.error('❌ Error updating status:', error.message);
        // Try to find the channel again in case of cache issues
        try {
            await client.channels.fetch(config.channelId);
        } catch (fetchError) {
            console.error('❌ Could not fetch channel:', fetchError.message);
        }
    }
}

// Bot ready event
client.once('ready', async () => {
    console.log(`✅ Bot logged in as ${client.user.tag}`);
    console.log(`📍 Monitoring server: ${config.serverIp}`);
    console.log(`📺 Status channel ID: ${config.channelId}`);
    
    // Validate configuration
    if (!config.token || config.token === 'YOUR_BOT_TOKEN_HERE') {
        console.error('❌ Discord token not set! Please set DISCORD_TOKEN environment variable.');
        process.exit(1);
    }
    
    if (!config.channelId || config.channelId === 'YOUR_STATUS_CHANNEL_ID_HERE') {
        console.error('❌ Channel ID not set! Please set CHANNEL_ID environment variable.');
        process.exit(1);
    }
    
    if (!config.serverIp || config.serverIp === 'YOUR_SERVER_IP_HERE') {
        console.error('❌ Server IP not set! Please set SERVER_IP environment variable.');
        process.exit(1);
    }
    
    // Find existing status message
    try {
        const channel = client.channels.cache.get(config.channelId);
        if (channel) {
            console.log(`📋 Found status channel: #${channel.name}`);
            const messages = await channel.messages.fetch({ limit: 10 });
            statusMessage = messages.find(msg => msg.author.id === client.user.id);
            if (statusMessage) {
                console.log('📝 Found existing status message, will update it');
            }
        } else {
            console.error('❌ Could not find status channel! Check your CHANNEL_ID.');
            process.exit(1);
        }
    } catch (error) {
        console.error('❌ Error accessing channel:', error.message);
        process.exit(1);
    }

    // Initial status update
    console.log('🔄 Starting initial status update...');
    await updateStatus();
    
    // Set up periodic updates
    setInterval(updateStatus, config.updateInterval);
    console.log(`⏰ Status will update every ${config.updateInterval / 1000} seconds`);
});

// Handle button interactions (optional - for custom actions)
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton()) return;
    
    // Handle custom button interactions here if needed
    // The join server and website buttons are handled automatically by Discord
});

// Error handling
client.on('error', console.error);
process.on('unhandledRejection', console.error);

// Start the bot
client.login(config.token);

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down bot...');
    client.destroy();
    process.exit(0);
});
