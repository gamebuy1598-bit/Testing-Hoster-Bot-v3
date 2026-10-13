require('dotenv').config();
const {
  Client, GatewayIntentBits, Partials, EmbedBuilder, PermissionsBitField,
  ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder,
  REST, Routes, ActivityType, ChannelType, ModalBuilder, TextInputBuilder,
  TextInputStyle, StringSelectMenuBuilder, Collection
} = require('discord.js');
const Database = require('better-sqlite3');
const path = require('path');

// ================== CONFIG ==================
const env = process.env;
const cfg = {
  token: env.BOT_TOKEN,
  appId: env.APPLICATION_ID,
  name: env.BOT_NAME || 'Guardian Bot',
  status: env.BOT_STATUS || 'Over Your Server 🛡️',
  statusType: env.BOT_STATUS_TYPE || 'WATCHING',
  activityUrl: env.BOT_ACTIVITY_URL || '',
  devGuild: env.DEV_GUILD_ID || '',
  owners: (env.BOT_OWNER_IDS || '').split(',').map(s => s.trim()).filter(Boolean),
  brand: env.BRAND_NAME || 'Extreme Cloud',
  footer: env.EMBED_FOOTER || 'Guardian Bot',
  thumbnail: env.EMBED_THUMBNAIL_URL || '',
  colors: {
    primary: env.COLOR_PRIMARY || '#5865F2',
    success: env.COLOR_SUCCESS || '#57F287',
    error: env.COLOR_ERROR || '#ED4245',
    warning: env.COLOR_WARNING || '#FEE75C',
    info: env.COLOR_INFO || '#00BFFF',
  },
  antiSpam: {
    enabled: env.ANTI_SPAM_ENABLED === 'true',
    limit: +env.SPAM_MESSAGE_LIMIT || 5,
    window: +env.SPAM_TIME_WINDOW || 5000,
    timeout: +env.SPAM_TIMEOUT_DURATION || 600000,
    escalate: env.SPAM_ESCALATE === 'true',
    escalateThreshold: +env.SPAM_ESCALATE_THRESHOLD || 3,
  },
  antiNuke: {
    enabled: env.ANTI_NUKE_ENABLED === 'true',
    channelLimit: +env.NUKE_CHANNEL_LIMIT || 3,
    roleLimit: +env.NUKE_ROLE_LIMIT || 3,
    banLimit: +env.NUKE_BAN_LIMIT || 5,
    kickLimit: +env.NUKE_KICK_LIMIT || 5,
    window: +env.NUKE_TIME_WINDOW || 10000,
  },
  antiLink: {
    enabled: env.ANTI_LINK_ENABLED === 'true',
    antiInvite: env.ANTI_INVITE_ENABLED === 'true',
    allowlist: (env.ANTI_LINK_ALLOWLIST || '').split(',').map(s => s.trim().toLowerCase()).filter(Boolean),
    allowedRoles: (env.ALLOWED_LINK_ROLES || '').split(',').map(s => s.trim().toLowerCase()).filter(Boolean),
    warnMsg: env.LINK_WARN_MESSAGE || '🚫 Links allowed nahi hai!',
  },
  antiCaps: {
    enabled: env.ANTI_CAPS_ENABLED === 'true',
    threshold: +env.ANTI_CAPS_THRESHOLD || 70,
    minLength: +env.ANTI_CAPS_MIN_LENGTH || 10,
  },
  badWords: {
    enabled: env.BAD_WORD_FILTER_ENABLED === 'true',
    list: (env.BAD_WORDS || '').split(',').map(s => s.trim().toLowerCase()).filter(Boolean),
    action: env.BAD_WORD_ACTION || 'delete',
  },
  raid: {
    enabled: env.RAID_DETECTION_ENABLED === 'true',
    threshold: +env.RAID_JOIN_THRESHOLD || 10,
    window: +env.RAID_JOIN_WINDOW || 10000,
    duration: +env.RAID_LOCKDOWN_DURATION || 300000,
  },
  xp: {
    enabled: env.XP_ENABLED === 'true',
    min: +env.XP_MIN_PER_MESSAGE || 15,
    max: +env.XP_MAX_PER_MESSAGE || 25,
    cooldown: +env.XP_COOLDOWN || 60000,
    voicePerMin: +env.XP_VOICE_PER_MINUTE || 10,
    antiFarm: env.XP_ANTI_FARM === 'true',
    levelUpChannel: env.XP_LEVEL_UP_CHANNEL || '',
    levelUpMessage: env.XP_LEVEL_UP_MESSAGE || '🎉 {user} reached level **{level}**!',
    roleRewards: (env.XP_ROLE_REWARDS || '').split(',').map(s => {
      const [lvl, role] = s.split(':');
      return { level: +lvl, role: (role || '').trim() };
    }).filter(r => r.level && r.role),
    lbSize: +env.XP_LEADERBOARD_SIZE || 10,
  },
  tickets: {
    enabled: env.TICKETS_ENABLED === 'true',
    categories: {
      general: env.TICKET_CATEGORY_GENERAL || 'General Support',
      technical: env.TICKET_CATEGORY_TECHNICAL || 'Technical Support',
      billing: env.TICKET_CATEGORY_BILLING || 'Billing Support',
      other: env.TICKET_CATEGORY_OTHER || 'Other Requests',
    },
    staffRoles: (env.TICKET_STAFF_ROLES || '').split(',').map(s => s.trim().toLowerCase()).filter(Boolean),
    logChannel: env.TICKET_LOG_CHANNEL || 'ticket-logs',
    preventDuplicate: env.TICKET_PREVENT_DUPLICATE === 'true',
    transcript: env.TICKET_TRANSCRIPT_ENABLED === 'true',
    panelChannel: env.TICKET_PANEL_CHANNEL || '',
    maxOpen: +env.TICKET_MAX_OPEN_PER_USER || 1,
  },
  giveaway: {
    enabled: env.GIVEAWAY_ENABLED === 'true',
    defaultDuration: +env.GIVEAWAY_DEFAULT_DURATION || 3600000,
    defaultWinners: +env.GIVEAWAY_DEFAULT_WINNERS || 1,
    logChannel: env.GIVEAWAY_LOG_CHANNEL || 'giveaway-logs',
    requireRole: env.GIVEAWAY_REQUIRE_ROLE || '',
    minAge: +env.GIVEAWAY_MIN_ACCOUNT_AGE || 7,
  },
  welcome: {
    enabled: env.WELCOME_ENABLED === 'true',
    channel: env.WELCOME_CHANNEL || 'welcome',
    message: env.WELCOME_MESSAGE || 'Welcome {user} to **{server}**!',
    image: env.WELCOME_IMAGE_URL || '',
  },
  goodbye: {
    enabled: env.GOODBYE_ENABLED === 'true',
    channel: env.GOODBYE_CHANNEL || 'goodbye',
    message: env.GOODBYE_MESSAGE || '{user} left the server.',
    image: env.GOODBYE_IMAGE_URL || '',
  },
  verify: {
    enabled: env.VERIFICATION_ENABLED === 'true',
    channel: env.VERIFICATION_CHANNEL || 'verify',
    role: env.VERIFICATION_ROLE || 'Verified',
    unverifiedRole: env.UNVERIFIED_ROLE || 'Unverified',
    message: env.VERIFICATION_MESSAGE || 'Click below to verify!',
    autoRoleEnabled: env.AUTO_ROLE_ENABLED === 'true',
    autoRoles: (env.AUTO_ROLE_IDS || '').split(',').map(s => s.trim()).filter(Boolean),
  },
  stats: {
    enabled: env.STATS_ENABLED === 'true',
    members: env.STATS_CHANNEL_MEMBERS || '📊 Members: {count}',
    humans: env.STATS_CHANNEL_HUMANS || '👥 Humans: {count}',
    bots: env.STATS_CHANNEL_BOTS || '🤖 Bots: {count}',
    interval: +env.STATS_UPDATE_INTERVAL || 600000,
  },
  logs: {
    enabled: env.LOG_ENABLED === 'true',
    channel: env.LOG_CHANNEL || 'bot-logs',
    modChannel: env.MOD_LOG_CHANNEL || 'mod-logs',
    memberJoin: env.LOG_MEMBER_JOIN === 'true',
    memberLeave: env.LOG_MEMBER_LEAVE === 'true',
    msgEdit: env.LOG_MESSAGE_EDIT === 'true',
    msgDelete: env.LOG_MESSAGE_DELETE === 'true',
    voice: env.LOG_VOICE === 'true',
    roleChanges: env.LOG_ROLE_CHANGES === 'true',
    channelChanges: env.LOG_CHANNEL_CHANGES === 'true',
    tickets: env.LOG_TICKETS === 'true',
    giveaways: env.LOG_GIVEAWAYS === 'true',
    verification: env.LOG_VERIFICATION === 'true',
    security: env.LOG_SECURITY === 'true',
  },
  dbPath: env.DATABASE_PATH || './guardian.db',
};

// ================== DATABASE ==================
const db = new Database(cfg.dbPath);
db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS xp (
    guild_id TEXT, user_id TEXT,
    xp INTEGER DEFAULT 0, level INTEGER DEFAULT 0,
    last_message INTEGER DEFAULT 0,
    voice_minutes INTEGER DEFAULT 0,
    PRIMARY KEY (guild_id, user_id)
  );
  CREATE TABLE IF NOT EXISTS warnings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    guild_id TEXT, user_id TEXT, mod_id TEXT,
    reason TEXT, timestamp INTEGER
  );
  CREATE TABLE IF NOT EXISTS cases (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    guild_id TEXT, case_number INTEGER, action TEXT,
    user_id TEXT, mod_id TEXT, reason TEXT,
    duration INTEGER, timestamp INTEGER
  );
  CREATE TABLE IF NOT EXISTS tickets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    guild_id TEXT, channel_id TEXT, user_id TEXT,
    type TEXT, status TEXT DEFAULT 'open',
    claimed_by TEXT, reason TEXT,
    created_at INTEGER, closed_at INTEGER
  );
  CREATE TABLE IF NOT EXISTS giveaways (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    guild_id TEXT, channel_id TEXT, message_id TEXT,
    host_id TEXT, prize TEXT, winners INTEGER,
    ends_at INTEGER, ended INTEGER DEFAULT 0,
    requirements TEXT, entries TEXT DEFAULT '[]',
    reroll_history TEXT DEFAULT '[]'
  );
  CREATE TABLE IF NOT EXISTS modstats (
    guild_id TEXT, mod_id TEXT,
    actions INTEGER DEFAULT 0,
    PRIMARY KEY (guild_id, mod_id)
  );
  CREATE TABLE IF NOT EXISTS verify_codes (
    guild_id TEXT, user_id TEXT, code TEXT,
    timestamp INTEGER,
    PRIMARY KEY (guild_id, user_id)
  );
