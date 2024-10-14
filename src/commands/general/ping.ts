import { Client, CommandInteraction, EmbedBuilder } from "discord.js";
import process from "node:process";

const version = "1.0.0"; // Define your version here

export default {
  name: "ping",
  description: "Replies with the bot's ping",
  testOnly: true,
  /**
   *
   * @param {Client} client
   * @param {CommandInteraction} interaction
   */
  execute: async (client: Client, interaction: CommandInteraction) => {
    try {
      if (!client.isReady()) {
        await interaction.reply(
          "Bot is not ready yet. Please try again later."
        );
        return;
      }

      await interaction.deferReply();

      const reply = await interaction.fetchReply();

      const ping = reply.createdTimestamp - interaction.createdTimestamp;
      const websocketPing = client.ws.ping;
      const uptimeSeconds = process.uptime();
      const days = Math.floor(uptimeSeconds / (3600 * 24));
      const hours = Math.floor((uptimeSeconds % (3600 * 24)) / 3600);
      const minutes = Math.floor((uptimeSeconds % 3600) / 60);
      const seconds = Math.floor(uptimeSeconds % 60);
      const uptime = `${days}d ${hours}h ${minutes}m ${seconds}s`;
      const currentTime = new Date().toLocaleString();
      const serverCount = client.guilds.cache.size;
      const nodeVersion = process.version;
      const memoryUsage = (
        process.memoryUsage().heapUsed /
        1024 /
        1024
      ).toFixed(2);

      const PingEmbed = new EmbedBuilder()
        .setColor(0xe32e2e)
        // @ts-ignore: Ignoring type errors for setTitle
        .setTitle("🏓 Pong!")
        .setDescription("Here are the current bot statistics:")
        .setThumbnail(client.user?.displayAvatarURL() || "")
        .addFields(
          { name: "📡 Client Ping", value: `${ping}ms`, inline: true },
          {
            name: "🌐 WebSocket Ping",
            value: `${websocketPing}ms`,
            inline: true,
          },
          { name: "⏱️ Uptime", value: uptime, inline: true },
          { name: "🕒 Current Time", value: currentTime, inline: true },
          {
            name: "🤖 Bot",
            value: `${client.user?.username}#${client.user?.discriminator}`,
            inline: true,
          },
          { name: "🔢 Server Count", value: `${serverCount}`, inline: true },
          { name: "🛠️ Version", value: version, inline: true },
          { name: "📦 Node.js Version", value: nodeVersion, inline: true },
          { name: "💾 Memory Usage", value: `${memoryUsage} MB`, inline: true }
        )
        .setFooter({
          text: `Requested by ${interaction.user.tag}`,
          iconURL: interaction.user.displayAvatarURL(),
        })
        .setTimestamp();

      await interaction.editReply({ embeds: [PingEmbed] });
    } catch (error) {
      console.error("Failed to handle interaction:", error);
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({
          content: "There was an error while executing this command!",
          ephemeral: true,
        });
      } else {
        await interaction.reply({
          content: "There was an error while executing this command!",
          ephemeral: true,
        });
      }
    }
  },
};
