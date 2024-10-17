import {
  ActionRowBuilder,
  ButtonBuilder,
  // @ts-ignore - no
  ButtonStyle,
  ChatInputCommandInteraction,
  Client,
  // @ts-ignore - no
  ComponentType,
  EmbedBuilder,
  PermissionsBitField,
} from 'discord.js';

export default {
  name: 'help',
  description: 'Displays a help menu with available commands.',
  /**
   * Execute method to handle the command interaction
   * @param {Client} client
   * @param {ChatInputCommandInteraction} interaction
   */
  execute: async (_client: Client, interaction: ChatInputCommandInteraction) => {
    const Server = new EmbedBuilder()
      // @ts-ignore - no
      .setTitle('⚙️ **Miscellaneous Commands** ⚙️')
      .setColor(0x2ec343)
      .setDescription('Here are some useful commands to get you started:')
      .addFields(
        {
          name: '🆘 Help Command',
          value: '`/help` - Displays this help menu.',
        },
        {
          name: '🏓 Ping Command',
          value: "`/ping` - Returns the bot's latency.",
        },
        {
          name: 'ℹ️ Server Info Command',
          value: '`/serverinfo` - Shows information about the server.',
        },
      )
      .setFooter({
        text: `Requested by ${interaction.user.tag}`,
        iconURL: interaction.user.displayAvatarURL({ extension: 'jpg' }),
      })
      .setTimestamp();

    const Moderation = new EmbedBuilder()
      // @ts-ignore - no
      .setTitle('🛡️ **Moderation Commands** 🛡️')
      .setColor(0x00ffff)
      .setDescription('Commands for server moderation:')
      .addFields(
        {
          name: '🔨 Ban Command',
          value: '`/ban [user] [duration] {reason}` - Bans a user from the server.',
        },
        {
          name: '🔨 Unban Command',
          value: '`/unban [user] {reason}` - Unbans a user from the server.',
        },
        {
          name: '👢 Kick Command',
          value: '`/kick [user] {reason}` - Kicks a user from the server.',
        },
        {
          name: '⏲️ Timeout Command',
          value: '`/timeout [user] [duration] {reason}` - Times out a user.',
        },
        {
          name: '🧹 Purge Command',
          value: '`/purge [amount]` - Deletes a specified amount of messages.',
        },
      )
      .setFooter({
        text: `Requested by ${interaction.user.tag}`,
        iconURL: interaction.user.displayAvatarURL({ extension: 'jpg' }),
      })
      .setTimestamp();

    const embeds = [Server];
    if (
      (interaction.member?.permissions as Readonly<PermissionsBitField>).has(
        PermissionsBitField.Flags.BanMembers,
      )
    ) {
      embeds.push(Moderation);
    }
    // @ts-ignore - no
    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        // @ts-ignore - no
        .setCustomId('previous')
        .setLabel('⬅️ Previous')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        // @ts-ignore - no
        .setCustomId('next')
        .setLabel('Next ➡️')
        .setStyle(ButtonStyle.Primary),
    );

    let currentPage = 0;

    const message = await interaction.reply({
      embeds: [embeds[currentPage]],
      components: [row],
      fetchReply: true,
    });

    const collector = message.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: 60000,
    });

    collector.on('collect', (i) => {
      if (i.user.id === interaction.user.id) {
        if (i.customId === 'previous') {
          currentPage = currentPage > 0 ? --currentPage : embeds.length - 1;
        } else if (i.customId === 'next') {
          currentPage = currentPage + 1 < embeds.length ? ++currentPage : 0;
        }
        i.update({ embeds: [embeds[currentPage]] });
      } else {
        i.reply({ content: 'You cannot use these buttons.', ephemeral: true });
      }
    });

    collector.on('end', () => {
      message.edit({ components: [] });
    });
  },
};
