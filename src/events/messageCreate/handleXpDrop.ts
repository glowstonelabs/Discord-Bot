import type { Interaction as DjsInteraction } from 'discord.js';
import {
  Client,
  EmbedBuilder,
  ButtonBuilder,
  ActionRowBuilder,
  ButtonStyle,
  MessageFlags,
  TextChannel,
} from 'discord.js';
import UserLevel from '../../models/userLevelSchema';
import {
  XP_DROP_CHANNEL_ID,
  MIN_XP_DROP,
  MAX_XP_DROP,
  XP_MULTIPLIER_HAPPY_HOUR,
  MIN_XP_DROP_CHECK_INTERVAL_MINS,
  MAX_XP_DROP_CHECK_INTERVAL_MINS,
} from '../../config/levelConfig';
import {
  isHappyHour,
  calculateLevel,
  updateLevelRoles,
} from '../../utils/levelUtils';

let currentDropMsgId: string | null = null;
let lastDropTime: number | null = null;

export async function sendXpDropMessage(
  channel: TextChannel,
  xpAmount: number,
  adminUserId?: string
) {
  const embed = new EmbedBuilder()
    .setTitle(
      adminUserId ? '🚨 Admin Triggered XP Drop!' : '✨ Wild XP Drop Appeared!'
    )
    .setDescription(
      adminUserId
        ? `A massive **${xpAmount} XP** drop has been spawned by <@${adminUserId}>! Click the button below to claim it!`
        : `A **${xpAmount} XP** drop has spawned! Click the button below to claim it!`
    )
    .setColor(adminUserId ? 0xe74c3c : 0x3498db)
    .setFooter({
      text: adminUserId
        ? 'Quick, click the button to claim it!'
        : 'Good luck, challenger!',
    })
    .setTimestamp();
  const button = new ButtonBuilder()
    .setCustomId('claim_xp_drop')
    .setLabel('Claim XP!')
    .setStyle(ButtonStyle.Success);
  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(button);
  const msg = await channel.send({ embeds: [embed], components: [row] });
  currentDropMsgId = msg.id;
  lastDropTime = Date.now();
  // Timeout after 120s
  setTimeout(async () => {
    if (currentDropMsgId === msg.id) {
      button
        .setDisabled(true)
        .setLabel('Expired!')
        .setStyle(ButtonStyle.Danger);
      embed
        .setTitle('🗑️ XP Drop Expired!')
        .setDescription(`This **${xpAmount} XP** drop was not claimed in time.`)
        .setColor(0x23272a);
      await msg.edit({ embeds: [embed], components: [row] });
      currentDropMsgId = null;
    }
  }, 120 * 1000);
}

export async function maybeSpawnXpDrop(client: Client) {
  const now = Date.now();
  if (currentDropMsgId) return; // Only one active drop
  if (
    lastDropTime &&
    now - lastDropTime < MIN_XP_DROP_CHECK_INTERVAL_MINS * 60 * 1000
  )
    return;
  if (
    lastDropTime &&
    now - lastDropTime < MAX_XP_DROP_CHECK_INTERVAL_MINS * 60 * 1000 &&
    Math.random() >
      1 /
        (MAX_XP_DROP_CHECK_INTERVAL_MINS - MIN_XP_DROP_CHECK_INTERVAL_MINS + 1)
  )
    return;
  const channel = client.channels.cache.get(XP_DROP_CHANNEL_ID);
  if (!channel || channel.type !== 0) return;
  let xpAmount =
    Math.floor(Math.random() * (MAX_XP_DROP - MIN_XP_DROP + 1)) + MIN_XP_DROP;
  if (isHappyHour()) xpAmount *= XP_MULTIPLIER_HAPPY_HOUR;
  await sendXpDropMessage(channel, xpAmount);
}

export async function handleXpDropClaim(interaction: DjsInteraction) {
  if (!interaction.isButton() || interaction.customId !== 'claim_xp_drop')
    return;
  if (!currentDropMsgId || interaction.message.id !== currentDropMsgId) {
    await interaction.reply({
      content:
        'This XP drop is no longer active or has already been claimed/expired.',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }
  currentDropMsgId = null;
  // Award XP
  const userId = interaction.user.id;
  const guildId = interaction.guildId!;
  let userDoc = await UserLevel.findOne({ userId, guildId });
  if (!userDoc)
    userDoc = await UserLevel.create({
      userId,
      guildId,
      xp: 0,
      level: 0,
      lastMessageXp: null,
    });
  let xpAmount = parseInt(
    interaction.message.embeds[0]?.description?.match(
      /\*\*(\d+) XP\*\*/
    )?.[1] || '0',
    10
  );
  if (isHappyHour()) xpAmount *= XP_MULTIPLIER_HAPPY_HOUR;
  const oldLevel = userDoc.level;
  userDoc.xp += xpAmount;
  userDoc.level = calculateLevel(userDoc.xp);
  await userDoc.save();
  // Update embed/button
  const embed = EmbedBuilder.from(interaction.message.embeds[0])
    .setTitle('✅ XP Drop Claimed!')
    .setDescription(`This **${xpAmount} XP** drop was claimed by <@${userId}>!`)
    .setColor(0x43b581);
  const button = ButtonBuilder.from(interaction.component)
    .setDisabled(true)
    .setLabel(`Claimed by ${interaction.user.displayName}!`)
    .setStyle(ButtonStyle.Secondary);
  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(button);
  await interaction.update({ embeds: [embed], components: [row] });
  // Level up/role
  if (userDoc.level > oldLevel && interaction.guild) {
    const member = await interaction.guild.members.fetch(userId);
    await updateLevelRoles(member, userDoc.level);
  }
  await interaction.followUp({
    content: `You claimed the **${xpAmount} XP** drop! You now have **${userDoc.xp} XP**.${userDoc.level > oldLevel ? `\n🎉 **LEVEL UP!** You are now **Level ${userDoc.level}**!` : ''}`,
    flags: MessageFlags.Ephemeral,
  });
}