`);

// Prepared statements
const S = {
  getXP: db.prepare('SELECT * FROM xp WHERE guild_id=? AND user_id=?'),
  upsertXP: db.prepare(`INSERT INTO xp (guild_id, user_id, xp, level, last_message, voice_minutes)
    VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT(guild_id, user_id) DO UPDATE SET
      xp=excluded.xp, level=excluded.level,
      last_message=excluded.last_message, voice_minutes=excluded.voice_minutes`),
  topXP: db.prepare('SELECT * FROM xp WHERE guild_id=? ORDER BY xp DESC LIMIT ?'),
  rank: db.prepare('SELECT COUNT(*) AS r FROM xp WHERE guild_id=? AND xp > ?'),
  addWarn: db.prepare('INSERT INTO warnings (guild_id, user_id, mod_id, reason, timestamp) VALUES (?,?,?,?,?)'),
  getWarns: db.prepare('SELECT * FROM warnings WHERE guild_id=? AND user_id=? ORDER BY timestamp DESC'),
  clearWarns: db.prepare('DELETE FROM warnings WHERE guild_id=? AND user_id=?'),
  addCase: db.prepare(`INSERT INTO cases (guild_id, case_number, action, user_id, mod_id, reason, duration, timestamp)
    VALUES (?,?,?,?,?,?,?,?)`),
  getCase: db.prepare('SELECT * FROM cases WHERE guild_id=? AND case_number=?'),
  lastCaseNum: db.prepare('SELECT MAX(case_number) AS m FROM cases WHERE guild_id=?'),
  addModAction: db.prepare(`INSERT INTO modstats (guild_id, mod_id, actions) VALUES (?,?,1)
    ON CONFLICT(guild_id, mod_id) DO UPDATE SET actions=actions+1`),
  getModStats: db.prepare('SELECT * FROM modstats WHERE guild_id=? ORDER BY actions DESC LIMIT 10'),
  createTicket: db.prepare(`INSERT INTO tickets (guild_id, channel_id, user_id, type, status, created_at)
    VALUES (?,?,?,?, 'open', ?)`),
  getTicketByChannel: db.prepare('SELECT * FROM tickets WHERE channel_id=?'),
  getOpenTickets: db.prepare("SELECT * FROM tickets WHERE guild_id=? AND user_id=? AND status='open'"),
  closeTicket: db.prepare("UPDATE tickets SET status='closed', closed_at=?, reason=? WHERE channel_id=?"),
  claimTicket: db.prepare('UPDATE tickets SET claimed_by=? WHERE channel_id=?'),
  reopenTicket: db.prepare("UPDATE tickets SET status='open', closed_at=NULL WHERE channel_id=?"),
  createGiveaway: db.prepare(`INSERT INTO giveaways (guild_id, channel_id, message_id, host_id, prize, winners, ends_at, requirements, entries)
    VALUES (?,?,?,?,?,?,?,?, '[]')`),
  getGiveaway: db.prepare('SELECT * FROM giveaways WHERE message_id=?'),
  getActiveGiveaways: db.prepare('SELECT * FROM giveaways WHERE ended=0'),
  updateGiveawayEntries: db.prepare('UPDATE giveaways SET entries=? WHERE message_id=?'),
  endGiveaway: db.prepare('UPDATE giveaways SET ended=1 WHERE message_id=?'),
  updateReroll: db.prepare('UPDATE giveaways SET reroll_history=? WHERE message_id=?'),
  setVerifyCode: db.prepare('INSERT OR REPLACE INTO verify_codes (guild_id, user_id, code, timestamp) VALUES (?,?,?,?)'),
  getVerifyCode: db.prepare('SELECT * FROM verify_codes WHERE guild_id=? AND user_id=?'),
  delVerifyCode: db.prepare('DELETE FROM verify_codes WHERE guild_id=? AND user_id=?'),
};

// ================== CLIENT ==================
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildModeration, GatewayIntentBits.GuildBans,
    GatewayIntentBits.GuildVoiceStates, GatewayIntentBits.GuildInvites,
    GatewayIntentBits.GuildPresences,
  ],
  partials: [Partials.Message, Partials.Channel, Partials.GuildMember, Partials.User],
});

client.commands = new Collection();

// ================== HELPERS ==================
const C = cfg.colors;

function em(title, desc, color = C.primary, extra = {}) {
  const e = new EmbedBuilder().setColor(color);
  if (title) e.setTitle(title);
  if (desc) e.setDescription(desc);
  if (cfg.footer) e.setFooter({ text: cfg.footer, iconURL: client.user?.displayAvatarURL() });
  e.setTimestamp();
  return Object.assign(e, extra);
}
const sleep = ms => new Promise(r => setTimeout(r, ms));
function bar(cur, total, size = 12) {
  const f = Math.max(0, Math.min(size, Math.round((cur / Math.max(1, total)) * size)));
  return '█'.repeat(f) + '░'.repeat(size - f);
}
function randInt(a, b) { return Math.floor(Math.random() * (b - a + 1)) + a; }
function xpNeeded(level) { return 5 * level * level + 50 * level + 100; }
function totalXPFor(level) { let t = 0; for (let i = 0; i < level; i++) t += xpNeeded(i); return t; }

async function findChannel(guild, nameOrId) {
  if (!nameOrId) return null;
  return guild.channels.cache.get(nameOrId) ||
    guild.channels.cache.find(c => c.name === nameOrId && c.type === ChannelType.GuildText);
}
async function sendLog(guild, e, modLog = false) {
  if (!cfg.logs.enabled) return;
  const ch = await findChannel(guild, modLog ? cfg.logs.modChannel : cfg.logs.channel);
  if (ch) ch.send({ embeds: [e] }).catch(() => {});
}

function hasRole(member, roles) {
  if (!member) return false;
  if (member.permissions.has(PermissionsBitField.Flags.Administrator)) return true;
  return member.roles.cache.some(r => roles.includes(r.name.toLowerCase()));
}
function isStaff(member) { return hasRole(member, cfg.tickets.staffRoles); }

function containsLink(text) {
  return /(https?:\/\/[^\s]+)|(www\.[^\s]+)/gi.test(text);
}
function containsInvite(text) {
  return /(discord\.(gg|io|me|li)\/.+)|(discordapp\.com\/invite\/.+)|(discord\.com\/invite\/.+)/gi.test(text);
}
function extractUrls(text) {
  return text.match(/(https?:\/\/[^\s]+)|(www\.[^\s]+)/gi) || [];
}
function capsRatio(text) {
  const letters = text.replace(/[^a-zA-Z]/g, '');
  if (!letters.length) return 0;
  const caps = letters.replace(/[^A-Z]/g, '').length;
  return Math.round((caps / letters.length) * 100);
}

async function recordCase(guild, action, userId, modId, reason, duration = null) {
  const last = S.lastCaseNum.get(guild.id)?.m || 0;
  const num = last + 1;
  S.addCase.run(guild.id, num, action, userId, modId, reason || '', duration, Date.now());
  return num;
}

// ================== READY ==================
client.once('ready', async () => {
  console.log(`\n🛡️  ${cfg.name} online → ${client.user.tag}`);
  const tMap = { PLAYING: ActivityType.Playing, WATCHING: ActivityType.Watching,
    LISTENING: ActivityType.Listening, COMPETING: ActivityType.Competing, STREAMING: ActivityType.Streaming };
  client.user.setPresence({
    activities: [{ name: cfg.status, type: tMap[cfg.statusType] || ActivityType.Watching,
      url: cfg.statusType === 'STREAMING' ? cfg.activityUrl : undefined }],
    status: 'online',
  });

  await registerCommands();
  await restoreGiveaways();
  if (cfg.stats.enabled) startStatsLoop();
  console.log('✅ Ready');
});

// ================== SLASH COMMANDS ==================
async function registerCommands() {
  const cmds = [
    // Moderation
    new SlashCommandBuilder().setName('ban').setDescription('Ban a user')
      .addUserOption(o => o.setName('user').setDescription('User').setRequired(true))
      .addStringOption(o => o.setName('reason').setDescription('Reason'))
      .setDefaultMemberPermissions(PermissionsBitField.Flags.BanMembers),
    new SlashCommandBuilder().setName('unban').setDescription('Unban a user')
      .addStringOption(o => o.setName('userid').setDescription('User ID').setRequired(true))
      .addStringOption(o => o.setName('reason').setDescription('Reason'))
      .setDefaultMemberPermissions(PermissionsBitField.Flags.BanMembers),
    new SlashCommandBuilder().setName('kick').setDescription('Kick a user')
      .addUserOption(o => o.setName('user').setDescription('User').setRequired(true))
      .addStringOption(o => o.setName('reason').setDescription('Reason'))
      .setDefaultMemberPermissions(PermissionsBitField.Flags.KickMembers),
    new SlashCommandBuilder().setName('timeout').setDescription('Timeout a user')
      .addUserOption(o => o.setName('user').setDescription('User').setRequired(true))
      .addIntegerOption(o => o.setName('minutes').setDescription('Minutes').setRequired(true))
      .addStringOption(o => o.setName('reason').setDescription('Reason'))
      .setDefaultMemberPermissions(PermissionsBitField.Flags.ModerateMembers),
    new SlashCommandBuilder().setName('untimeout').setDescription('Remove timeout')
      .addUserOption(o => o.setName('user').setDescription('User').setRequired(true))
      .setDefaultMemberPermissions(PermissionsBitField.Flags.ModerateMembers),
    new SlashCommandBuilder().setName('warn').setDescription('Warn a user')
      .addUserOption(o => o.setName('user').setDescription('User').setRequired(true))
      .addStringOption(o => o.setName('reason').setDescription('Reason'))
      .setDefaultMemberPermissions(PermissionsBitField.Flags.ModerateMembers),
    new SlashCommandBuilder().setName('warnings').setDescription('View warnings')
      .addUserOption(o => o.setName('user').setDescription('User').setRequired(true)),
    new SlashCommandBuilder().setName('clear').setDescription('Clear messages')
      .addIntegerOption(o => o.setName('amount').setDescription('1-100').setRequired(true))
      .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageMessages),
    new SlashCommandBuilder().setName('purge-user').setDescription('Purge a user\'s messages')
      .addUserOption(o => o.setName('user').setDescription('User').setRequired(true))
      .addIntegerOption(o => o.setName('amount').setDescription('1-100').setRequired(true))
      .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageMessages),
    new SlashCommandBuilder().setName('slowmode').setDescription('Set slowmode')
      .addIntegerOption(o => o.setName('seconds').setDescription('Seconds').setRequired(true))
      .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageChannels),
    new SlashCommandBuilder().setName('lock').setDescription('Lock channel')
      .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageChannels),
    new SlashCommandBuilder().setName('unlock').setDescription('Unlock channel')
      .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageChannels),
    new SlashCommandBuilder().setName('hide').setDescription('Hide channel')
      .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageChannels),
    new SlashCommandBuilder().setName('unhide').setDescription('Unhide channel')
      .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageChannels),
    new SlashCommandBuilder().setName('nick').setDescription('Change nickname')
      .addUserOption(o => o.setName('user').setDescription('User').setRequired(true))
      .addStringOption(o => o.setName('name').setDescription('New nickname'))
      .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageNicknames),
    new SlashCommandBuilder().setName('role').setDescription('Add role to user')
      .addUserOption(o => o.setName('user').setDescription('User').setRequired(true))
      .addRoleOption(o => o.setName('role').setDescription('Role').setRequired(true))
      .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageRoles),
    new SlashCommandBuilder().setName('unrole').setDescription('Remove role from user')
      .addUserOption(o => o.setName('user').setDescription('User').setRequired(true))
      .addRoleOption(o => o.setName('role').setDescription('Role').setRequired(true))
      .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageRoles),
    new SlashCommandBuilder().setName('modstats').setDescription('View moderator stats'),
    new SlashCommandBuilder().setName('case').setDescription('View a moderation case')
      .addIntegerOption(o => o.setName('number').setDescription('Case number').setRequired(true)),

    // Info
    new SlashCommandBuilder().setName('help').setDescription('Show all commands'),
    new SlashCommandBuilder().setName('ping').setDescription('Bot latency'),
    new SlashCommandBuilder().setName('botinfo').setDescription('Bot info'),
    new SlashCommandBuilder().setName('serverinfo').setDescription('Server info'),
    new SlashCommandBuilder().setName('userinfo').setDescription('User info')
      .addUserOption(o => o.setName('user').setDescription('User')),
    new SlashCommandBuilder().setName('avatar').setDescription('User avatar')
      .addUserOption(o => o.setName('user').setDescription('User')),
    new SlashCommandBuilder().setName('banner').setDescription('User banner')
      .addUserOption(o => o.setName('user').setDescription('User')),
    new SlashCommandBuilder().setName('roleinfo').setDescription('Role info')
      .addRoleOption(o => o.setName('role').setDescription('Role').setRequired(true)),
    new SlashCommandBuilder().setName('channelinfo').setDescription('Channel info')
      .addChannelOption(o => o.setName('channel').setDescription('Channel')),
    new SlashCommandBuilder().setName('invite').setDescription('Bot invite link'),
    new SlashCommandBuilder().setName('uptime').setDescription('Bot uptime'),
    new SlashCommandBuilder().setName('stats').setDescription('Server statistics'),

    // XP
    new SlashCommandBuilder().setName('rank').setDescription('View your rank')
      .addUserOption(o => o.setName('user').setDescription('User')),
    new SlashCommandBuilder().setName('leaderboard').setDescription('XP leaderboard'),

    // Tickets
    new SlashCommandBuilder().setName('ticket-panel').setDescription('Send ticket panel')
      .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageGuild),
    new SlashCommandBuilder().setName('ticket-stats').setDescription('Ticket statistics'),

    // Giveaways
    new SlashCommandBuilder().setName('giveaway').setDescription('Giveaway manager')
      .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageGuild)
      .addSubcommand(s => s.setName('create').setDescription('Create giveaway')
        .addStringOption(o => o.setName('prize').setDescription('Prize').setRequired(true))
        .addIntegerOption(o => o.setName('minutes').setDescription('Duration (min)').setRequired(true))
        .addIntegerOption(o => o.setName('winners').setDescription('Winner count')))
      .addSubcommand(s => s.setName('end').setDescription('End giveaway')
        .addStringOption(o => o.setName('message_id').setDescription('Message ID').setRequired(true)))
      .addSubcommand(s => s.setName('reroll').setDescription('Reroll winner')
        .addStringOption(o => o.setName('message_id').setDescription('Message ID').setRequired(true)))
      .addSubcommand(s => s.setName('list').setDescription('List active giveaways')),

    // Setup
    new SlashCommandBuilder().setName('setup-verify').setDescription('Setup verification panel')
      .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageGuild),
    new SlashCommandBuilder().setName('reset-xp').setDescription('Reset a user XP (owner)')
      .addUserOption(o => o.setName('user').setDescription('User').setRequired(true))
      .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator),
  ].map(c => c.toJSON());

  const rest = new REST({ version: '10' }).setToken(cfg.token);
  try {
    if (cfg.devGuild) {
      await rest.put(Routes.applicationGuildCommands(cfg.appId || client.user.id, cfg.devGuild), { body: cmds });
      console.log('✅ Guild commands registered');
    } else {
      await rest.put(Routes.applicationCommands(cfg.appId || client.user.id), { body: cmds });
      console.log('✅ Global commands registered');
    }
  } catch (e) { console.error('Command registration failed:', e); }
}

// ================== INTERACTION HANDLER ==================
client.on('interactionCreate', async (interaction) => {
  try {
    if (interaction.isButton()) return handleButton(interaction);
    if (interaction.isModalSubmit()) return handleModal(interaction);
    if (!interaction.isChatInputCommand()) return;
    await handleCommand(interaction);
  } catch (err) {
    console.error('Interaction error:', err);
    const e = em('❌ Error', `\`\`\`${err.message}\`\`\``, C.error);
    if (interaction.deferred || interaction.replied) interaction.followUp({ embeds: [e], ephemeral: true }).catch(() => {});
    else interaction.reply({ embeds: [e], ephemeral: true }).catch(() => {});
  }
});

