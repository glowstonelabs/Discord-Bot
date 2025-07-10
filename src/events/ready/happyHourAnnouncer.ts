import { Client, EmbedBuilder, TextChannel } from 'discord.js';
import {
  GENERAL_CHANNEL_ID,
  HAPPY_HOUR_START,
  HAPPY_HOUR_END,
  UK_TIMEZONE,
} from '../../config/levelConfig';

let announcedToday = { started: false, ended: false, date: '' };

function getUKTime() {
  const now = new Date();
  return now.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZone: UK_TIMEZONE,
  });
}

function isHappyHourNow() {
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
    HAPPY_HOUR_END.second,
    0
  );
  return ukNow >= start && ukNow < end;
}

export default function startHappyHourAnnouncer(client: Client) {
  setInterval(async () => {
    const now = new Date();
    const ukNow = new Date(
      now.toLocaleString('en-US', { timeZone: UK_TIMEZONE })
    );
    const today = ukNow.toISOString().slice(0, 10);
    const channel = client.channels.cache.get(
      GENERAL_CHANNEL_ID
    ) as TextChannel;
    if (!channel) return;

    if (isHappyHourNow()) {
      if (!announcedToday.started || announcedToday.date !== today) {
        const embed = new EmbedBuilder()
          .setTitle('⏰ HAPPY HOUR ALERT!')
          .setDescription(
            `You'll earn **DOUBLE XP** from both chat messages and XP drops for an hour! Get ready! 🚀`
          )
          .setColor(0xffd700)
          .setTimestamp();
        await channel.send({ embeds: [embed] });
        announcedToday = { started: true, ended: false, date: today };
      }
    } else {
      if (
        announcedToday.started &&
        !announcedToday.ended &&
        announcedToday.date === today
      ) {
        const embed = new EmbedBuilder()
          .setTitle('⏰ Happy Hour Has Ended!')
          .setDescription('Normal XP rates have resumed.')
          .setColor(0xffa500)
          .setTimestamp();
        await channel.send({ embeds: [embed] });
        announcedToday.ended = true;
      }
      if (announcedToday.date !== today) {
        announcedToday = { started: false, ended: false, date: today };
      }
    }
  }, 60 * 1000); // Check every minute
}
