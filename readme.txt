# FiveM Discord Status Bot Setup Guide

## Prerequisites
- Node.js (version 16 or higher)
- A Discord account
- A Discord server where you have admin permissions
- A FiveM server

## Step 1: Create a Discord Bot

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application"
3. Give it a name (e.g., "FiveM Status Bot")
4. Go to the "Bot" tab
5. Click "Add Bot"
6. Copy the bot token (keep this secret!)
7. Under "Privileged Gateway Intents", enable:
   - SERVER MEMBERS INTENT (optional)
   - MESSAGE CONTENT INTENT (optional)

## Step 2: Invite Bot to Your Server

1. Go to the "OAuth2" → "URL Generator" tab
2. Select scopes: `bot`
3. Select permissions:
   - Send Messages
   - Use Embed Links
   - Read Message History
   - Use Slash Commands
4. Copy the generated URL and open it in a new tab
5. Select your server and authorize the bot

## Step 3: Get Channel ID

1. In Discord, enable Developer Mode (User Settings → Advanced → Developer Mode)
2. Right-click on your "status" channel
3. Click "Copy ID"
4. Save this ID

## Step 4: Setup the Bot Code

1. Create a new folder for your bot
2. Save the bot code as `bot.js`
3. Save the package.json file
4. Open terminal in the folder and run:
   ```bash
   npm install
   ```

## Step 5: Configure the Bot

Edit the `config` object in `bot.js`:

```javascript
const config = {
    token: 'YOUR_BOT_TOKEN_HERE', // From Step 1
    channelId: 'YOUR_STATUS_CHANNEL_ID_HERE', // From Step 3
    serverIp: '123.456.789.123:30120', // Your FiveM server IP:PORT
    serverName: 'My Awesome Server',
    serverIcon: 'https://i.imgur.com/youricon.png', // Optional
    connectUrl: 'fivem://connect/123.456.789.123:30120',
    websiteUrl: 'https://yourwebsite.com', // Optional
    updateInterval: 60000 // Update every 60 seconds
};
```

## Step 6: Run the Bot

```bash
npm start
```

For development with auto-restart:
```bash
npm run dev
```

## Hosting Options

### Option 1: VPS/Dedicated Server (Recommended)
- **Providers**: DigitalOcean, Linode, Vultr, AWS EC2
- **Cost**: $5-20/month
- **Steps**:
  1. Create a VPS with Ubuntu/Debian
  2. Install Node.js: `curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash - && sudo apt-get install -y nodejs`
  3. Upload your bot files
  4. Install dependencies: `npm install`
  5. Use PM2 for process management:
     ```bash
     npm install -g pm2
     pm2 start bot.js --name "fivem-status-bot"
     pm2 startup
     pm2 save
     ```

### Option 2: Free Hosting (Railway)
1. Push your code to GitHub
2. Go to [Railway.app](https://railway.app)
3. Connect your GitHub account
4. Deploy your repository
5. Add environment variables in Railway dashboard
6. Your bot will auto-deploy

### Option 3: Heroku (Basic Plan ~$7/month)
1. Install Heroku CLI
2. Create `Procfile`: `worker: node bot.js`
3. Deploy:
   ```bash
   heroku create your-bot-name
   git push heroku main
   heroku ps:scale worker=1
   ```

### Option 4: Run on Your PC
- Pros: Free, full control
- Cons: Must keep PC running 24/7
- Use PM2 to manage the process

## Environment Variables (For Production)

Instead of hardcoding tokens, use environment variables:

```javascript
const config = {
    token: process.env.DISCORD_TOKEN,
    channelId: process.env.CHANNEL_ID,
    serverIp: process.env.SERVER_IP,
    // ... other config
};
```

## Troubleshooting

### Bot appears offline
- Check if your bot token is correct
- Ensure the bot has proper permissions in your Discord server

### Status shows as offline but server is online
- Verify your server IP and port are correct
- Check if your FiveM server has the HTTP endpoint enabled
- Make sure port 30120 (or your configured port) is accessible

### Bot crashes
- Check console for error messages
- Ensure all dependencies are installed
- Verify Node.js version is 16 or higher

## Features

- ✅ Real-time server status (Online/Offline)
- ✅ Current player count
- ✅ Server information display
- ✅ Join server button (FiveM connect link)
- ✅ Optional website button
- ✅ Auto-updates every 60 seconds
- ✅ Embed with server icon
- ✅ Handles server downtime gracefully

## Customization

You can modify the bot to add more features:
- Player list display
- Server uptime tracking
- Multiple server support
- Custom commands
- Player statistics
- Server restart notifications