async function handleCommand(interaction) {
  const { commandName: cmd, guild, member, options } = interaction;
  const reply = (e, ephemeral = false) => interaction.reply({ embeds: [e], ephemeral });
  const hasPerm = p => member.permissions.has(p);

  switch (cmd) {
    case 'ping': {
      const sent = await interaction.deferReply({ fetchReply: true });
      const lat = sent.createdTimestamp - interaction.createdTimestamp;
      return interaction.editReply({ embeds: [em('🏓 Pong!', null, C.info).addFields(
        { name: '📡 Bot', value: `\`${lat}ms\``, inline: true },
        { name: '💓 API', value: `\`${Math.round(client.ws.ping)}ms\``, inline: true },
        { name: '⏱️ Uptime', value: `\`${fmtUptime(client.uptime)}\``, inline: true })] });
    }

    case 'help': {
      return reply(em(`🛡️ ${cfg.name} — Commands`, null, C.primary)
        .setThumbnail(client.user.displayAvatarURL())
        .addFields(
          { name: '🔨 Moderation', value: '`/ban` `/unban` `/kick` `/timeout` `/untimeout` `/warn` `/warnings` `/clear` `/purge-user` `/slowmode` `/lock` `/unlock` `/hide` `/unhide` `/nick` `/role` `/unrole` `/modstats` `/case`' },
          { name: '📊 XP / Levels', value: '`/rank` `/leaderboard` `/reset-xp`' },
          { name: '🎫 Tickets', value: '`/ticket-panel` `/ticket-stats`' },
          { name: '🎁 Giveaways', value: '`/giveaway create` `/giveaway end` `/giveaway reroll` `/giveaway list`' },
          { name: 'ℹ️ Info', value: '`/help` `/ping` `/botinfo` `/serverinfo` `/userinfo` `/avatar` `/banner` `/roleinfo` `/channelinfo` `/invite` `/uptime` `/stats`' },
          { name: '🛡️ Auto Systems', value: 'Anti-Spam • Anti-Nuke • Anti-Link • Anti-Caps • Bad Words • Raid Detection • Welcome • Auto-Role • Verification • Statistics' }));
    }

    // ---------- MODERATION ----------
    case 'ban': {
      if (!hasPerm(PermissionsBitField.Flags.BanMembers)) return reply(em('❌ No Permission', 'Need **Ban Members**.', C.error), true);
      const u = options.getUser('user'); const reason = options.getString('reason') || 'No reason';
      const m = await guild.members.fetch(u.id).catch(() => null);
      if (!m) {
        try { await guild.bans.create(u.id, { reason }); }
        catch { return reply(em('❌ Failed', 'Could not ban.', C.error), true); }
      } else {
        if (!m.bannable) return reply(em('❌ Cannot Ban', 'User has higher role than me.', C.error), true);
        await m.ban({ reason });
      }
      const cn = await recordCase(guild, 'ban', u.id, member.id, reason);
      S.addModAction.run(guild.id, member.id);
      reply(em('🔨 User Banned', `**${u.tag}** banned.\n**Case:** #${cn}\n**Reason:** ${reason}`, C.success));
      return sendLog(guild, em('🔨 Ban',
        `**User:** ${u.tag} (\`${u.id}\`)\n**Mod:** ${member.user.tag}\n**Case:** #${cn}\n**Reason:** ${reason}`, C.error), true);
    }

    case 'unban': {
      if (!hasPerm(PermissionsBitField.Flags.BanMembers)) return reply(em('❌ No Permission', 'Need **Ban Members**.', C.error), true);
      const id = options.getString('userid'); const reason = options.getString('reason') || 'No reason';
      try { await guild.bans.remove(id, reason); }
      catch { return reply(em('❌ Failed', 'User not banned or invalid ID.', C.error), true); }
      const cn = await recordCase(guild, 'unban', id, member.id, reason);
      S.addModAction.run(guild.id, member.id);
      reply(em('✅ User Unbanned', `**${id}** unbanned.\n**Case:** #${cn}`, C.success));
      return sendLog(guild, em('✅ Unban', `**User ID:** ${id}\n**Mod:** ${member.user.tag}\n**Case:** #${cn}`, C.success), true);
    }

    case 'kick': {
      if (!hasPerm(PermissionsBitField.Flags.KickMembers)) return reply(em('❌ No Permission', 'Need **Kick Members**.', C.error), true);
      const u = options.getUser('user'); const reason = options.getString('reason') || 'No reason';
      const m = await guild.members.fetch(u.id).catch(() => null);
      if (!m || !m.kickable) return reply(em('❌ Cannot Kick', 'User not kickable.', C.error), true);
      await m.kick(reason);
      const cn = await recordCase(guild, 'kick', u.id, member.id, reason);
      S.addModAction.run(guild.id, member.id);
      reply(em('👢 User Kicked', `**${u.tag}** kicked.\n**Case:** #${cn}`, C.success));
      return sendLog(guild, em('👢 Kick', `**User:** ${u.tag}\n**Mod:** ${member.user.tag}\n**Case:** #${cn}\n**Reason:** ${reason}`, C.warning), true);
    }

    case 'timeout': {
      if (!hasPerm(PermissionsBitField.Flags.ModerateMembers)) return reply(em('❌ No Permission', 'Need **Moderate Members**.', C.error), true);
      const u = options.getUser('user'); const mins = options.getInteger('minutes');
      const reason = options.getString('reason') || 'No reason';
      if (mins < 1 || mins > 40320) return reply(em('❌ Invalid', '1-40320 minutes only.', C.error), true);
      const m = await guild.members.fetch(u.id).catch(() => null);
      if (!m || !m.moderatable) return reply(em('❌ Cannot Timeout', 'User not moderatable.', C.error), true);
      await m.timeout(mins * 60 * 1000, reason);
      const cn = await recordCase(guild, 'timeout', u.id, member.id, reason, mins * 60 * 1000);
      S.addModAction.run(guild.id, member.id);
      reply(em('⏰ Timeout Applied', `**${u.tag}** muted for **${mins}m**.\n**Case:** #${cn}`, C.warning));
      return sendLog(guild, em('⏰ Timeout', `**User:** ${u.tag}\n**Mod:** ${member.user.tag}\n**Duration:** ${mins}m\n**Case:** #${cn}`, C.warning), true);
    }

    case 'untimeout': {
      if (!hasPerm(PermissionsBitField.Flags.ModerateMembers)) return reply(em('❌ No Permission', 'Need **Moderate Members**.', C.error), true);
      const u = options.getUser('user');
      const m = await guild.members.fetch(u.id).catch(() => null);
      if (!m || !m.moderatable) return reply(em('❌ Failed', 'Cannot untimeout.', C.error), true);
      await m.timeout(null);
      const cn = await recordCase(guild, 'untimeout', u.id, member.id, 'Manual');
      reply(em('✅ Timeout Removed', `**${u.tag}** can talk again.`, C.success));
      return sendLog(guild, em('✅ Untimeout', `**User:** ${u.tag}\n**Mod:** ${member.user.tag}\n**Case:** #${cn}`, C.success), true);
    }

    case 'warn': {
      if (!hasPerm(PermissionsBitField.Flags.ModerateMembers)) return reply(em('❌ No Permission', 'Need **Moderate Members**.', C.error), true);
      const u = options.getUser('user'); const reason = options.getString('reason') || 'No reason';
      S.addWarn.run(guild.id, u.id, member.id, reason, Date.now());
      const cn = await recordCase(guild, 'warn', u.id, member.id, reason);
      S.addModAction.run(guild.id, member.id);
      const warns = S.getWarns.all(guild.id, u.id);
      reply(em('⚠️ Warning Issued', `**${u.tag}** warned.\n**Case:** #${cn}\n**Total:** \`${warns.length}\`\n**Reason:** ${reason}`, C.warning));
      return sendLog(guild, em('⚠️ Warn', `**User:** ${u.tag}\n**Mod:** ${member.user.tag}\n**Case:** #${cn}\n**Reason:** ${reason}`, C.warning), true);
    }

    case 'warnings': {
      const u = options.getUser('user');
      const warns = S.getWarns.all(guild.id, u.id);
      if (!warns.length) return reply(em('📋 No Warnings', `**${u.tag}** has no warnings.`, C.success));
      const list = warns.slice(0, 10).map((w, i) =>
        `**#${i + 1}** • <@${w.mod_id}> • <t:${Math.floor(w.timestamp / 1000)}:R>\n└ *${w.reason}*`).join('\n');
      return reply(em(`📋 Warnings — ${u.tag} (${warns.length})`, list, C.warning));
    }

    case 'clear': {
      if (!hasPerm(PermissionsBitField.Flags.ManageMessages)) return reply(em('❌ No Permission', 'Need **Manage Messages**.', C.error), true);
      const n = options.getInteger('amount');
      if (n < 1 || n > 100) return reply(em('❌ Invalid', '1-100 only.', C.error), true);
      const del = await interaction.channel.bulkDelete(n, true);
      const r = await reply(em('🧹 Cleared', `Deleted **${del.size}** messages.`, C.success));
      setTimeout(() => interaction.deleteReply().catch(() => {}), 3000);
    }

    case 'purge-user': {
      if (!hasPerm(PermissionsBitField.Flags.ManageMessages)) return reply(em('❌ No Permission', 'Need **Manage Messages**.', C.error), true);
      const u = options.getUser('user'); const n = options.getInteger('amount');
      if (n < 1 || n > 100) return reply(em('❌ Invalid', '1-100 only.', C.error), true);
      const msgs = await interaction.channel.messages.fetch({ limit: 100 });
      const filtered = msgs.filter(m => m.author.id === u.id).first(n);
      await interaction.channel.bulkDelete(filtered, true);
      const r = await reply(em('🧹 Purged', `Deleted **${filtered.length}** messages from **${u.tag}**.`, C.success));
      setTimeout(() => interaction.deleteReply().catch(() => {}), 3000);
    }

    case 'slowmode': {
      if (!hasPerm(PermissionsBitField.Flags.ManageChannels)) return reply(em('❌ No Permission', 'Need **Manage Channels**.', C.error), true);
      const s = options.getInteger('seconds');
      await interaction.channel.setRateLimitPerUser(s);
      return reply(em('🐌 Slowmode', `Set to **${s}s**.`, C.info));
    }

    case 'lock': {
      if (!hasPerm(PermissionsBitField.Flags.ManageChannels)) return reply(em('❌ No Permission', 'Need **Manage Channels**.', C.error), true);
      await interaction.channel.permissionOverwrites.edit(guild.roles.everyone, { SendMessages: false });
      return reply(em('🔒 Locked', 'Channel locked.', C.warning));
    }

    case 'unlock': {
      if (!hasPerm(PermissionsBitField.Flags.ManageChannels)) return reply(em('❌ No Permission', 'Need **Manage Channels**.', C.error), true);
      await interaction.channel.permissionOverwrites.edit(guild.roles.everyone, { SendMessages: null });
      return reply(em('🔓 Unlocked', 'Channel unlocked.', C.success));
    }

    case 'hide': {
      if (!hasPerm(PermissionsBitField.Flags.ManageChannels)) return reply(em('❌ No Permission', 'Need **Manage Channels**.', C.error), true);
      await interaction.channel.permissionOverwrites.edit(guild.roles.everyone, { ViewChannel: false });
      return reply(em('🙈 Hidden', 'Channel hidden.', C.info));
    }

    case 'unhide': {
      if (!hasPerm(PermissionsBitField.Flags.ManageChannels)) return reply(em('❌ No Permission', 'Need **Manage Channels**.', C.error), true);
      await interaction.channel.permissionOverwrites.edit(guild.roles.everyone, { ViewChannel: null });
      return reply(em('👁️ Visible', 'Channel unhidden.', C.success));
    }

    case 'nick': {
      if (!hasPerm(PermissionsBitField.Flags.ManageNicknames)) return reply(em('❌ No Permission', 'Need **Manage Nicknames**.', C.error), true);
      const u = options.getUser('user'); const name = options.getString('name');
      const m = await guild.members.fetch(u.id).catch(() => null);
      if (!m) return reply(em('❌ Not Found', 'Member not in server.', C.error), true);
      try { await m.setNickname(name || null); }
      catch { return reply(em('❌ Failed', 'Cannot change nickname (hierarchy).', C.error), true); }
      return reply(em('✏️ Nickname', name ? `Set **${u.tag}** → \`${name}\`` : `Reset **${u.tag}**`, C.success));
    }

    case 'role': {
      if (!hasPerm(PermissionsBitField.Flags.ManageRoles)) return reply(em('❌ No Permission', 'Need **Manage Roles**.', C.error), true);
      const u = options.getUser('user'); const role = options.getRole('role');
      const m = await guild.members.fetch(u.id).catch(() => null);
      if (!m) return reply(em('❌ Not Found', 'Member not in server.', C.error), true);
      if (role.position >= guild.members.me.roles.highest.position) return reply(em('❌ Cannot', 'Role higher than mine.', C.error), true);
      await m.roles.add(role).catch(err => null);
      return reply(em('✅ Role Added', `${role} → ${u.tag}`, C.success));
    }

    case 'unrole': {
      if (!hasPerm(PermissionsBitField.Flags.ManageRoles)) return reply(em('❌ No Permission', 'Need **Manage Roles**.', C.error), true);
      const u = options.getUser('user'); const role = options.getRole('role');
      const m = await guild.members.fetch(u.id).catch(() => null);
      if (!m) return reply(em('❌ Not Found', 'Not in server.', C.error), true);
      await m.roles.remove(role).catch(() => null);
      return reply(em('✅ Role Removed', `${role} removed from ${u.tag}`, C.success));
    }

    case 'modstats': {
      const rows = S.getModStats.all(guild.id);
      if (!rows.length) return reply(em('📊 No Data', 'No moderator actions recorded yet.', C.info));
      const list = rows.map((r, i) => `**#${i + 1}** <@${r.mod_id}> — \`${r.actions}\` actions`).join('\n');
      return reply(em('📊 Moderator Leaderboard', list, C.primary));
    }

    case 'case': {
      const n = options.getInteger('number');
      const c = S.getCase.get(guild.id, n);
      if (!c) return reply(em('❌ Not Found', `Case #${n} doesn't exist.`, C.error), true);
      return reply(em(`📁 Case #${c.case_number}`, null, C.info).addFields(
        { name: 'Action', value: `\`${c.action.toUpperCase()}\``, inline: true },
        { name: 'User', value: `<@${c.user_id}>`, inline: true },
        { name: 'Moderator', value: `<@${c.mod_id}>`, inline: true },
        { name: 'Reason', value: c.reason || 'None' },
        { name: 'Date', value: `<t:${Math.floor(c.timestamp / 1000)}:F>` },
      ));
    }

    // ---------- XP ----------
    case 'rank': {
      const u = options.getUser('user') || interaction.user;
      const d = S.getXP.get(guild.id, u.id) || { xp: 0, level: 0 };
      const need = xpNeeded(d.level);
      const cur = d.xp - totalXPFor(d.level);
      const rankRow = S.rank.get(guild.id, d.xp);
      const rank = rankRow?.r + 1 || 1;
      const pct = Math.min(100, Math.round((cur / need) * 100));
      const progress = bar(cur, need, 20);
      return reply(em(`📊 ${u.username}'s Rank`, null, C.primary)
        .setThumbnail(u.displayAvatarURL({ size: 256 }))
        .addFields(
          { name: '🏆 Rank', value: `\`#${rank}\``, inline: true },
          { name: '⭐ Level', value: `\`${d.level}\``, inline: true },
          { name: '✨ XP', value: `\`${d.xp}\``, inline: true },
          { name: `📈 Progress (${pct}%)`, value: `\`${progress}\`\n\`${cur}/${need} XP\`` },
        ));
    }

    case 'leaderboard': {
      const rows = S.topXP.all(guild.id, cfg.xp.lbSize);
      if (!rows.length) return reply(em('📊 Empty', 'No data yet!', C.info));
      const list = await Promise.all(rows.map(async (r, i) => {
        const u = await client.users.fetch(r.user_id).catch(() => null);
        const medal = ['🥇', '🥈', '🥉'][i] || `**#${i + 1}**`;
        return `${medal} ${u ? u.tag : r.user_id} — Lvl \`${r.level}\` • \`${r.xp}\` XP`;
      }));
      return reply(em('🏆 XP Leaderboard', list.join('\n'), C.primary));
    }

    case 'reset-xp': {
      if (!hasPerm(PermissionsBitField.Flags.Administrator)) return reply(em('❌ No Permission', 'Need **Administrator**.', C.error), true);
      const u = options.getUser('user');
      S.upsertXP.run(guild.id, u.id, 0, 0, 0, 0);
      return reply(em('✅ XP Reset', `XP for **${u.tag}** has been reset.`, C.success));
    }

    // ---------- INFO ----------
    case 'botinfo': {
      const mem = process.memoryUsage();
      return reply(em(`🤖 ${cfg.name}`, null, C.primary)
        .setThumbnail(client.user.displayAvatarURL())
        .addFields(
          { name: '👑 Owner', value: cfg.owners.length ? cfg.owners.map(o => `<@${o}>`).join(', ') : 'N/A', inline: true },
          { name: '📚 Servers', value: `\`${client.guilds.cache.size}\``, inline: true },
          { name: '👥 Users', value: `\`${client.users.cache.size}\``, inline: true },
          { name: '⏱️ Uptime', value: `\`${fmtUptime(client.uptime)}\``, inline: true },
          { name: '💾 Memory', value: `\`${Math.round(mem.heapUsed / 1024 / 1024)}MB\``, inline: true },
          { name: '📡 Ping', value: `\`${Math.round(client.ws.ping)}ms\``, inline: true },
          { name: '📦 Discord.js', value: `\`v14\``, inline: true },
          { name: '🟢 Node', value: `\`${process.version}\``, inline: true },
        ));
    }

    case 'serverinfo': {
      return reply(em(`🏠 ${guild.name}`, null, C.primary)
        .setThumbnail(guild.iconURL({ size: 256 }) || null)
        .addFields(
          { name: '👑 Owner', value: `<@${guild.ownerId}>`, inline: true },
          { name: '🆔 ID', value: `\`${guild.id}\``, inline: true },
          { name: '👥 Members', value: `\`${guild.memberCount}\``, inline: true },
          { name: '💬 Channels', value: `\`${guild.channels.cache.size}\``, inline: true },
          { name: '🎭 Roles', value: `\`${guild.roles.cache.size}\``, inline: true },
          { name: '😀 Emojis', value: `\`${guild.emojis.cache.size}\``, inline: true },
          { name: '🚀 Boosts', value: `Level \`${guild.premiumTier}\` • \`${guild.premiumSubscriptionCount}\``, inline: true },
          { name: '📅 Created', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:R>`, inline: true },
        ));
    }

    case 'userinfo': {
      const u = options.getUser('user') || interaction.user;
      const m = await guild.members.fetch(u.id).catch(() => null);
      const e = em(`👤 ${u.tag}`, null, C.info)
        .setThumbnail(u.displayAvatarURL({ size: 256 }))
        .addFields(
          { name: '🆔 ID', value: `\`${u.id}\``, inline: true },
          { name: '🤖 Bot', value: u.bot ? 'Yes' : 'No', inline: true },
          { name: '📅 Created', value: `<t:${Math.floor(u.createdTimestamp / 1000)}:R>`, inline: true },
        );
      if (m) {
        const roles = m.roles.cache.filter(r => r.id !== guild.id).map(r => r.toString()).slice(0, 10).join(', ') || 'None';
        e.addFields(
          { name: '📥 Joined', value: `<t:${Math.floor(m.joinedTimestamp / 1000)}:R>`, inline: true },
          { name: '🎨 Nickname', value: m.nickname || 'None', inline: true },
          { name: '🔝 Highest Role', value: `${m.roles.highest}`, inline: true },
          { name: '🎭 Roles', value: roles.slice(0, 1024) },
        );
      }
      return reply(e);
    }

    case 'avatar': {
      const u = options.getUser('user') || interaction.user;
      return reply(em(`🖼️ ${u.tag}'s Avatar`, null, C.info)
        .setImage(u.displayAvatarURL({ size: 1024, dynamic: true })));
    }

    case 'banner': {
      const u = options.getUser('user') || interaction.user;
      const fetched = await client.users.fetch(u.id, { force: true });
      if (!fetched.banner) return reply(em('❌ No Banner', `**${u.tag}** has no banner.`, C.error));
      return reply(em(`🖼️ ${u.tag}'s Banner`, null, C.info)
        .setImage(fetched.bannerURL({ size: 1024, dynamic: true })));
    }

    case 'roleinfo': {
      const r = options.getRole('role');
      return reply(em(`🎭 ${r.name}`, null, r.hexColor === '#000000' ? C.info : r.hexColor)
        .addFields(
          { name: '🆔 ID', value: `\`${r.id}\``, inline: true },
          { name: '🎨 Color', value: `\`${r.hexColor}\``, inline: true },
          { name: '📍 Position', value: `\`${r.position}\``, inline: true },
          { name: '👥 Members', value: `\`${r.members.size}\``, inline: true },
          { name: '🔔 Mentionable', value: r.mentionable ? 'Yes' : 'No', inline: true },
          { name: '📌 Hoisted', value: r.hoist ? 'Yes' : 'No', inline: true },
          { name: '📅 Created', value: `<t:${Math.floor(r.createdTimestamp / 1000)}:R>` },
        ));
    }

    case 'channelinfo': {
      const ch = options.getChannel('channel') || interaction.channel;
      return reply(em(`📺 ${ch.name}`, null, C.info)
        .addFields(
          { name: '🆔 ID', value: `\`${ch.id}\``, inline: true },
          { name: '📁 Type', value: `\`${ChannelType[ch.type]}\``, inline: true },
          { name: '📅 Created', value: `<t:${Math.floor(ch.createdTimestamp / 1000)}:R>`, inline: true },
          { name: '📌 NSFW', value: ch.nsfw ? 'Yes' : 'No', inline: true },
          { name: '🐌 Slowmode', value: `\`${ch.rateLimitPerUser || 0}s\``, inline: true },
        ));
    }

    case 'invite': {
      const link = `https://discord.com/api/oauth2/authorize?client_id=${client.user.id}&permissions=8&scope=bot%20applications.commands`;
      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setLabel('Invite Bot').setStyle(ButtonStyle.Link).setURL(link)
          .setEmoji('🔗'));
      return interaction.reply({ embeds: [em('🔗 Invite Link', `[Click here](${link})`, C.primary)], components: [row] });
    }

    case 'uptime': {
      return reply(em('⏱️ Uptime', `Bot has been online for **${fmtUptime(client.uptime)}**`, C.success));
    }

    case 'stats': {
      const humans = guild.members.cache.filter(m => !m.user.bot).size;
      const bots = guild.memberCount - humans;
      const online = guild.members.cache.filter(m => m.presence?.status !== 'offline' && m.presence).size;
      return reply(em(`📊 ${guild.name} Stats`, null, C.primary)
        .setThumbnail(guild.iconURL({ size: 256 }) || null)
        .addFields(
          { name: '👥 Total', value: `\`${guild.memberCount}\``, inline: true },
          { name: '🧑 Humans', value: `\`${humans}\``, inline: true },
          { name: '🤖 Bots', value: `\`${bots}\``, inline: true },
          { name: '🟢 Online', value: `\`${online}\``, inline: true },
          { name: '🚀 Boosts', value: `\`${guild.premiumSubscriptionCount}\``, inline: true },
          { name: '📅 Created', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:R>`, inline: true },
        ));
    }

    // ---------- TICKETS ----------
    case 'ticket-panel': {
      if (!hasPerm(PermissionsBitField.Flags.ManageGuild)) return reply(em('❌ No Permission', 'Need **Manage Server**.', C.error), true);
      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('ticket_create_general').setLabel('General').setStyle(ButtonStyle.Primary).setEmoji('💬'),
        new ButtonBuilder().setCustomId('ticket_create_technical').setLabel('Technical').setStyle(ButtonStyle.Secondary).setEmoji('🛠️'),
        new ButtonBuilder().setCustomId('ticket_create_billing').setLabel('Billing').setStyle(ButtonStyle.Success).setEmoji('💰'),
        new ButtonBuilder().setCustomId('ticket_create_other').setLabel('Other').setStyle(ButtonStyle.Danger).setEmoji('📩'),
      );
      const e = em('🎫 Support Tickets', 'Choose a category below to open a ticket.\nOur staff will assist you shortly.', C.primary)
        .setThumbnail(client.user.displayAvatarURL());
      await interaction.channel.send({ embeds: [e], components: [row] });
      return reply(em('✅ Panel Sent', 'Ticket panel posted.', C.success), true);
    }

    case 'ticket-stats': {
      const open = db.prepare("SELECT COUNT(*) AS c FROM tickets WHERE guild_id=? AND status='open'").get(guild.id).c;
      const closed = db.prepare("SELECT COUNT(*) AS c FROM tickets WHERE guild_id=? AND status='closed'").get(guild.id).c;
      const total = open + closed;
      return reply(em('🎫 Ticket Stats', null, C.info).addFields(
        { name: '🟢 Open', value: `\`${open}\``, inline: true },
        { name: '🔴 Closed', value: `\`${closed}\``, inline: true },
        { name: '📊 Total', value: `\`${total}\``, inline: true },
      ));
    }

    // ---------- GIVEAWAYS ----------
    case 'giveaway': {
      const sub = options.getSubcommand();
      if (!hasPerm(PermissionsBitField.Flags.ManageGuild)) return reply(em('❌ No Permission', 'Need **Manage Server**.', C.error), true);

      if (sub === 'create') {
        const prize = options.getString('prize');
        const mins = options.getInteger('minutes');
        const winners = options.getInteger('winners') || cfg.giveaway.defaultWinners;
        const endsAt = Date.now() + mins * 60 * 1000;
        const e = em('🎉 GIVEAWAY 🎉', null, C.primary)
          .setDescription(`**Prize:** ${prize}\n**Winners:** \`${winners}\`\n**Ends:** <t:${Math.floor(endsAt / 1000)}:R>\n\nClick 🎉 to enter!`)
          .setFooter({ text: `Hosted by ${interaction.user.tag} • Ends` })
          .setTimestamp(endsAt);
        const row = new ActionRowBuilder().addComponents(
          new ButtonBuilder().setCustomId('giveaway_join').setLabel('Join').setStyle(ButtonStyle.Success).setEmoji('🎉'),
          new ButtonBuilder().setCustomId('giveaway_leave').setLabel('Leave').setStyle(ButtonStyle.Secondary).setEmoji('❌'),
        );
        await interaction.reply({ content: '🎉 Giveaway started!', ephemeral: true });
        const msg = await interaction.channel.send({ embeds: [e], components: [row] });
        S.createGiveaway.run(guild.id, interaction.channel.id, msg.id, interaction.user.id, prize, winners, endsAt, JSON.stringify({ minAge: cfg.giveaway.minAge, role: cfg.giveaway.requireRole }));
        setTimeout(() => endGiveaway(msg.id), mins * 60 * 1000);
        return;
      }

      if (sub === 'end') {
        const id = options.getString('message_id');
        const g = S.getGiveaway.get(id);
        if (!g) return reply(em('❌ Not Found', 'Giveaway not found.', C.error), true);
        await endGiveaway(id);
        return reply(em('✅ Ended', 'Giveaway ended.', C.success), true);
      }

      if (sub === 'reroll') {
        const id = options.getString('message_id');
        const g = S.getGiveaway.get(id);
        if (!g) return reply(em('❌ Not Found', 'Giveaway not found.', C.error), true);
        const entries = JSON.parse(g.entries || '[]');
        if (!entries.length) return reply(em('❌ No Entries', 'No participants.', C.error), true);
        const winner = entries[Math.floor(Math.random() * entries.length)];
        const hist = JSON.parse(g.reroll_history || '[]');
        hist.push({ user: winner, at: Date.now() });
        S.updateReroll.run(JSON.stringify(hist), id);
        const ch = await guild.channels.fetch(g.channel_id).catch(() => null);
        if (ch) ch.send({ content: `🎉 Reroll! New winner: <@${winner}> for **${g.prize}**!` });
        return reply(em('✅ Rerolled', `<@${winner}> is new winner!`, C.success), true);
      }

      if (sub === 'list') {
        const gs = S.getActiveGiveaways.all().filter(g => g.guild_id === guild.id);
        if (!gs.length) return reply(em('📋 No Giveaways', 'No active giveaways.', C.info));
        const list = gs.map(g => `**${g.prize}** • <#${g.channel_id}> • Ends <t:${Math.floor(g.ends_at / 1000)}:R>`).join('\n');
        return reply(em('📋 Active Giveaways', list, C.info));
      }
    }

    // ---------- SETUP ----------
    case 'setup-verify': {
      if (!hasPerm(PermissionsBitField.Flags.ManageGuild)) return reply(em('❌ No Permission', 'Need **Manage Server**.', C.error), true);
      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('verify_start').setLabel('Verify Me').setStyle(ButtonStyle.Success).setEmoji('✅'),
      );
      const e = em('✅ Verification', cfg.verify.message, C.success)
        .setThumbnail(client.user.displayAvatarURL());
      await interaction.channel.send({ embeds: [e], components: [row] });
      return reply(em('✅ Sent', 'Verification panel posted.', C.success), true);
    }
  }
}

