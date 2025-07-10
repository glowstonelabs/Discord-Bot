import { Client, Message, EmbedBuilder } from 'discord.js';
import UserLevel from '../../models/userLevelSchema';
import {
  BASE_XP_PER_MESSAGE,
  XP_MESSAGE_COOLDOWN_SECONDS,
  GENERAL_CHANNEL_ID,
} from '../../config/levelConfig';
import {
  calculateLevel,
  getXpForLevel,
  getXpUntilNextLevel,
  isHappyHour,
  updateLevelRoles,
} from '../../utils/levelUtils';

export default async function handleLeveling(client: Client, message: Message) {
  if (message.author.bot || !message.guild) return;

  const userId = message.author.id;
  const guildId = message.guild.id;

  // Fetch or create user level doc
  let userDoc = await UserLevel.findOne({ userId, guildId });
  if (!userDoc) {
    userDoc = await UserLevel.create({
      userId,
      guildId,
      xp: 0,
      level: 0,
      lastMessageXp: null,
    });
  }

  // Cooldown check
  const now = Date.now();
  if (
    userDoc.lastMessageXp &&
    now - userDoc.lastMessageXp.getTime() < XP_MESSAGE_COOLDOWN_SECONDS * 1000
  ) {
    return;
  }

  // XP calculation
  let xpToAward = BASE_XP_PER_MESSAGE;
  if (isHappyHour()) xpToAward *= 2;

  const oldXp = userDoc.xp;
  const oldLevel = userDoc.level;

  userDoc.xp += xpToAward;
  userDoc.level = calculateLevel(userDoc.xp);
  userDoc.lastMessageXp = new Date(now);
  await userDoc.save();

  // Level up
  if (userDoc.level > oldLevel) {
    // Announce in general channel
    const general = message.guild.channels.cache.get(GENERAL_CHANNEL_ID);
    if (general && general.isTextBased()) {
      const embed = new EmbedBuilder()
        .setTitle('🎉 Level Up!')
        .setDescription(
          `<@${userId}> has levelled up to **Level ${userDoc.level}** by chatting!`
        )
        .setColor(0x43b581)
        .setThumbnail(message.author.displayAvatarURL())
        .setTimestamp();
      // @ts-ignore
      general.send({ embeds: [embed] });
    }
    // Assign level roles
    const member = await message.guild.members.fetch(userId);
    await updateLevelRoles(member, userDoc.level);
  }
}
