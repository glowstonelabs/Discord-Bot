# Discord Bot

A blazing-fast, modular, and feature-rich Discord bot built with [Bun](https://bun.sh/), TypeScript, MongoDB, and Discord.js. Includes a next-level XP/leveling system, moderation, utility commands, and more.

---

## 🚀 Features

- **Super Fast**: Powered by Bun for instant startup and runtime performance.
- **Leveling System**: XP for messages, random XP drops, happy hour, level roles, leaderboard, and more.
- **Modern Slash Commands**: `/rank`, `/top`, `/setxp`, `/setlevel`, `/spawnxpdrop`, and more.
- **Role Automation**: Auto-assigns/removes roles on level-up.
- **Admin Tools**: Powerful moderation and XP management commands.
- **Persistent Storage**: MongoDB for all user and poll data.
- **Beautiful Embeds**: Clean, stylish, and responsive UI for all commands.
- **Highly Modular**: Easy to add new commands, events, and features.
- **Error Handling**: User-friendly error messages and robust logging.

---

## 🛠️ Setup & Installation

### 1. Prerequisites

- [Bun](https://bun.sh/) (v1.0+)
- [Node.js](https://nodejs.org/) (for some dev tools, optional)
- [MongoDB](https://www.mongodb.com/) database (local or Atlas)
- Discord Bot Token ([guide](https://discordjs.guide/preparations/setting-up-a-bot-application.html#creating-your-bot))

### 2. Clone & Install

```sh
bun install
```

### 3. Configure Environment Variables

Copy `.env example` to `.env` and fill in your secrets:

```
DISCORD_TOKEN=your-bot-token
MONGO_URI=your-mongodb-uri
```

### 4. Start the Bot

```sh
bun run src/index.ts
```

---

## ⚙️ Environment Variables

| Variable      | Description               |
| ------------- | ------------------------- |
| DISCORD_TOKEN | Your Discord bot token    |
| MONGO_URI     | MongoDB connection string |

---

## 🏆 Leveling System

- **XP Gain**: Earn XP for chatting (with cooldown), random XP drops, and happy hour bonuses.
- **Level Roles**: Unlock special roles at level milestones.
- **Leaderboard**: `/top` shows the top users by level and XP.
- **Admin Controls**: `/setxp`, `/setlevel`, `/spawnxpdrop` for staff.
- **Happy Hour**: Double XP for a set time each day, with announcements.
- **All data is stored in MongoDB for speed and reliability.**

---

## 📜 Command List

### General

- `/rank` — View your XP, level, and progress bar
- `/top` — See the top 10 users in the server
- `/help` — List all commands
- `/userinfo` — Info about a user
- `/ping` — Bot latency and stats
- `/serverinfo` — Server stats

### Moderation

- `/ban`, `/kick`, `/timeout`, `/purge`, `/unban` — Standard mod tools

### Leveling Admin

- `/setxp <user> <amount>` — Set a user's XP
- `/setlevel <user> <level>` — Set a user's level
- `/spawnxpdrop [amount]` — Spawn an XP drop

---

## 🧩 Project Structure

```
src/
  commands/      # All slash commands (modular)
  events/        # Event handlers (message, ready, etc.)
  models/        # Mongoose schemas (user, poll, etc.)
  utils/         # Utility functions (leveling, etc.)
  config/        # Config/constants (IDs, XP, etc.)
  index.ts       # Bot entry point
```

---

## 🧑‍💻 Contributing

Pull requests are welcome! Please:

- Use Bun and TypeScript best practices
- Keep code modular and clean
- Add/Update tests if needed
- Document new features in the README

---

## 💬 Support & Community

- [Discord.js Guide](https://discordjs.guide/)
- [Bun Documentation](https://bun.sh/docs)
- [MongoDB Docs](https://www.mongodb.com/docs/)

For help, open an issue or join our Discord server (link coming soon).

---

## ⭐ Why?

- **Blazing fast** (Bun-powered)
- **Modern, beautiful, and modular**
- **Battle-tested leveling system**
- **Easy to extend and maintain**

---

> Made with ❤️ for the Discord community.