function fmtUptime(ms) {
  const s = Math.floor(ms / 1000);
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${d}d ${h}h ${m}m ${sec}s`;
}

// ================== BUTTON HANDLER ==================
async function handleButton(interaction) {
  const { customId, guild, member } = interaction;

  // ----- VERIFICATION -----
  if (customId === 'verify_start') {
    const code = String(randInt(1000, 9999));
    S.setVerifyCode.run(guild.id, member.id, code, Date.now());
    const modal = new ModalBuilder().setCustomId('verify_modal').setTitle('Verification');
    const input = new TextInputBuilder().setCustomId('verify_input').setLabel(`Type this code: ${code}`)
      .setStyle(TextInputStyle.Short).setRequired(true).setMaxLength(4);
    modal.addComponents(new ActionRowBuilder().addComponents(input));
    return interaction.showModal(modal);
  }

  // ----- TICKETS -----
  if (customId.startsWith('ticket_create_')) {
    const type = customId.replace('ticket_create_', '');
    const catName = cfg.tickets.categories[type] || 'Support';
    if (cfg.tickets.preventDuplicate) {
      const open = S.getOpenTickets.all(guild.id, member.id);
      if (open.length >= cfg.tickets.maxOpen)
        return interaction.reply({ embeds: [em('❌ Ticket Exists', `You already have an open ticket: <#${open[0].channel_id}>`, C.error)], ephemeral: true });
    }
    await interaction.deferReply({ ephemeral: true });
    const parent = guild.channels.cache.find(c => c.name === catName && c.type === ChannelType.GuildCategory);
    const overwrites = [
      { id: guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
      { id: member.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory] },
      { id: client.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ManageChannels] },
    ];
    for (const r of guild.roles.cache.values()) {
      if (cfg.tickets.staffRoles.includes(r.name.toLowerCase())) {
        overwrites.push({ id: r.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory] });
      }
    }
    const ch = await guild.channels.create({
      name: `ticket-${member.user.username}`.toLowerCase().slice(0, 90),
      type: ChannelType.GuildText, parent: parent?.id, permissionOverwrites: overwrites,
    });
    S.createTicket.run(guild.id, ch.id, member.id, type, Date.now());
    const e = em(`🎫 ${catName}`, `Hello ${member}, our staff will be with you shortly.\n\n**Type:** \`${type}\`\n**Created:** <t:${Math.floor(Date.now() / 1000)}:R>`, C.primary);
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('ticket_claim').setLabel('Claim').setStyle(ButtonStyle.Primary).setEmoji('✋'),
      new ButtonBuilder().setCustomId('ticket_close').setLabel('Close').setStyle(ButtonStyle.Danger).setEmoji('🔒'),
    );
    await ch.send({ content: `${member} ${cfg.tickets.staffRoles.map(r => guild.roles.cache.find(x => x.name.toLowerCase() === r)).filter(Boolean).map(r => r.toString()).join(' ')}`, embeds: [e], components: [row] });
    await interaction.editReply({ embeds: [em('✅ Ticket Created', `Your ticket: ${ch}`, C.success)] });
    return sendLog(guild, em('🎫 Ticket Opened', `**User:** ${member.user.tag}\n**Type:** ${type}\n**Channel:** ${ch}`, C.info));
  }

  if (customId === 'ticket_claim') {
    const t = S.getTicketByChannel.get(interaction.channel.id);
    if (!t) return interaction.reply({ content: '❌ Invalid ticket.', ephemeral: true });
    if (!isStaff(member)) return interaction.reply({ content: '❌ Staff only.', ephemeral: true });
    S.claimTicket.run(member.id, interaction.channel.id);
    return interaction.reply({ embeds: [em('✋ Claimed', `This ticket is now handled by ${member}.`, C.success)] });
  }

  if (customId === 'ticket_close') {
    const t = S.getTicketByChannel.get(interaction.channel.id);
    if (!t) return interaction.reply({ content: '❌ Invalid ticket.', ephemeral: true });
    if (!isStaff(member) && t.user_id !== member.id)
      return interaction.reply({ content: '❌ Not allowed.', ephemeral: true });
    const modal = new ModalBuilder().setCustomId('ticket_close_modal').setTitle('Close Ticket');
    const reason = new TextInputBuilder().setCustomId('close_reason').setLabel('Reason')
      .setStyle(TextInputStyle.Paragraph).setRequired(false).setMaxLength(500);
    modal.addComponents(new ActionRowBuilder().addComponents(reason));
    return interaction.showModal(modal);
  }

  if (customId === 'ticket_reopen') {
    const t = S.getTicketByChannel.get(interaction.channel.id);
    if (!t) return interaction.reply({ content: '❌ Not a ticket.', ephemeral: true });
    S.reopenTicket.run(interaction.channel.id);
    await interaction.channel.permissionOverwrites.edit(guild.roles.everyone, { ViewChannel: false });
    return interaction.reply({ embeds: [em('🔓 Reopened', 'Ticket reopened.', C.success)] });
  }

  // ----- GIVEAWAY -----
  if (customId === 'giveaway_join' || customId === 'giveaway_leave') {
    const g = S.getGiveaway.get(interaction.message.id);
    if (!g || g.ended) return interaction.reply({ content: '❌ Giveaway ended.', ephemeral: true });
    const req = JSON.parse(g.requirements || '{}');
    const entries = JSON.parse(g.entries || '[]');
    if (customId === 'giveaway_join') {
      if (req.minAge && (Date.now() - member.user.createdTimestamp) < req.minAge * 86400000)
        return interaction.reply({ content: `❌ Account must be at least ${req.minAge} days old.`, ephemeral: true });
      if (req.role) {
        const role = guild.roles.cache.find(r => r.name.toLowerCase() === req.role.toLowerCase());
        if (role && !member.roles.cache.has(role.id))
          return interaction.reply({ content: `❌ You need the **${role.name}** role.`, ephemeral: true });
      }
      if (entries.includes(member.id)) return interaction.reply({ content: '✅ Already entered!', ephemeral: true });
      entries.push(member.id);
      S.updateGiveawayEntries.run(JSON.stringify(entries), interaction.message.id);
      return interaction.reply({ content: '🎉 You joined the giveaway!', ephemeral: true });
    }
    if (customId === 'giveaway_leave') {
      const i = entries.indexOf(member.id);
      if (i < 0) return interaction.reply({ content: '❌ You are not in this giveaway.', ephemeral: true });
      entries.splice(i, 1);
      S.updateGiveawayEntries.run(JSON.stringify(entries), interaction.message.id);
      return interaction.reply({ content: '✅ You left the giveaway.', ephemeral: true });
    }
  }
}

