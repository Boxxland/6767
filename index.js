const { Client, GatewayIntentBits, PermissionsBitField } = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageThreads
  ]
});

let serverLocked = false;

// 🔒 LOCK SERVER
async function lockGuild(guild) {
  serverLocked = true;

  guild.channels.cache.forEach(async (channel) => {
    try {
      if (!channel.isTextBased()) return;

      await channel.permissionOverwrites.edit(guild.roles.everyone, {
        SendMessages: false,
        CreatePublicThreads: false,
        CreatePrivateThreads: false,
        SendMessagesInThreads: false
      });
    } catch (e) {}
  });
}

// 🔓 UNLOCK SERVER
async function unlockGuild(guild) {
  serverLocked = false;

  guild.channels.cache.forEach(async (channel) => {
    try {
      if (!channel.isTextBased()) return;

      await channel.permissionOverwrites.edit(guild.roles.everyone, {
        SendMessages: true,
        CreatePublicThreads: true,
        CreatePrivateThreads: true,
        SendMessagesInThreads: true
      });
    } catch (e) {}
  });
}

// 💬 COMMAND CONTROL
client.on("messageCreate", async (message) => {
  if (!message.guild) return;

  // 🔑 เฉพาะแอดมินใช้ได้
  const isAdmin = message.member.permissions.has(
    PermissionsBitField.Flags.Administrator
  );

  if (message.content === "!lockall") {
    if (!isAdmin) return;
    await lockGuild(message.guild);
    message.channel.send("🔒 ล็อกทั้งเซิร์ฟแล้ว (แอดมินเท่านั้นพิมพ์ได้)");
  }

  if (message.content === "!unlockall") {
    if (!isAdmin) return;
    await unlockGuild(message.guild);
    message.channel.send("🔓 ปลดล็อกทั้งเซิร์ฟแล้ว");
  }

  // 🚫 กันพิมพ์ (สำรอง)
  if (serverLocked && !isAdmin) {
    message.delete().catch(() => {});
  }
});

client.login("YOUR_BOT_TOKEN");