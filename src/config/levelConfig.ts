// Leveling and XP system configuration

export const BASE_XP_PER_MESSAGE = 10;
export const XP_MESSAGE_COOLDOWN_SECONDS = 30;
export const MIN_XP_DROP = 20;
export const MAX_XP_DROP = 60;
export const XP_MULTIPLIER_HAPPY_HOUR = 2;

export const UK_TIMEZONE = 'Europe/London';
export const HAPPY_HOUR_START = { hour: 15, minute: 0, second: 0 };
export const HAPPY_HOUR_END = { hour: 16, minute: 0, second: 0 };

export const GENERAL_CHANNEL_ID = '1373701623573909634';
export const XP_DROP_CHANNEL_ID = '1373701623573909634';

export const MIN_XP_DROP_CHECK_INTERVAL_MINS = 60;
export const MAX_XP_DROP_CHECK_INTERVAL_MINS = 120;

export const STAFF_ROLE_ID = '1365453852660207626';

export const LEVEL_ROLES: Record<number, string> = {
  10: '1374360366813024266',
  20: '1374360403953582140',
  40: '1374360424287305789',
  60: '1374360439139598457',
  80: '1374360458651242557',
  100: '1374360482999435356',
};