// ================== MODAL HANDLER ==================
async function handleModal(interaction) {
  const { customId, guild, member } = interaction;

  if (customId === 'verify_modal') {
    const code = interaction.fields.getTextInputValue('verify_input');
    const stored = S.getVerifyCode.get(guild.id, member.id);
    if (!stored) return interaction.reply({ embeds: [em('❌ Expired', 'Verification code expired.', C.error)], ephemeral: true });
    if (Date.now() - stored.timestamp > 5 * 60 * 1000)
      return interaction.reply({ embeds: [em('❌ Expired', 'Code expired. Try again.', C.error)], ephemeral: true });
    if (stored.code !== code.trim())
      return interaction.reply({ embeds: [em('❌ Wrong Code', 'Try again.', C.error)], ephemeral: true });
    S.delVerifyCode.run(guild.id, member.id);

    const verified = guild.roles.cache.find(r => r.name.toLowerCase() === cfg.verify.role.toLowerCase());
    const unverified = guild.roles.cache.find(r => r.name.toLowerCase() === cfg.verify.unverifiedRole.toLowerCase());
    if (unverified) await member.roles.remove(unverified).catch(() => {});
    if (verified) await member.roles.add(verified).catch(() => {});

    await interaction.reply({ embeds: [em('✅ Verified!', `You now have access to the server, ${member}!`, C.success)], ephemeral: true });
    return sendLog(guild, em('✅ Verified', `**User:** ${member.user.tag}\n**ID:** ${member.id}`, C.success));
  }

  if (customId === 'ticket_close_modal') {
    const reason = interaction.fields.getTextInputValue('close_reason') || 'No reason';
    const t = S.getTicketByChannel.get(interaction.channel.id);
    if (!t) return interaction.reply({ content: '❌ Invalid.', ephemeral: true });
    await interaction.reply({ embeds: [em('🔒 Closing', 'Ticket will be closed in 5 seconds...', C.warning)] });

    // Transcript (simple)
    if (cfg.tickets.transcript) {
      const msgs = await interaction.channel.messages.fetch({ limit: 100 });
      const arr = [...msgs.values()].reverse();
      const text = arr.map(m => `[${new Date(m.createdTimestamp).toISOString()}] ${m.author.tag}: ${m.content}`).join('\n');
      const buf = Buffer.from(text, 'utf-8');
      const logCh = await findChannel(guild, cfg.tickets.logChannel);
      if (logCh) logCh.send({ embeds: [em('📄 Ticket Transcript',
        `**Ticket:** #${t.id}\n**User:** <@${t.user_id}>\n**Closed by:** ${member}\n**Reason:** ${reason}`, C.info)],
        files: [{ attachment: buf, name: `transcript-${t.id}.txt` }] }).catch(() => {});
    }

    S.closeTicket.run(Date.now(), reason, interaction.channel.id);
    await sendLog(guild, em('🔒 Ticket Closed', `**Ticket:** #${t.id}\n**User:** <@${t.user_id}>\n**Closed by:** ${member.user.tag}\n**Reason:** ${reason}`, C.warning));
    setTimeout(() => interaction.channel.delete().catch(() => {}), 5000);
  }
}

