# Discord LLM Bot

This project connects to Discord, fetches conversation history from a specified text channel, and saves the messages to a file. It tracks progress by storing the oldest and latest message IDs.

**Requirements:**
- A valid Discord bot token must be provided via the BOT_TOKEN environment variable.

**Connecting to Discord:**
To run the bot, you need to create a Discord application and add a bot account:
1. Visit the [Discord Developer Portal](https://discord.com/developers/applications).
2. Click "New Application" (top right) and give it a name.
3. In the application's settings, navigate to the `Settings -> Bot` section and click "Add Bot".
4. Copy the bot token and set it as the BOT_TOKEN environment variable.
5. Invite the bot to your server using the `Settings -> Installation`. Add the `bot` scope and the `Read Message History` Permission.

## Files Created
- **history_*.txt**: Contains the full conversation history with metadata (last checked date, first and last message timestamps).

## Install

> use bun/node

`npm install`
`npm start`
`npm start --guild=GUILD --channel=CHANNEL`

**Usage:**
1. Set the BOT_TOKEN environment variable.
2. Run the project.
3. Follow the prompts to choose a guild and a channel.
4. The bot will fetch and save messages to `history_*.txt`.

## Usage Tips
After the bot finishes fetching messages, you can quickly copy the conversation history to your clipboard for use with an LLM. For example, on macOS run:
```
pbcopy < history_*.txt
```
You can then paste the content wherever needed.
