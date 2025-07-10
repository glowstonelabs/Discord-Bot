import { GuildMember, Role } from 'discord.js';
import {
  LEVEL_ROLES,
  XP_MULTIPLIER_HAPPY_HOUR,
  HAPPY_HOUR_START,
  HAPPY_HOUR_END,
  UK_TIMEZONE,
} from '../config/levelConfig';

// XP required for a given level (quadratic)
export function getXpForLevel(level: number): number {
  if (level <= 0) return 0;
  return 100 * level ** 2;
}

// Calculate level from XP
export function calculateLevel(xp: number): number {
  let level = 0;
  while (xp >= getXpForLevel(level + 1)) {
    level++;
  }
  return level;
}

// XP needed for next level
export function getXpUntilNextLevel(
  currentXp: number,
  currentLevel: number
): number {
  return getXpForLevel(currentLevel + 1) - currentXp;
}

// Check if now is happy hour (UK time) using native JS
export function isHappyHour(): boolean {
  const now = new Date();
  const ukNow = new Date(
    now.toLocaleString('en-US', { timeZone: UK_TIMEZONE })
  );
  const start = new Date(ukNow);
  start.setHours(
    HAPPY_HOUR_START.hour,
    HAPPY_HOUR_START.minute,
    HAPPY_HOUR_START.second,
    0
  );
  const end = new Date(ukNow);
  end.setHours(
    HAPPY_HOUR_END.hour,
    HAPPY_HOUR_END.minute,
    HAPPY_HOUR_END.second
  );
  return ukNow >= start && ukNow < end;
}

// Progress bar (10 segments)
export function getProgressBar(
  currentXp: number,
  currentLevel: number
): string {
  const xpForCurrent = getXpForLevel(currentLevel);
  const xpForNext = getXpForLevel(currentLevel + 1);
  const xpInLevel = currentXp - xpForCurrent;
  const xpNeeded = xpForNext - xpForCurrent;
  const progress = xpNeeded > 0 ? (xpInLevel / xpNeeded) * 10 : 10;
  const filled = Math.round(progress);
  return '🟦'.repeat(filled) + '⬜'.repeat(10 - filled);
}

// Assign/remove level roles
export async function updateLevelRoles(
  member: GuildMember,
  newLevel: number
): Promise<void> {
  const guildRoles = member.guild.roles.cache;
  let targetRoleId: string | null = null;
  for (const [level, roleId] of Object.entries(LEVEL_ROLES)) {
    if (newLevel >= Number(level)) {
      if (guildRoles.has(roleId)) targetRoleId = roleId;
    }
  }
  const rolesToAdd: Role[] = [];
  const rolesToRemove: Role[] = [];
  if (targetRoleId && !member.roles.cache.has(targetRoleId)) {
    const role = guildRoles.get(targetRoleId);
    if (role) rolesToAdd.push(role);
  }
  for (const roleId of Object.values(LEVEL_ROLES)) {
    if (member.roles.cache.has(roleId) && roleId !== targetRoleId) {
      const role = guildRoles.get(roleId);
      if (role) rolesToRemove.push(role);
    }
  }
  if (rolesToAdd.length)
    await member.roles.add(rolesToAdd, `Level up to ${newLevel}`);
  if (rolesToRemove.length)
    await member.roles.remove(rolesToRemove, `Level up to ${newLevel}`);
}
