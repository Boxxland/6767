const {
  Client,
  GatewayIntentBits,
  PermissionFlagsBits
} = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ]
});

// 🔥 ใส่ TOKEN ตรงนี้เลย
const TOKEN = "ใส่-token-มึงตรงนี้";

// ===== STATE =====
const spam = new Map();
const joins = [];

let raidMode = false;

// ===== READY =====
client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
});

// ===== LOCK =====
async function lockGuild(guild) {
  guild.channels.cache.forEach(async (ch) => {
    if (!ch.isTextBased()) return;

    try {
      await ch.permissionOverwrites.edit(guild.roles.everyone, {
        SendMessages: false
      });
    } catch {}
  });
}

// ===== UNLOCK =====
async function unlockGuild(guild) {
  guild.channels.cache.forEach(async (ch) => {
    if (!ch.isTextBased()) return;

    try {
      await ch.permissionOverwrites.edit(guild.roles.everyone, {
        SendMessages: null
      });
    } catch {}
  });
}

// ===== MESSAGE =====
client.on('messageCreate', async (msg) => {
  if (!msg.guild || msg.author.bot) return;

  const now = Date.now();

  if (msg.content === '!lock') {
    if (!msg.member.permissions.has(PermissionFlagsBits.Administrator)) return;
    await lockGuild(msg.guild);
    return msg.reply('🔒 ล็อกแล้ว');
  }

  if (msg.content === '!unlock') {
    if (!msg.member.permissions.has(PermissionFlagsBits.Administrator)) return;
    await unlockGuild(msg.guild);
    return msg.reply('🔓 ปลดล็อกแล้ว');
  }

  if (msg.content === '!raidmode') {
    if (!msg.member.permissions.has(PermissionFlagsBits.Administrator)) return;
    raidMode = !raidMode;
    return msg.reply(`🚨 Raid Mode: ${raidMode ? 'ON' : 'OFF'}`);
  }

  // ===== SPAM =====
  if (!spam.has(msg.author.id)) spam.set(msg.author.id, []);

  const arr = spam.get(msg.author.id);
  arr.push(now);

  while (arr.length && now - arr[0] > 8000) arr.shift();

  if (arr.length >= 6) {
    try {
      await msg.member.timeout(10 * 60 * 1000, 'Spam');
      msg.channel.send(`🚨 ${msg.author.tag} โดน timeout`);
    } catch {}
    spam.set(msg.author.id, []);
  }
});

// ===== RAID =====
client.on('guildMemberAdd', async (member) => {
  const now = Date.now();

  joins.push(now);

  while (joins.length && now - joins[0] > 10000) joins.shift();

  if (joins.length >= 5 && raidMode) {
    await lockGuild(member.guild);

    const sys = member.guild.systemChannel;
    if (sys) sys.send('🚨 RAID DETECTED');
  }
});

client.login(TOKEN);