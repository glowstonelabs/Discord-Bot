import {
  Client,
  CommandInteraction,
  GuildChannel,
  EmbedBuilder,
  Role,
} from "discord.js";

export default {
  name: "serverinfo",
  description: "Shows the server's information",
  async execute(_client: Client, interaction: CommandInteraction) {
    if (!interaction.guild) {
      interaction.reply({
        content: "You can only run this command inside a server.",
        ephemeral: true,
      });
      return;
    }

    const { guild } = interaction;

    if (!guild) {
      interaction.reply({
        content: "Guild information is not available.",
        ephemeral: true,
      });
      return;
    }

    try {
      await interaction.deferReply();

      const owner = await guild.fetchOwner();
      const textChannels = guild.channels.cache.filter(
        (c: GuildChannel) => c.type === 0
      ).size;
      const voiceChannels = guild.channels.cache.filter(
        (c: GuildChannel) => c.type === 2
      ).size;
      const categoryChannels = guild.channels.cache.filter(
        (c: GuildChannel) => c.type === 4
      ).size;
      const totalChannels = textChannels + voiceChannels + categoryChannels;
      const memberCount = guild.memberCount;
      const roles = guild.roles.cache
        .filter((role: Role) => role.name !== "@everyone")
        .map((role: Role) => role.name)
        .join(", ");
      const creationDate = guild.createdAt.toDateString();
      const boosts = guild.premiumSubscriptionCount || 0;
      const boostLevel = guild.premiumTier;
      const emojiCount = guild.emojis.cache.size;
      const region = guild.preferredLocale;
      const verificationLevel = guild.verificationLevel;
      const roleCount = guild.roles.cache.size - 1; // Exclude @everyone role
      const bannerURL = guild.bannerURL({ size: 1024 });

      const serverInfoEmbed = new EmbedBuilder()
        // @ts-ignore: Ignoring type errors for setTitle
        .setTitle(`${guild.name} Server Information`)
        .setDescription("Here are the current server statistics:")
        .setThumbnail(guild.iconURL({ size: 256 }))
        .setImage(bannerURL)
        .addFields(
          { name: "👑 Owner", value: owner.user.tag, inline: true },
          { name: "🌍 Region", value: region, inline: true },
          {
            name: "🔒 Verification Level",
            value: verificationLevel.toString(),
            inline: true,
          },
          {
            name: "💬 Text Channels",
            value: textChannels.toString(),
            inline: true,
          },
          {
            name: "🔊 Voice Channels",
            value: voiceChannels.toString(),
            inline: true,
          },
          {
            name: "📂 Category Channels",
            value: categoryChannels.toString(),
            inline: true,
          },
          {
            name: "📊 Total Channels",
            value: totalChannels.toString(),
            inline: true,
          },
          { name: "👥 Members", value: memberCount.toString(), inline: true },
          { name: "🏷️ Roles", value: roleCount.toString(), inline: true },
          { name: "🚀 Boosts", value: boosts.toString(), inline: true },
          {
            name: "⭐ Boost Level",
            value: boostLevel.toString(),
            inline: true,
          },
          { name: "😀 Emojis", value: emojiCount.toString(), inline: true },
          {
            name: "📜 Role List",
            value: roles.length > 1024 ? `${roles.slice(0, 1021)}...` : roles,
          }
        )
        .setColor(0x00ae86)
        .setFooter({
          text: `ID: ${guild.id} | Server Created: ${creationDate}`,
        })
        .setTimestamp();

      await interaction.editReply({ embeds: [serverInfoEmbed] });
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
