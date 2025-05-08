import {
  Client,
  CommandInteraction,
  CommandInteractionOptionResolver,
  EmbedBuilder,
  MessageFlags,
  User as _User,
} from 'discord.js';

export default {
  name: 'avatar',
  description: 'Displays the avatar of a user.',
  options: [
    {
      name: 'target-user',
      type: 6, // USER type
      description: 'The user whose avatar to display',
      required: false,
    },
  ],
  /**
   * @param {Client} client
   * @param {CommandInteraction} interaction
   */
  execute: async (_client: Client, interaction: CommandInteraction) => {
    try {
      const targetUser =
        (interaction.options as CommandInteractionOptionResolver).getUser(
          'target-user'
        ) || interaction.user;

      const avatarEmbed = new EmbedBuilder()
        .setColor(0x3498db)
        // @ts-ignore - shut up
        .setTitle(`🖼️ Avatar of ${targetUser.username}`)
        // @ts-ignore - shut up
        .setImage(targetUser.displayAvatarURL({ dynamic: true, size: 1024 }))
        .setTimestamp()
        .setFooter({
          text: `Requested by ${interaction.user.tag}`,
          iconURL: interaction.user.displayAvatarURL(),
        });

      await interaction.reply({ embeds: [avatarEmbed] });
    } catch (error) {
      console.error(`Error executing avatar command: ${error}`);
      await interaction.reply({
        content: '❗ An error occurred while executing the command.',
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};
