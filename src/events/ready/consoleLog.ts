import { Client } from "discord.js";

export default (client: Client) => {
  if (client.user) {
    console.log(`${client.user.tag} is online.`);
  } else {
    console.log("Client user is not available.");
  }
};
