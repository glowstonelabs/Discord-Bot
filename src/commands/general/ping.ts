import {
  Client,
  CommandInteraction,
  EmbedBuilder,
  MessageFlags,
} from 'discord.js';
import process from 'process';
import * as path from 'path';
import * as fs from 'fs';

// Dynamically read version from package.json
const packageJsonPath = path.resolve(process.cwd(), 'package.json');
let version = '0.0.0'; // Default fallback
try {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
  version = packageJson.version || version;
} catch (error) {
  console.error('Could not read package.json version:', error);
}

export default {
  name: 'ping',
  description: "🏓 Check the bot's latency and websocket connection",
  testOnly: true,
  execute: async (client: Client, interaction: CommandInteraction) => {
    try {
      // Check bot readiness
      if (client.ws.status !== 0) {
        await interaction.reply({
          content: 'Bot is not fully connected to Discord.',
          flags: MessageFlags.Ephemeral,
        });
        return;
      }

      await interaction.deferReply();

      // @ts-ignore - no
      const reply = await interaction.fetchReply();

      // Calculate metrics
      const ping = reply.createdTimestamp - interaction.createdTimestamp;
      const websocketPing = client.ws.ping;
      const uptimeSeconds = process.uptime();

      // Format uptime
      const days = Math.floor(uptimeSeconds / (3600 * 24));
      const hours = Math.floor((uptimeSeconds % (3600 * 24)) / 3600);
      const minutes = Math.floor((uptimeSeconds % 3600) / 60);
      const seconds = Math.floor(uptimeSeconds % 60);
      const uptime = `\`${days}d ${hours}h ${minutes}m ${seconds}s\``;

      // Additional metrics
      const serverCount = client.guilds.cache.size;
      const memoryUsage = `\`${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB\``;

      // Get bot owner (application owner)
      const botOwner = await client.application?.fetch();
      let ownerDisplay = 'Unknown Owner';

      // Try to find the owner in the current guild
      if (botOwner?.owner?.id && interaction.guild) {
        try {
          const guildMember = await interaction.guild.members.fetch(
            botOwner.owner.id
          );
          if (guildMember) {
            // Mention the owner using their user ID
            ownerDisplay = `<@${guildMember.user.id}>`;
          }
        } catch {
          // If member not found in guild, fallback to application owner username
          // @ts-ignore
          ownerDisplay = botOwner?.owner?.username || ownerDisplay;
        }
      }

      // Create detailed embed
      const PingEmbed = new EmbedBuilder()
        .setColor(0xe32e2e)
        // @ts-ignore - stfu
        .setTitle('🏓 Pong!')
        .setDescription('Here are the current bot statistics:')
        .setThumbnail(client.user?.displayAvatarURL() || '')
        .addFields(
          {
            name: '📡 Client Ping',
            value: `\`${ping}ms\``,
            inline: true,
          },
          {
            name: '🌐 WebSocket Ping',
            value: `\`${websocketPing}ms\``,
            inline: true,
          },
          {
            name: '⏱️ Uptime',
            value: uptime,
            inline: true,
          },
          {
            name: '🔢 Server Count',
            value: `\`${serverCount}\``,
            inline: true,
          },
          {
            name: '🤖 Bot Owner',
            value: ownerDisplay,
            inline: true,
          },
          {
            name: '🛠️ Bot Version',
            value: `\`${version}\``,
            inline: true,
          },
          {
            name: '📦 Node.js Version',
            value: `\`${process.version}\``,
            inline: true,
          },
          {
            name: '💾 Memory Usage',
            value: memoryUsage,
            inline: true,
          },
          {
            name: '💻 Platform',
            value: `\`${process.platform}\``,
            inline: true,
          }
        )
        .setFooter({
          text: `Requested by ${interaction.user.username}`,
          iconURL: interaction.user.displayAvatarURL(),
        })
        .setTimestamp();

      await interaction.editReply({
        embeds: [PingEmbed],
      });
    } catch (error) {
      console.error(`Error executing ping command: ${error}`);
      await interaction.editReply({
        content: 'An error occurred while executing the command.',
        // @ts-ignore - stfu
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};
