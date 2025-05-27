import { Client, GatewayIntentBits, TextChannel } from 'discord.js';
import readline from 'readline';
import { writeFile } from 'fs/promises';
import path from 'path';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const ask = (query: string): Promise<string> => new Promise(resolve => rl.question(query, resolve));

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

// Validate BOT_TOKEN before logging in
const token = process.env.BOT_TOKEN;
if (!token || token === 'YOUR_BOT_TOKEN') {
    console.error("Error: Bot token is not set or is invalid. Please set a valid BOT_TOKEN environment variable.");
    process.exit(1);
}

client.login(token).catch(err => {
    console.error("Failed to login:", err);
    process.exit(1);
});

client.once('ready', async () => {
    // console.debug(`Logged in as ${client.user?.tag}`);

    // Obtain guild ID either from CLI arguments or prompt
    const args = process.argv.slice(2);
    const guildArg = args.find(arg => arg.startsWith('--guild='));
    let guildId = guildArg ? guildArg.split('=')[1] : undefined;
    if (!guildId) {
        const guilds = client.guilds.cache.map(g => ({ id: g.id, name: g.name }));
        console.log("Guilds:");
        guilds.forEach(g => console.log(`${g.id}: ${g.name}`));
        guildId = await ask("Enter Guild ID: ");
    } else {
        // console.debug(`Using guild ID from arguments: ${guildId}`);
    }

    const guild = client.guilds.cache.get(guildId);
    if (!guild) {
        console.error("Invalid Guild ID");
        rl.close();
        client.destroy();
        return;
    }

    // Obtain channel ID either from CLI args or prompt
    let channelId = args.find(arg => arg.startsWith('--channel='))?.split('=')[1];
    const fetchedChannels = await guild.channels.fetch();
    const channels = fetchedChannels.filter(ch => ch.isTextBased());
    if (!channelId) {
        console.log("Text Channels:");
        channels.forEach(ch => console.log(`${ch.id}: ${ch.name}`));
        channelId = await ask("Enter Channel ID: ");
    } else {
        // console.debug(`Using channel ID from arguments: ${channelId}`);
    }
    const channel = channels.get(channelId) as TextChannel;
    if (!channel) {
        console.error("Invalid Channel ID");
        client.destroy();
        return;
    }

    // New: Determine message limit (from CLI or prompt) and fetch the last x messages
    let limit = 100;
    const limitArg = args.find(arg => arg.startsWith('--limit='));
    if (limitArg) {
        limit = parseInt(limitArg.split('=')[1]);
    }
    // else {
    //     const input = await ask("Enter the number of messages to fetch: ");
    //     limit = parseInt(input);
    // }
    rl.close();
    // console.debug(`Fetching last ${limit} messages...`);
    const messagesBatch = await channel.messages.fetch({ limit });
    const sorted = Array.from(messagesBatch.values()).sort((a, b) => a.createdTimestamp - b.createdTimestamp);
    if (sorted.length === 0) {
        console.debug("No messages in channel.");
        client.destroy();
        return;
    }
    const messages = sorted.map(m => `${m.createdAt.toISOString()} - ${m.author.username}: ${m.content}`).join('\n');
    const timeStamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `history_${timeStamp}.txt`;
    const filePath = path.resolve(__dirname, '..', fileName);
    const header = `Last Checked: ${new Date().toISOString()}\n`;
    await writeFile(filePath, header + '\n' + messages);
    // Print the content so it can be piped to pbcopy
    console.log(header + '\n' + messages);
    client.destroy();
});