// ================== MESSAGE EVENTS (Anti-abuse + XP) ==================
const spamCache = new Map();
const nukeCache = new Map();
const raidCache = new Map();

client.on('messageCreate', async (message) => {
  if (!message.guild || message.author.bot) return;
  const m = message.member;
  if (!m) return;

  const isAdmin = m.permissions.has(PermissionsBitField.Flags.Administrator);
  const isMod = m.permissions.has(PermissionsBitField.Flags.ManageMessages);

  // ---- XP ----
  if (cfg.xp.enabled && !isAdmin) handleXP(message).catch(() => {});

  if (isAdmin || isMod) return;

  // ---- Anti-Link / Invite ----
  if (cfg.antiLink.enabled && !hasRole(m, cfg.antiLink.allowedRoles)) {
    const hasInvite = cfg.antiLink.antiInvite && containsInvite(message.content);
    const urls = extractUrls(message.content);
    const hasBadLink = urls.some(u => {
      const host = (() => { try { return new URL(u.startsWith('http') ? u : 'https://' + u).hostname.toLowerCase(); } catch { return ''; } })();
      return !cfg.antiLink.allowlist.some(a => host.endsWith(a));
    });
    if (hasInvite || hasBadLink) {
      try { await message.delete(); } catch {}
      const w = await message.channel.send({ embeds: [em('🚫 Link Blocked', `${message.author}, ${cfg.antiLink.warnMsg}`, C.error)] });
      setTimeout(() => w.delete().catch(() => {}), 4000);
      return sendLog(message.guild, em('🚫 Link Removed',
        `**User:** ${message.author.tag}\n**Channel:** ${message.channel}\n**Content:** \`\`\`${message.content.slice(0, 200)}\`\`\``, C.warning));
    }
  }

  // ---- Bad Words ----
  if (cfg.badWords.enabled && cfg.badWords.list.length) {
    const lower = message.content.toLowerCase();
    if (cfg.badWords.list.some(w => lower.includes(w))) {
      try { await message.delete(); } catch {}
      const w = await message.channel.send({ embeds: [em('🚫 Language', `${message.author}, watch your language!`, C.error)] });
      setTimeout(() => w.delete().catch(() => {}), 4000);
      return sendLog(message.guild, em('🚫 Bad Word',
        `**User:** ${message.author.tag}\n**Content:** \`\`\`${message.content.slice(0, 200)}\`\`\``, C.warning));
    }
  }

  // ---- Anti-Caps ----
  if (cfg.antiCaps.enabled && message.content.length >= cfg.antiCaps.minLength) {
    if (capsRatio(message.content) >= cfg.antiCaps.threshold) {
      try { await message.delete(); } catch {}
      const w = await message.channel.send({ embeds: [em('🔠 Anti-Caps', `${message.author}, please reduce caps!`, C.warning)] });
      setTimeout(() => w.delete().catch(() => {}), 3000);
      return;
    }
  }

  // ---- Anti-Spam ----
  if (!cfg.antiSpam.enabled) return;
  const now = Date.now();
  const key = `${message.guild.id}:${message.author.id}`;
  const arr = (spamCache.get(key) || []).filter(t => now - t < cfg.antiSpam.window);
  arr.push(now);
  spamCache.set(key, arr);

  if (arr.length >= cfg.antiSpam.limit) {
    const punishMs = cfg.antiSpam.timeout * (cfg.antiSpam.escalate ? Math.ceil(arr.length / cfg.antiSpam.limit) : 1);
    try { await m.timeout(punishMs, 'Spam detected'); } catch {}
    try { await message.channel.bulkDelete(arr.length, true); } catch {}
    spamCache.delete(key);
    const w = await message.channel.send({ embeds: [em('⚠️ Anti-Spam',
      `**${message.author.tag}** timed out for spam.\nDuration: \`${Math.round(punishMs / 60000)} min\``, C.error)] });
    setTimeout(() => w.delete().catch(() => {}), 5000);
    return sendLog(message.guild, em('⚠️ Spam Triggered',
      `**User:** ${message.author.tag}\n**Count:** ${arr.length}`, C.error), true);
  }
});

