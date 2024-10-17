# Fusion Bot v2

A powerful and flexible Discord bot built with Deno.

## Features

- **General Commands**: Help, ping, and server info
- **Moderation Tools**: Ban, kick, warn, timeout, and more
- **Event Handling**: Custom event management system
- **Command Handling**: Efficient command processing

## Project Structure

```
Fusion-Bot-v2/
├── .vscode/
│   └── settings.json
├── src/
│   ├── commands/
│   │   ├── general/
│   │   ├── moderation/
│   │   └── events/
│   └── util/
├── .env
├── .gitignore
├── deno.json
├── deno.lock
├── renovate.json
└── README.md
```

## Getting Started

1. Clone the repository
2. Install Deno: [https://deno.land/#installation](https://deno.land/#installation)
3. Set up your `.env` file with your Discord bot token
4. Run the bot:
   ```
   deno run --allow-net --allow-read --allow-env src/index.ts
   ```

## Commands

- **General**: `help`, `ping`, `serverinfo`
- **Moderation**: `ban`, `kick`, `warn`, `clearwarnings`, `purge`, `timeout`, `unban`

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

# Fusion Bot v2

A powerful and flexible Discord bot built with Deno.

[... previous content ...]

## License

This project is licensed under the MIT License:

```
MIT License

Copyright (c) [year] [your name]

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

Built with ❤️ using Deno
