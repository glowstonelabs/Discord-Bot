import {
  // @ts-ignore - no
  ApplicationCommandOptionType as _ApplicationCommandOptionType,
  // @ts-ignore - no
  ChannelType,
  ChatInputCommandInteraction,
  Client,
  EmbedBuilder,
  // @ts-ignore - no
  GuildBasedChannel,
  MessageFlags,
  Role,
} from 'discord.js';

export default {
  name: 'serverinfo',
  description: "Shows the server's information",
  async execute(_client: Client, interaction: ChatInputCommandInteraction) {
    if (!interaction.guild) {
      interaction.reply({
        content: 'You can only run this command inside a server.',
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const { guild } = interaction;

    if (!guild) {
      interaction.reply({
        content: 'Guild information is not available.',
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    try {
      await interaction.deferReply();

      const owner = await guild.fetchOwner();
      const textChannels = guild.channels.cache.filter(
        (c: GuildBasedChannel) => c.type === ChannelType.GuildText
      ).size;
      const voiceChannels = guild.channels.cache.filter(
        (c: GuildBasedChannel) => c.type === ChannelType.GuildVoice
      ).size;
      const categoryChannels = guild.channels.cache.filter(
        (c: GuildBasedChannel) => c.type === ChannelType.GuildCategory
      ).size;
      const totalChannels = textChannels + voiceChannels + categoryChannels;
      const memberCount = guild.memberCount;
      const roles = guild.roles.cache
        .filter((role: Role) => role.name !== '@everyone')
        .map((role: Role) => role.name)
        .join(', ');
      const creationDate = guild.createdAt.toDateString();
      const boosts = guild.premiumSubscriptionCount || 0;
      const boostLevel = guild.premiumTier;
      const emojis = guild.emojis.cache.size;

      const embed = new EmbedBuilder()
        // @ts-ignore - no
        .setTitle(`${guild.name} Server Information`)
        .setThumbnail(guild.iconURL({ extension: 'png' }) || '')
        .addFields(
          { name: '👑 Owner', value: owner.user.tag, inline: true },
          { name: '🌍 Region', value: guild.preferredLocale, inline: true },
          {
            name: '🔒 Security Level',
            value: guild.verificationLevel.toString(),
            inline: true,
          },
          { name: '💬 Text Channels', value: `${textChannels}`, inline: true },
          {
            name: '🔊 Voice Channels',
            value: `${voiceChannels}`,
            inline: true,
          },
          {
            name: '📂 Category Channels',
            value: `${categoryChannels}`,
            inline: true,
          },
          {
            name: '📊 Total Channels',
            value: `${totalChannels}`,
            inline: true,
          },
          { name: '👥 Members', value: `${memberCount}`, inline: true },
          {
            name: '🏷️ Roles',
            value: `${guild.roles.cache.size}`,
            inline: true,
          },
          { name: '🚀 Boosts', value: `${boosts}`, inline: true },
          { name: '⭐ Boost Level', value: `${boostLevel}`, inline: true },
          { name: '😀 Emojis', value: `${emojis}`, inline: true },
          { name: '📜 Role List', value: roles || 'None', inline: false }
        )
        .setFooter({
          text: `ID: ${guild.id} | Server Created: ${creationDate}`,
          iconURL: interaction.user.displayAvatarURL({ extension: 'jpg' }),
        })
        .setColor(0x3498db)
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error(`Error fetching server info: ${error}`);
      await interaction.editReply({
        content:
          '❌ **Error:** An error occurred while fetching server information.',
        //@ts-ignore - This is a valid option
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};