// ================== XP ==================
async function handleXP(message) {
  const gid = message.guild.id, uid = message.author.id;
  const data = S.getXP.get(gid, uid) || { xp: 0, level: 0, last_message: 0, voice_minutes: 0 };
  const now = Date.now();
  if (now - data.last_message < cfg.xp.cooldown) return;
  if (cfg.xp.antiFarm && message.content.length < 3) return;

  const gained = randInt(cfg.xp.min, cfg.xp.max);
  const newXP = data.xp + gained;
  let newLevel = data.level;
  while (newXP >= totalXPFor(newLevel + 1)) newLevel++;

  S.upsertXP.run(gid, uid, newXP, newLevel, now, data.voice_minutes || 0);

  if (newLevel > data.level) {
    const rw = cfg.xp.roleRewards.find(r => r.level === newLevel);
    if (rw) {
      const role = message.guild.roles.cache.find(x => x.name.toLowerCase() === rw.role.toLowerCase());
      if (role) message.member.roles.add(role).catch(() => {});
    }
    const ch = cfg.xp.levelUpChannel
      ? await findChannel(message.guild, cfg.xp.levelUpChannel)
      : message.channel;
    if (ch) ch.send({ content: cfg.xp.levelUpMessage.replace('{user}', `${message.author}`).replace('{level}', newLevel) }).catch(() => {});
  }
}

// ================== ANTI-NUKE ==================
function trackNuke(gid, type, limit) {
  const now = Date.now();
  const d = nukeCache.get(gid) || { channels: [], roles: [], bans: [], kicks: [] };
  const f = (d[type] || []).filter(t => now - t < cfg.antiNuke.window);
  f.push(now);
  d[type] = f;
  nukeCache.set(gid, d);
  return f.length >= limit;
}

async function punishNuker(guild, entry, type) {
  try {
    const executor = entry?.executor;
    if (!executor || executor.id === guild.ownerId || executor.id === client.user.id) return;
    const m = await guild.members.fetch(executor.id).catch(() => null);
    if (!m) return;
    // Remove dangerous roles
    const dangerous = m.roles.cache.filter(r => r.permissions.has(PermissionsBitField.Flags.Administrator) && r.editable);
    for (const r of dangerous.values()) await m.roles.remove(r).catch(() => {});
    await m.ban({ reason: `Anti-Nuke: ${type}` }).catch(() => {});
    await sendLog(guild, em('🚨 ANTI-NUKE TRIGGERED',
      `**Executor:** ${executor.tag} (\`${executor.id}\`)\n**Action:** ${type}\n**Status:** Banned & Roles Removed`, C.error), true);
  } catch (e) { console.error(e); }
}

client.on('channelDelete', async ch => {
  if (!cfg.antiNuke.enabled || !ch.guild) return;
  if (trackNuke(ch.guild.id, 'channels', cfg.antiNuke.channelLimit)) {
    const logs = await ch.guild.fetchAuditLogs({ type: 12, limit: 1 }).catch(() => null);
    await punishNuker(ch.guild, logs?.entries.first(), 'Channel Delete');
  }
});

client.on('roleDelete', async role => {
  if (!cfg.antiNuke.enabled) return;
  if (trackNuke(role.guild.id, 'roles', cfg.antiNuke.roleLimit)) {
    const logs = await role.guild.fetchAuditLogs({ type: 32, limit: 1 }).catch(() => null);
    await punishNuker(role.guild, logs?.entries.first(), 'Role Delete');
  }
});

client.on('guildBanAdd', async ban => {
  if (!cfg.antiNuke.enabled) return;
  if (trackNuke(ban.guild.id, 'bans', cfg.antiNuke.banLimit)) {
    const logs = await ban.guild.fetchAuditLogs({ type: 22, limit: 1 }).catch(() => null);
    await punishNuker(ban.guild, logs?.entries.first(), 'Mass Ban');
  }
});

client.on('guildMemberRemove', async m => {
  if (!cfg.antiNuke.enabled) return;
  const logs = await m.guild.fetchAuditLogs({ type: 20, limit: 1 }).catch(() => null);
  const e = logs?.entries.first();
  if (!e || e.target?.id !== m.id || Date.now() - e.createdTimestamp > 5000) return;
  if (trackNuke(m.guild.id, 'kicks', cfg.antiNuke.kickLimit)) {
    await punishNuker(m.guild, e, 'Mass Kick');
  }
});

// ================== RAID DETECTION ==================
client.on('guildMemberAdd', async (m) => {
  // Auto-role
  if (cfg.verify.autoRoleEnabled) {
    for (const id of cfg.verify.autoRoles) await m.roles.add(id).catch(() => {});
  }
  if (cfg.verify.enabled) {
    const unv = m.guild.roles.cache.find(r => r.name.toLowerCase() === cfg.verify.unverifiedRole.toLowerCase());
    if (unv) await m.roles.add(unv).catch(() => {});
  }

  // Raid detection
  if (cfg.raid.enabled) {
    const key = m.guild.id;
    const now = Date.now();
    const arr = (raidCache.get(key) || []).filter(t => now - t < cfg.raid.window);
    arr.push(now);
    raidCache.set(key, arr);
    if (arr.length >= cfg.raid.threshold) {
      raidCache.delete(key);
      // Lockdown: deny @everyone SendMessages in all text channels
      const everyone = m.guild.roles.everyone;
      const changed = [];
      for (const ch of m.guild.channels.cache.values()) {
        if (ch.type === ChannelType.GuildText && ch.permissionsFor(everyone)?.has(PermissionsBitField.Flags.SendMessages)) {
          try {
            await ch.permissionOverwrites.edit(everyone, { SendMessages: false });
            changed.push(ch);
          } catch {}
        }
      }
      await sendLog(m.guild, em('🚨 RAID DETECTED - LOCKDOWN', `Triggered: ${arr.length} joins in ${cfg.raid.window / 1000}s`, C.error), true);
      setTimeout(async () => {
        for (const ch of changed) await ch.permissionOverwrites.edit(everyone, { SendMessages: null }).catch(() => {});
        await sendLog(m.guild, em('🔓 Lockdown Lifted', `Auto unlocked after ${cfg.raid.duration / 1000}s`, C.success), true);
      }, cfg.raid.duration);
    }
  }

  // Welcome
  if (cfg.welcome.enabled) {
    const ch = await findChannel(m.guild, cfg.welcome.channel);
    if (ch) {
      const msg = cfg.welcome.message.replace('{user}', `${m}`).replace('{server}', m.guild.name).replace('{count}', m.guild.memberCount);
      const e = em(`👋 Welcome!`, msg, C.success)
        .setThumbnail(m.user.displayAvatarURL({ size: 256 }))
        .addFields(
          { name: '📅 Account Created', value: `<t:${Math.floor(m.user.createdTimestamp / 1000)}:R>`, inline: true },
          { name: '👥 Member Count', value: `\`${m.guild.memberCount}\``, inline: true },
        );
      if (cfg.welcome.image) e.setImage(cfg.welcome.image);
      ch.send({ content: `${m}`, embeds: [e] }).catch(() => {});
    }
  }

  // Log
  if (cfg.logs.memberJoin) {
    sendLog(m.guild, em('📥 Member Joined', `**User:** ${m.user.tag} (\`${m.id}\`)\n**Created:** <t:${Math.floor(m.user.createdTimestamp / 1000)}:R>\n**Count:** \`${m.guild.memberCount}\``, C.success));
  }
});

// ================== GOODBYE ==================
client.on('guildMemberRemove', async (m) => {
  if (cfg.goodbye.enabled) {
    const ch = await findChannel(m.guild, cfg.goodbye.channel);
    if (ch) {
      const msg = cfg.goodbye.message.replace('{user}', m.user.tag).replace('{server}', m.guild.name).replace('{count}', m.guild.memberCount);
      const e = em('👋 Goodbye', msg, C.error)
        .setThumbnail(m.user.displayAvatarURL({ size: 256 }));
      if (cfg.goodbye.image) e.setImage(cfg.goodbye.image);
      ch.send({ embeds: [e] }).catch(() => {});
    }
  }
  if (cfg.logs.memberLeave) {
    sendLog(m.guild, em('📤 Member Left', `**User:** ${m.user.tag} (\`${m.id}\`)\n**Joined:** ${m.joinedTimestamp ? `<t:${Math.floor(m.joinedTimestamp / 1000)}:R>` : 'Unknown'}`, C.warning));
  }
});

// ================== LOGGING EVENTS ==================
client.on('messageDelete', async (msg) => {
  if (!cfg.logs.msgDelete || !msg.guild || msg.author?.bot) return;
  if (!msg.content && !msg.attachments.size) return;
  const e = em('🗑️ Message Deleted', null, C.error)
    .addFields(
      { name: 'Author', value: `${msg.author.tag}`, inline: true },
      { name: 'Channel', value: `${msg.channel}`, inline: true },
      { name: 'Content', value: (msg.content || '*[no text]*').slice(0, 1024) },
    );
  if (msg.attachments.size) e.addFields({ name: 'Attachments', value: msg.attachments.map(a => a.name).join(', ').slice(0, 1024) });
  sendLog(msg.guild, e);
});

client.on('messageUpdate', async (oldM, newM) => {
  if (!cfg.logs.msgEdit || !oldM.guild || oldM.author?.bot) return;
  if (oldM.content === newM.content) return;
  sendLog(oldM.guild, em('✏️ Message Edited', null, C.warning)
    .setURL(newM.url)
    .addFields(
      { name: 'Author', value: `${oldM.author.tag}`, inline: true },
      { name: 'Channel', value: `${oldM.channel}`, inline: true },
      { name: 'Before', value: (oldM.content || '*empty*').slice(0, 1024) },
      { name: 'After', value: (newM.content || '*empty*').slice(0, 1024) },
    ));
});

client.on('voiceStateUpdate', (oldS, newS) => {
  if (!cfg.logs.voice) return;
  const m = newS.member;
  if (!m || m.user.bot) return;
  if (!oldS.channel && newS.channel) {
    sendLog(newS.guild, em('🔊 Voice Joined', `${m.user.tag} joined ${newS.channel}`, C.success));
  } else if (oldS.channel && !newS.channel) {
    sendLog(oldS.guild, em('🔇 Voice Left', `${m.user.tag} left ${oldS.channel}`, C.warning));
  } else if (oldS.channel?.id !== newS.channel?.id) {
    sendLog(newS.guild, em('🔀 Voice Moved', `${m.user.tag}: ${oldS.channel} → ${newS.channel}`, C.info));
  }
});

client.on('guildMemberUpdate', async (oldM, newM) => {
  if (!cfg.logs.roleChanges) return;
  const added = newM.roles.cache.filter(r => !oldM.roles.cache.has(r.id));
  const removed = oldM.roles.cache.filter(r => !newM.roles.cache.has(r.id));
  if (added.size) sendLog(newM.guild, em('➕ Role Added', `${newM.user.tag} → ${added.map(r => r).join(', ')}`, C.success));
  if (removed.size) sendLog(newM.guild, em('➖ Role Removed', `${newM.user.tag} → ${removed.map(r => r).join(', ')}`, C.warning));
});

// ================== SERVER STATS ==================
function startStatsLoop() {
  const update = async () => {
    for (const guild of client.guilds.cache.values()) {
      try {
        const humans = guild.members.cache.filter(m => !m.user.bot).size;
        const bots = guild.memberCount - humans;
        const setCh = async (template, count) => {
          if (!template) return;
          const name = template.replace('{count}', count);
          const ch = guild.channels.cache.find(c => c.name.match(/^(📊|👥|🤖)/) && c.type === ChannelType.GuildVoice);
          // Instead of matching, try find by prefix
        };
        const updateCh = async (template, count) => {
          if (!template) return;
          const baseName = template.replace('{count}', '').trim();
          const ch = guild.channels.cache.find(c =>
            c.type === ChannelType.GuildVoice && c.name.includes(baseName.slice(0, 3)));
          if (!ch) return;
          const newName = template.replace('{count}', count);
          if (ch.name !== newName) await ch.setName(newName).catch(() => {});
        };
        await updateCh(cfg.stats.members, guild.memberCount);
        await updateCh(cfg.stats.humans, humans);
        await updateCh(cfg.stats.bots, bots);
      } catch (e) { /* ignore */ }
    }
  };
  update();
  setInterval(update, cfg.stats.interval);
}

// ================== GIVEAWAY PERSISTENCE ==================
async function restoreGiveaways() {
  const active = S.getActiveGiveaways.all();
  for (const g of active) {
    if (g.ends_at <= Date.now()) { await endGiveaway(g.message_id); continue; }
    setTimeout(() => endGiveaway(g.message_id), g.ends_at - Date.now());
  }
}

async function endGiveaway(messageId) {
  const g = S.getGiveaway.get(messageId);
  if (!g || g.ended) return;
  const guild = client.guilds.cache.get(g.guild_id);
  if (!guild) return;
  const ch = await guild.channels.fetch(g.channel_id).catch(() => null);
  if (!ch) { S.endGiveaway.run(messageId); return; }
  const msg = await ch.messages.fetch(messageId).catch(() => null);
  const entries = JSON.parse(g.entries || '[]');
  S.endGiveaway.run(messageId);

  let winners = [];
  if (entries.length) {
    const pool = [...entries];
    for (let i = 0; i < Math.min(g.winners, pool.length); i++) {
      const idx = Math.floor(Math.random() * pool.length);
      winners.push(pool.splice(idx, 1)[0]);
    }
  }

  const e = em('🎉 GIVEAWAY ENDED 🎉', null, C.primary)
    .setDescription(`**Prize:** ${g.prize}\n**Winners:** ${winners.length ? winners.map(w => `<@${w}>`).join(', ') : 'No valid entries'}\n**Host:** <@${g.host_id}>`);

  if (msg) {
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('giveaway_join').setLabel('Ended').setStyle(ButtonStyle.Secondary).setDisabled(true).setEmoji('🎉'),
    );
    await msg.edit({ embeds: [e], components: [row] }).catch(() => {});
  }
  ch.send({ content: winners.length ? `🎉 Congrats ${winners.map(w => `<@${w}>`).join(', ')}! You won **${g.prize}**!` : '😢 No valid entries.' }).catch(() => {});
  const logCh = await findChannel(guild, cfg.giveaway.logChannel);
  if (logCh) logCh.send({ embeds: [em('🎁 Giveaway Ended', `**Prize:** ${g.prize}\n**Winners:** ${winners.map(w => `<@${w}>`).join(', ') || 'None'}`, C.info)] }).catch(() => {});
}

// ================== ERROR HANDLING ==================
process.on('unhandledRejection', e => console.error('Unhandled:', e));
process.on('uncaughtException', e => console.error('Uncaught:', e));

process.on('SIGINT', () => {
  console.log('\n👋 Shutting down gracefully...');
  db.close();
  client.destroy();
  process.exit(0);
});

// ================== LOGIN ==================
if (!cfg.token) { console.error('❌ BOT_TOKEN missing in .env'); process.exit(1); }
client.login(cfg.token).catch(e => { console.error('Login failed:', e.message); process.exit(1); });
