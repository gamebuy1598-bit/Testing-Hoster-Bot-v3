// ═══════════════════════════════════════════════════════════
//  🤖 HOSTER BOT V3 — Ultimate Discord Bot
//  AI Chat + Activity Tracking + Anti-Nuke + Full Mod
// ═══════════════════════════════════════════════════════════

require('dotenv').config();
const {
    Client, GatewayIntentBits, Partials, EmbedBuilder, ActionRowBuilder,
    ButtonBuilder, ButtonStyle, PermissionsBitField, ChannelType,
    ActivityType, Collection, SlashCommandBuilder, REST, Routes
} = require('discord.js');

// ═══════════════════════════════════════════════════════════
//  CONFIG
// ═══════════════════════════════════════════════════════════
const CONFIG = {
    token: process.env.DISCORD_TOKEN,
    clientId: process.env.CLIENT_ID,
    guildId: process.env.GUILD_ID,
    botName: process.env.BOT_NAME || 'Hoster Bot V3',
    status: process.env.BOT_STATUS || 'online',
    activityType: process.env.BOT_ACTIVITY_TYPE || 'WATCHING',
    activityText: process.env.BOT_ACTIVITY_TEXT || 'Over Your Server 🛡️',
    activityUrl: process.env.BOT_ACTIVITY_URL || '',
    footer: process.env.BOT_FOOTER || 'Hoster Bot V3 • Premium Protection',
    colors: {
        primary: parseInt(process.env.COLOR_PRIMARY || '5865F2', 16),
        success: parseInt(process.env.COLOR_SUCCESS || '57F287', 16),
        error: parseInt(process.env.COLOR_ERROR || 'ED4245', 16),
        warning: parseInt(process.env.COLOR_WARNING || 'FEE75C', 16),
        info: parseInt(process.env.COLOR_INFO || '00BFFF', 16),
        premium: parseInt(process.env.COLOR_PREMIUM || 'FF69B4', 16),
    },
    ai: {
        enabled: process.env.AI_ENABLED === 'true',
        apiKey: process.env.AI_API_KEY,
        apiUrl: process.env.AI_API_URL || 'https://api.openai.com/v1/chat/completions',
        model: process.env.AI_MODEL || 'gpt-4o-mini',
        maxTokens: parseInt(process.env.AI_MAX_TOKENS || '500'),
        temperature: parseFloat(process.env.AI_TEMPERATURE || '0.7'),
        systemPrompt: process.env.AI_SYSTEM_PROMPT || 'You are Hoster Bot V3, a helpful Discord assistant.',
        channelId: process.env.AI_CHANNEL_ID,
        channelIds: (process.env.AI_CHANNEL_IDS || '').split(',').map((s) => s.trim()).filter(Boolean),
        triggerPrefix: process.env.AI_TRIGGER_PREFIX || '!ai',
        replyOnMention: process.env.AI_REPLY_ON_MENTION === 'true',
        cooldown: parseInt(process.env.AI_COOLDOWN_SECONDS || '5'),
    },
    activity: {
        enabled: process.env.ACTIVITY_TRACKING_ENABLED === 'true',
        logChannel: process.env.ACTIVITY_LOG_CHANNEL_ID,
        xpPerMessage: parseInt(process.env.ACTIVITY_XP_PER_MESSAGE || '5'),
        xpPerVoiceMin: parseInt(process.env.ACTIVITY_XP_PER_VOICE_MINUTE || '2'),
        xpCooldown: parseInt(process.env.ACTIVITY_XP_COOLDOWN || '10') * 1000,
        levelupChannel: process.env.ACTIVITY_LEVELUP_CHANNEL_ID,
        levelupEnabled: process.env.ACTIVITY_LEVELUP_ENABLED === 'true',
        leaderboardSize: parseInt(process.env.ACTIVITY_LEADERBOARD_SIZE || '10'),
    },
    antispam: {
        enabled: process.env.ANTISPAM_ENABLED === 'true',
        limit: parseInt(process.env.ANTISPAM_MESSAGE_LIMIT || '5'),
        window: parseInt(process.env.ANTISPAM_TIME_WINDOW || '5000'),
        timeout: parseInt(process.env.ANTISPAM_TIMEOUT_DURATION || '600000'),
        dupLimit: parseInt(process.env.ANTISPAM_DUPLICATE_LIMIT || '3'),
        mentionLimit: parseInt(process.env.ANTISPAM_MENTION_LIMIT || '5'),
    },
    antinuke: {
        enabled: process.env.ANTINUKE_ENABLED === 'true',
        channelDelete: parseInt(process.env.ANTINUKE_CHANNEL_DELETE_LIMIT || '3'),
        roleDelete: parseInt(process.env.ANTINUKE_ROLE_DELETE_LIMIT || '3'),
        banLimit: parseInt(process.env.ANTINUKE_BAN_LIMIT || '3'),
        kickLimit: parseInt(process.env.ANTINUKE_KICK_LIMIT || '3'),
        webhookLimit: parseInt(process.env.ANTINUKE_WEBHOOK_LIMIT || '2'),
        channelCreate: parseInt(process.env.ANTINUKE_CHANNEL_CREATE_LIMIT || '5'),
        roleCreate: parseInt(process.env.ANTINUKE_ROLE_CREATE_LIMIT || '5'),
        window: parseInt(process.env.ANTINUKE_TIME_WINDOW || '10000'),
        punishment: process.env.ANTINUKE_PUNISHMENT || 'ban',
    },
    link: {
        enabled: process.env.LINK_PROTECTION_ENABLED === 'true',
        action: process.env.LINK_ACTION || 'delete',
        inviteEnabled: process.env.INVITE_PROTECTION_ENABLED === 'true',
        allowed: (process.env.ALLOWED_LINKS || '').split(',').filter(Boolean),
    },
    antiCaps: {
        enabled: process.env.ANTI_CAPS_ENABLED === 'true',
        percent: parseInt(process.env.ANTI_CAPS_PERCENT || '70'),
    },
    badWords: (process.env.BAD_WORDS || '').split(',').filter(Boolean).map((w) => w.trim().toLowerCase()),
    channels: {
        log: process.env.LOG_CHANNEL_ID,
        modLog: process.env.MOD_LOG_CHANNEL_ID,
        welcome: process.env.WELCOME_CHANNEL_ID,
        goodbye: process.env.GOODBYE_CHANNEL_ID,
        ticketCategory: process.env.TICKET_CATEGORY_ID,
        ticketLog: process.env.TICKET_LOG_CHANNEL_ID,
        verify: process.env.VERIFY_CHANNEL_ID,
        stats: process.env.SERVER_STATS_CHANNEL_ID,
    },
    roles: {
        verify: process.env.VERIFY_ROLE_ID,
        auto: process.env.AUTO_ROLE_ID,
    },
    features: {
        welcome: process.env.WELCOME_ENABLED === 'true',
        goodbye: process.env.GOODBYE_ENABLED === 'true',
        autoRole: process.env.AUTO_ROLE_ENABLED === 'true',
        verify: process.env.VERIFY_ENABLED === 'true',
        ticket: process.env.TICKET_ENABLED === 'true',
        giveaway: process.env.GIVEAWAY_ENABLED === 'true',
        logging: process.env.LOGGING_ENABLED === 'true',
    },
    levelRoles: (process.env.LEVEL_ROLES || '').split(',').filter(Boolean).map((pair) => {
        const [lvl, roleId] = pair.split(':');
        return { level: parseInt(lvl), roleId };
    }),
    prefix: process.env.PREFIX || '!',
    maxWarns: parseInt(process.env.MAX_WARNS || '5'),
};

// ═══════════════════════════════════════════════════════════
//  CLIENT
// ═══════════════════════════════════════════════════════════
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildModeration,
        GatewayIntentBits.GuildWebhooks,
        GatewayIntentBits.GuildInvites,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.DirectMessages,
    ],
    partials: [Partials.Message, Partials.Channel, Partials.GuildMember, Partials.User],
});

// ═══════════════════════════════════════════════════════════
//  CACHES & STORAGE
// ═══════════════════════════════════════════════════════════
const spamCache = new Collection();
const nukeCache = new Collection();
const snipes = new Collection();
const warns = new Collection();
const giveaways = new Collection();
const tickets = new Collection();
const aiCooldowns = new Collection();
const aiHistory = new Collection();
const voiceSessions = new Collection();

// Activity storage
const userXP = new Collection();         // key: guildId-userId -> { xp, level, messages, voiceMinutes, lastXp }
const levelLeaderboards = new Collection();

// ═══════════════════════════════════════════════════════════
//  UTILITIES
// ═══════════════════════════════════════════════════════════
function createEmbed(type = 'primary', title, description) {
    return new EmbedBuilder()
        .setColor(CONFIG.colors[type] || CONFIG.colors.primary)
        .setTitle(title || null)
        .setDescription(description || null)
        .setFooter({ text: CONFIG.footer, iconURL: client.user?.displayAvatarURL() })
        .setTimestamp();
}

function progressBar(current, total, size = 15) {
    const filled = Math.max(0, Math.min(size, Math.round((current / total) * size)));
    return '█'.repeat(filled) + '░'.repeat(size - filled);
}

// XP required for next level (MEE6-like curve)
function xpForLevel(level) {
    return 5 * (level ** 2) + 50 * level + 100;
}

async function sendLog(guild, embed, modLog = false) {
    if (!CONFIG.features.logging) return;
    const channelId = modLog ? (CONFIG.channels.modLog || CONFIG.channels.log) : CONFIG.channels.log;
    if (!channelId) return;
    const ch = guild.channels.cache.get(channelId);
    if (ch) ch.send({ embeds: [embed] }).catch(() => {});
}

async function safeSend(channel, content) {
    try { return await channel.send(content); } catch { return null; }
}

// ═══════════════════════════════════════════════════════════
//  ACTIVITY TRACKING HELPERS
// ═══════════════════════════════════════════════════════════
function getActivity(guildId, userId) {
    const key = `${guildId}-${userId}`;
    let data = userXP.get(key);
    if (!data) {
        data = { xp: 0, level: 0, totalXp: 0, messages: 0, voiceMinutes: 0, lastXp: 0 };
        userXP.set(key, data);
    }
    return data;
}

async function giveXP(guild, member, amount) {
    if (!CONFIG.activity.enabled) return;
    const data = getActivity(guild.id, member.id);
    const now = Date.now();
    if (now - data.lastXp < CONFIG.activity.xpCooldown) return;
    data.lastXp = now;
    data.xp += amount;
    data.totalXp += amount;

    let leveledUp = false;
    while (data.xp >= xpForLevel(data.level)) {
        data.xp -= xpForLevel(data.level);
        data.level++;
        leveledUp = true;
    }

    if (leveledUp) {
        // Level-up notification
        if (CONFIG.activity.levelupEnabled) {
            const ch = CONFIG.activity.levelupChannel
                ? guild.channels.cache.get(CONFIG.activity.levelupChannel)
                : null;
            if (ch) {
                ch.send({ embeds: [createEmbed('success', '🎉 Level Up!',
                    `Congratulations ${member}! You reached **Level ${data.level}** 🚀`)] }).catch(() => {});
            }
        }

        // Level role rewards
        for (const lr of CONFIG.levelRoles) {
            if (data.level >= lr.level) {
                const role = guild.roles.cache.get(lr.roleId);
                if (role && !member.roles.cache.has(role.id)) {
                    member.roles.add(role, `Level ${lr.level} reward`).catch(() => {});
                }
            }
        }
    }
}

// ═══════════════════════════════════════════════════════════
//  AI CHAT
// ═══════════════════════════════════════════════════════════
async function askAI(userId, userName, prompt) {
    if (!CONFIG.ai.enabled || !CONFIG.ai.apiKey) {
        return '❌ AI is not configured properly. Please check the `.env` file.';
    }
    try {
        let history = aiHistory.get(userId) || [];
        history.push({ role: 'user', content: prompt });
        if (history.length > 20) history = history.slice(-20);

        const messages = [
            { role: 'system', content: CONFIG.ai.systemPrompt },
            ...history,
        ];

        const res = await fetch(CONFIG.ai.apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${CONFIG.ai.apiKey}`,
            },
            body: JSON.stringify({
                model: CONFIG.ai.model,
                messages,
                max_tokens: CONFIG.ai.maxTokens,
                temperature: CONFIG.ai.temperature,
            }),
        });

        if (!res.ok) {
            const txt = await res.text();
            console.error('AI API error:', res.status, txt);
            return `❌ AI error (${res.status}). Please try again later.`;
        }

        const json = await res.json();
        const reply = json?.choices?.[0]?.message?.content?.trim() || 'No response.';
        history.push({ role: 'assistant', content: reply });
        aiHistory.set(userId, history);
        return reply;
    } catch (e) {
        console.error('AI fetch error:', e);
        return '❌ AI connection failed.';
    }
}

// ═══════════════════════════════════════════════════════════
//  ANTI-NUKE
// ═══════════════════════════════════════════════════════════
function trackNuke(guildId, userId, action) {
    const key = `${guildId}-${userId}-${action}`;
    const now = Date.now();
    let data = nukeCache.get(key) || [];
    data = data.filter((t) => now - t < CONFIG.antinuke.window);
    data.push(now);
    nukeCache.set(key, data);
    return data.length;
}

async function handleNuke(guild, userId, action, limit, reason) {
    const count = trackNuke(guild.id, userId, action);
    if (count < limit) return;
    if (userId === guild.ownerId || userId === client.user.id) return;

    try {
        const member = await guild.members.fetch(userId).catch(() => null);
        if (!member) return;

        if (CONFIG.antinuke.punishment === 'ban') {
            await member.roles.set([], 'Anti-Nuke').catch(() => {});
            await guild.members.ban(userId, { reason: `Anti-Nuke: ${reason}`, deleteMessageSeconds: 3600 }).catch(() => {});
        } else if (CONFIG.antinuke.punishment === 'kick') {
            await member.kick(`Anti-Nuke: ${reason}`).catch(() => {});
        } else {
            await member.timeout(86400000, `Anti-Nuke: ${reason}`).catch(() => {});
        }

        await sendLog(guild, createEmbed('error', '🚨 ANTI-NUKE TRIGGERED',
            `**User:** <@${userId}> (\`${userId}\`)\n**Action:** ${reason}\n**Punishment:** ${CONFIG.antinuke.punishment.toUpperCase()}`), true);
    } catch {}
}

// ═══════════════════════════════════════════════════════════
//  READY
// ═══════════════════════════════════════════════════════════
client.once('ready', async () => {
    console.log(`
╔══════════════════════════════════════════════════╗
║  ✅ ${CONFIG.botName} is ONLINE
║  🤖 ${client.user.tag}
║  🏠 Servers: ${client.guilds.cache.size}
║  🤖 AI Chat: ${CONFIG.ai.enabled ? 'ON' : 'OFF'}
║  📊 Activity: ${CONFIG.activity.enabled ? 'ON' : 'OFF'}
║  🛡️  Anti-Nuke: ${CONFIG.antinuke.enabled ? 'ON' : 'OFF'}
╚══════════════════════════════════════════════════╝
    `);

    const types = { PLAYING: ActivityType.Playing, WATCHING: ActivityType.Watching, LISTENING: ActivityType.Listening, COMPETING: ActivityType.Competing, STREAMING: ActivityType.Streaming };
    const opts = { name: CONFIG.activityText, type: types[CONFIG.activityType] || ActivityType.Watching };
    if (CONFIG.activityType === 'STREAMING' && CONFIG.activityUrl) opts.url = CONFIG.activityUrl;
    client.user.setPresence({ status: CONFIG.status, activities: [opts] });

    await registerCommands();

    // Server stats channel
    if (CONFIG.channels.stats) {
        setInterval(async () => {
            const ch = client.channels.cache.get(CONFIG.channels.stats);
            if (ch && ch.guild) ch.setName(`👥 Members: ${ch.guild.memberCount}`).catch(() => {});
        }, 60000);
    }

    // Giveaway checker
    setInterval(checkGiveaways, 5000);

    // Voice XP tracker
    if (CONFIG.activity.enabled) {
        setInterval(() => {
            for (const guild of client.guilds.cache.values()) {
                for (const channel of guild.channels.cache.values()) {
                    if (channel.type !== ChannelType.GuildVoice) continue;
                    if (!channel.members || channel.members.size === 0) continue;
                    const humans = channel.members.filter((m) => !m.user.bot);
                    if (humans.size < 1) continue;
                    for (const m of humans.values()) {
                        if (m.voice?.deaf || m.voice?.mute) continue;
                        const data = getActivity(guild.id, m.id);
                        data.voiceMinutes += 1;
                        data.xp += CONFIG.activity.xpPerVoiceMin;
                        data.totalXp += CONFIG.activity.xpPerVoiceMin;
                        let leveledUp = false;
                        while (data.xp >= xpForLevel(data.level)) {
                            data.xp -= xpForLevel(data.level);
                            data.level++;
                            leveledUp = true;
                        }
                        if (leveledUp && CONFIG.activity.levelupEnabled && CONFIG.activity.levelupChannel) {
                            const ch = guild.channels.cache.get(CONFIG.activity.levelupChannel);
                            ch?.send({ embeds: [createEmbed('success', '🎉 Voice Level Up!', `${m} reached **Level ${data.level}** 🎧`)] }).catch(() => {});
                        }
                    }
                }
            }
        }, 60000);
    }
});

// ═══════════════════════════════════════════════════════════
//  SLASH COMMANDS REGISTRATION
// ═══════════════════════════════════════════════════════════
async function registerCommands() {
    const cmds = [
        // Basic
        new SlashCommandBuilder().setName('ping').setDescription('Bot latency'),
        new SlashCommandBuilder().setName('help').setDescription('Show all commands'),
        new SlashCommandBuilder().setName('serverinfo').setDescription('Server info'),
        new SlashCommandBuilder().setName('userinfo').setDescription('User info')
            .addUserOption((o) => o.setName('user').setDescription('User').setRequired(false)),
        new SlashCommandBuilder().setName('avatar').setDescription('User avatar')
            .addUserOption((o) => o.setName('user').setDescription('User').setRequired(false)),
        new SlashCommandBuilder().setName('botinfo').setDescription('Bot statistics'),

        // Moderation
        new SlashCommandBuilder().setName('kick').setDescription('Kick member')
            .addUserOption((o) => o.setName('user').setDescription('User').setRequired(true))
            .addStringOption((o) => o.setName('reason').setDescription('Reason').setRequired(false)),
        new SlashCommandBuilder().setName('ban').setDescription('Ban member')
            .addUserOption((o) => o.setName('user').setDescription('User').setRequired(true))
            .addStringOption((o) => o.setName('reason').setDescription('Reason').setRequired(false))
            .addIntegerOption((o) => o.setName('delete_days').setDescription('Delete msgs days').setMinValue(0).setMaxValue(7).setRequired(false)),
        new SlashCommandBuilder().setName('unban').setDescription('Unban user')
            .addStringOption((o) => o.setName('user_id').setDescription('User ID').setRequired(true)),
        new SlashCommandBuilder().setName('timeout').setDescription('Timeout member')
            .addUserOption((o) => o.setName('user').setDescription('User').setRequired(true))
            .addIntegerOption((o) => o.setName('minutes').setDescription('Minutes').setRequired(true))
            .addStringOption((o) => o.setName('reason').setDescription('Reason').setRequired(false)),
        new SlashCommandBuilder().setName('untimeout').setDescription('Remove timeout')
            .addUserOption((o) => o.setName('user').setDescription('User').setRequired(true)),
        new SlashCommandBuilder().setName('warn').setDescription('Warn member')
            .addUserOption((o) => o.setName('user').setDescription('User').setRequired(true))
            .addStringOption((o) => o.setName('reason').setDescription('Reason').setRequired(true)),
        new SlashCommandBuilder().setName('warnings').setDescription('Show warnings')
            .addUserOption((o) => o.setName('user').setDescription('User').setRequired(true)),
        new SlashCommandBuilder().setName('clearwarns').setDescription('Clear warnings')
            .addUserOption((o) => o.setName('user').setDescription('User').setRequired(true)),
        new SlashCommandBuilder().setName('purge').setDescription('Bulk delete messages')
            .addIntegerOption((o) => o.setName('amount').setDescription('1-100').setRequired(true).setMinValue(1).setMaxValue(100)),
        new SlashCommandBuilder().setName('slowmode').setDescription('Set slowmode')
            .addIntegerOption((o) => o.setName('seconds').setDescription('Seconds').setRequired(true).setMinValue(0).setMaxValue(21600)),
        new SlashCommandBuilder().setName('lock').setDescription('Lock channel'),
        new SlashCommandBuilder().setName('unlock').setDescription('Unlock channel'),
        new SlashCommandBuilder().setName('nickname').setDescription('Set nickname')
            .addUserOption((o) => o.setName('user').setDescription('User').setRequired(true))
            .addStringOption((o) => o.setName('nickname').setDescription('Nickname').setRequired(false)),
        new SlashCommandBuilder().setName('role').setDescription('Add/remove role')
            .addUserOption((o) => o.setName('user').setDescription('User').setRequired(true))
            .addRoleOption((o) => o.setName('role').setDescription('Role').setRequired(true))
            .addStringOption((o) => o.setName('action').setDescription('add/remove').setRequired(true)
                .addChoices({ name: 'add', value: 'add' }, { name: 'remove', value: 'remove' })),
        new SlashCommandBuilder().setName('snipe').setDescription('Show last deleted message'),
        new SlashCommandBuilder().setName('nuke').setDescription('Clone & delete channel'),

        // Anti toggles
        new SlashCommandBuilder().setName('antinuke').setDescription('Toggle anti-nuke')
            .addStringOption((o) => o.setName('state').setDescription('on/off').setRequired(true)
                .addChoices({ name: 'on', value: 'on' }, { name: 'off', value: 'off' })),
        new SlashCommandBuilder().setName('antispam').setDescription('Toggle anti-spam')
            .addStringOption((o) => o.setName('state').setDescription('on/off').setRequired(true)
                .addChoices({ name: 'on', value: 'on' }, { name: 'off', value: 'off' })),
        new SlashCommandBuilder().setName('antilink').setDescription('Toggle anti-link')
            .addStringOption((o) => o.setName('state').setDescription('on/off').setRequired(true)
                .addChoices({ name: 'on', value: 'on' }, { name: 'off', value: 'off' })),
        new SlashCommandBuilder().setName('security').setDescription('Show security status'),

        // Tickets
        new SlashCommandBuilder().setName('ticket-panel').setDescription('Send ticket panel'),
        new SlashCommandBuilder().setName('ticket-close').setDescription('Close current ticket'),

        // Giveaway
        new SlashCommandBuilder().setName('giveaway').setDescription('Start a giveaway')
            .addStringOption((o) => o.setName('prize').setDescription('Prize').setRequired(true))
            .addIntegerOption((o) => o.setName('minutes').setDescription('Minutes').setRequired(true).setMinValue(1))
            .addIntegerOption((o) => o.setName('winners').setDescription('Winners').setRequired(false).setMinValue(1).setMaxValue(20)),
        new SlashCommandBuilder().setName('reroll').setDescription('Reroll giveaway')
            .addStringOption((o) => o.setName('message_id').setDescription('Message ID').setRequired(true)),
        new SlashCommandBuilder().setName('end-giveaway').setDescription('End giveaway')
            .addStringOption((o) => o.setName('message_id').setDescription('Message ID').setRequired(true)),

        // Utilities
        new SlashCommandBuilder().setName('poll').setDescription('Create poll')
            .addStringOption((o) => o.setName('question').setDescription('Question').setRequired(true))
            .addStringOption((o) => o.setName('options').setDescription('Options separated by |').setRequired(false)),
        new SlashCommandBuilder().setName('embed').setDescription('Custom embed')
            .addStringOption((o) => o.setName('title').setDescription('Title').setRequired(true))
            .addStringOption((o) => o.setName('description').setDescription('Description').setRequired(true))
            .addChannelOption((o) => o.setName('channel').setDescription('Channel').setRequired(false)),
        new SlashCommandBuilder().setName('say').setDescription('Bot says something')
            .addStringOption((o) => o.setName('message').setDescription('Message').setRequired(true)),
        new SlashCommandBuilder().setName('announce').setDescription('Announcement with embed')
            .addStringOption((o) => o.setName('title').setDescription('Title').setRequired(true))
            .addStringOption((o) => o.setName('message').setDescription('Message').setRequired(true)),
        new SlashCommandBuilder().setName('dm').setDescription('DM a user')
            .addUserOption((o) => o.setName('user').setDescription('User').setRequired(true))
            .addStringOption((o) => o.setName('message').setDescription('Message').setRequired(true)),
        new SlashCommandBuilder().setName('verify-panel').setDescription('Send verification panel'),

        // ═══════ AI COMMANDS ═══════
        new SlashCommandBuilder().setName('ai').setDescription('Chat with the AI')
            .addStringOption((o) => o.setName('prompt').setDescription('Your message').setRequired(true)),
        new SlashCommandBuilder().setName('ai-reset').setDescription('Reset your AI conversation history'),
        new SlashCommandBuilder().setName('ai-status').setDescription('Check AI status'),

        // ═══════ ACTIVITY COMMANDS ═══════
        new SlashCommandBuilder().setName('rank').setDescription('Show your rank card')
            .addUserOption((o) => o.setName('user').setDescription('User').setRequired(false)),
        new SlashCommandBuilder().setName('leaderboard').setDescription('Server XP leaderboard'),
        new SlashCommandBuilder().setName('activity-stats').setDescription('Show activity stats')
            .addUserOption((o) => o.setName('user').setDescription('User').setRequired(false)),
        new SlashCommandBuilder().setName('xp-add').setDescription('Admin: add XP to user')
            .addUserOption((o) => o.setName('user').setDescription('User').setRequired(true))
            .addIntegerOption((o) => o.setName('amount').setDescription('XP').setRequired(true)),
        new SlashCommandBuilder().setName('xp-remove').setDescription('Admin: remove XP')
            .addUserOption((o) => o.setName('user').setDescription('User').setRequired(true))
            .addIntegerOption((o) => o.setName('amount').setDescription('XP').setRequired(true)),
        new SlashCommandBuilder().setName('xp-reset').setDescription('Admin: reset all XP in server'),
    ].map((c) => c.toJSON());

    try {
        const rest = new REST({ version: '10' }).setToken(CONFIG.token);
        if (CONFIG.guildId) {
            await rest.put(Routes.applicationGuildCommands(CONFIG.clientId, CONFIG.guildId), { body: cmds });
            console.log(`✅ Registered ${cmds.length} guild slash commands`);
        } else {
            await rest.put(Routes.applicationCommands(CONFIG.clientId), { body: cmds });
            console.log(`✅ Registered ${cmds.length} global slash commands`);
        }
    } catch (e) { console.error('Command registration failed:', e); }
}

// ═══════════════════════════════════════════════════════════
//  MESSAGE CREATE — Protections + AI + XP
// ═══════════════════════════════════════════════════════════
const linkRegex = /(https?:\/\/[^\s]+|www\.[^\s]+)/gi;
const inviteRegex = /(discord\.(gg|io|me|li)|discordapp\.com\/invite|discord\.com\/invite)\/[a-zA-Z0-9]+/gi;

function containsLink(content) {
    linkRegex.lastIndex = 0; inviteRegex.lastIndex = 0;
    if (CONFIG.link.inviteEnabled && inviteRegex.test(content)) return 'invite';
    if (CONFIG.link.enabled && linkRegex.test(content)) {
        const matches = content.match(linkRegex) || [];
        for (const m of matches) {
            if (!CONFIG.link.allowed.some((a) => m.includes(a))) return 'link';
        }
    }
    return null;
}

function capsPercent(text) {
    const letters = text.replace(/[^a-zA-Z]/g, '');
    if (letters.length < 8) return 0;
    return Math.round((letters.replace(/[^A-Z]/g, '').length / letters.length) * 100);
}

client.on('messageCreate', async (message) => {
    if (!message.guild || message.author.bot) return;
    const isMod = message.member.permissions.has(PermissionsBitField.Flags.ManageMessages);

    // ── AI Chat ──
    if (CONFIG.ai.enabled) {
        const isAITrigger = message.content.toLowerCase().startsWith(CONFIG.ai.triggerPrefix.toLowerCase());
        const isMention = CONFIG.ai.replyOnMention && message.mentions.has(client.user) && !message.mentions.everyone;
        const inAllowedChannel = (CONFIG.ai.channelId && message.channel.id === CONFIG.ai.channelId) ||
            CONFIG.ai.channelIds.includes(message.channel.id);

        if ((isAITrigger || isMention) && (!CONFIG.ai.channelId && CONFIG.ai.channelIds.length === 0 || inAllowedChannel)) {
            // Cooldown
            const cd = aiCooldowns.get(message.author.id) || 0;
            if (Date.now() < cd) {
                const left = Math.ceil((cd - Date.now()) / 1000);
                const w = await safeSend(message.channel, `⏳ Slow down ${message.author}, wait **${left}s**.`);
                if (w) setTimeout(() => w.delete().catch(() => {}), 4000);
                return;
            }
            aiCooldowns.set(message.author.id, Date.now() + CONFIG.ai.cooldown * 1000);

            let prompt = message.content;
            if (isAITrigger) prompt = prompt.slice(CONFIG.ai.triggerPrefix.length).trim();
            if (isMention) prompt = prompt.replace(/<@!?\d+>/g, '').trim();
            if (!prompt) prompt = 'Hello!';

            // Typing indicator
            await message.channel.sendTyping().catch(() => {});

            const reply = await askAI(message.author.id, message.author.username, prompt);

            // Split long messages
            const chunks = reply.match(/[\s\S]{1,1900}/g) || [reply];
            for (let i = 0; i < chunks.length; i++) {
                const embed = createEmbed('premium', i === 0 ? `🤖 AI Reply` : null, chunks[i])
                    .setAuthor({ name: message.author.username, iconURL: message.author.displayAvatarURL() });
                await message.reply({ embeds: [embed] }).catch(async () => {
                    await safeSend(message.channel, chunks[i]);
                });
            }
            // Don't return — still give XP
        }
    }

    // ── Anti-link ──
    if (!isMod) {
        const linkType = containsLink(message.content);
        if (linkType) {
            try {
                await message.delete().catch(() => {});
                const w = await safeSend(message.channel, `⚠️ ${message.author}, ${linkType === 'invite' ? 'invites' : 'links'} not allowed!`);
                if (w) setTimeout(() => w.delete().catch(() => {}), 5000);
                sendLog(message.guild, createEmbed('warning', '🔗 Link Blocked',
                    `**User:** ${message.author.tag}\n**Channel:** ${message.channel}\n**Type:** ${linkType}`), true);
            } catch {}
            return;
        }

        // ── Bad words ──
        if (CONFIG.badWords.length) {
            const lower = message.content.toLowerCase();
            if (CONFIG.badWords.some((w) => lower.includes(w))) {
                await message.delete().catch(() => {});
                const w = await safeSend(message.channel, `🚫 ${message.author}, watch your language!`);
                if (w) setTimeout(() => w.delete().catch(() => {}), 5000);
                return;
            }
        }

        // ── Anti caps ──
        if (CONFIG.antiCaps.enabled && capsPercent(message.content) >= CONFIG.antiCaps.percent) {
            await message.delete().catch(() => {});
            const w = await safeSend(message.channel, `🔠 ${message.author}, don't use excessive caps!`);
            if (w) setTimeout(() => w.delete().catch(() => {}), 5000);
            return;
        }

        // ── Mention spam ──
        if (message.mentions.users.size > CONFIG.antispam.mentionLimit) {
            await message.delete().catch(() => {});
            await message.member.timeout(CONFIG.antispam.timeout, 'Mention spam').catch(() => {});
            return;
        }
    }

    // ── Anti-spam ──
    if (CONFIG.antispam.enabled && !isMod) {
        const key = `${message.guild.id}-${message.author.id}`;
        const now = Date.now();
        let data = spamCache.get(key) || { timestamps: [], messages: [] };
        data.timestamps = data.timestamps.filter((t) => now - t < CONFIG.antispam.window);
        data.timestamps.push(now);
        data.messages = data.messages.filter((m) => now - m.time < CONFIG.antispam.window);
        data.messages.push({ content: message.content.toLowerCase(), time: now });
        const dup = data.messages.filter((m) => m.content === message.content.toLowerCase()).length;
        spamCache.set(key, data);

        if (data.timestamps.length > CONFIG.antispam.limit || dup >= CONFIG.antispam.dupLimit) {
            try {
                await message.member.timeout(CONFIG.antispam.timeout, 'Anti-Spam').catch(() => {});
                const fetched = await message.channel.messages.fetch({ limit: 20 }).catch(() => null);
                if (fetched) {
                    const toDelete = fetched.filter((m) => m.author.id === message.author.id && Date.now() - m.createdTimestamp < CONFIG.antispam.window);
                    await message.channel.bulkDelete(toDelete, true).catch(() => {});
                }
                sendLog(message.guild, createEmbed('error', '🚫 Anti-Spam',
                    `**User:** ${message.author.tag}\n**Timeout:** ${Math.round(CONFIG.antispam.timeout / 60000)}m`), true);
            } catch {}
            spamCache.delete(key);
            return;
        }
    }

    // ── Activity XP ──
    if (CONFIG.activity.enabled && !message.content.startsWith(CONFIG.prefix) && message.content.length > 2) {
        const data = getActivity(message.guild.id, message.author.id);
        data.messages++;
        await giveXP(message.guild, message.member, CONFIG.activity.xpPerMessage);
    }

    // ── Prefix commands ──
    if (!message.content.startsWith(CONFIG.prefix)) return;
    const args = message.content.slice(CONFIG.prefix.length).trim().split(/\s+/);
    const cmd = args.shift().toLowerCase();

    if (cmd === 'ping') {
        const sent = await message.reply({ embeds: [createEmbed('info', '🏓 Pinging...')] });
        sent.edit({ embeds: [createEmbed('success', '🏓 Pong!', `**Latency:** \`${sent.createdTimestamp - message.createdTimestamp}ms\`\n**API:** \`${Math.round(client.ws.ping)}ms\``)] });
    } else if (cmd === 'ai' || cmd === 'ask') {
        if (!CONFIG.ai.enabled) return;
        const prompt = args.join(' ');
        if (!prompt) return message.reply({ embeds: [createEmbed('error', '❌ Missing Prompt', 'Usage: `!ai <your question>`')] });
        await message.channel.sendTyping().catch(() => {});
        const reply = await askAI(message.author.id, message.author.username, prompt);
        const chunks = reply.match(/[\s\S]{1,1900}/g) || [reply];
        for (const c of chunks) {
            await message.reply({ embeds: [createEmbed('premium', '🤖 AI Reply', c).setAuthor({ name: message.author.username, iconURL: message.author.displayAvatarURL() })] }).catch(() => {});
        }
    } else if (cmd === 'rank') {
        const target = message.mentions.users.first() || message.author;
        const data = getActivity(message.guild.id, target.id);
        const need = xpForLevel(data.level);
        const embed = createEmbed('premium', `📊 ${target.username}'s Rank`,
            `**Level:** ${data.level}\n**XP:** ${data.xp} / ${need}\n\`${progressBar(data.xp, need)}\`\n\n**Total XP:** ${data.totalXp}\n**Messages:** ${data.messages}\n**Voice Minutes:** ${data.voiceMinutes}`)
            .setThumbnail(target.displayAvatarURL());
        await message.reply({ embeds: [embed] });
    } else if (cmd === 'leaderboard' || cmd === 'lb') {
        const entries = [...userXP.entries()]
            .filter(([k]) => k.startsWith(message.guild.id + '-'))
            .sort((a, b) => b[1].totalXp - a[1].totalXp)
            .slice(0, CONFIG.activity.leaderboardSize);

        if (!entries.length) return message.reply({ embeds: [createEmbed('info', '📊 Leaderboard', 'No data yet!')] });

        const medals = ['🥇', '🥈', '🥉'];
        const desc = await Promise.all(entries.map(async ([key, data], i) => {
            const userId = key.split('-')[1];
            const u = await client.users.fetch(userId).catch(() => null);
            const prefix = medals[i] || `**${i + 1}.**`;
            return `${prefix} ${u ? u.username : 'Unknown'} — **Lvl ${data.level}** (${data.totalXp} XP)`;
        }));
        await message.reply({ embeds: [createEmbed('premium', '🏆 Server Leaderboard', desc.join('\n'))] });
    }
});

// ═══════════════════════════════════════════════════════════
//  MESSAGE DELETE (snipe)
// ═══════════════════════════════════════════════════════════
client.on('messageDelete', (message) => {
    if (!message.guild || message.author?.bot) return;
    snipes.set(message.channel.id, {
        content: message.content || '[No content]',
        author: message.author,
        timestamp: Date.now(),
    });
});

// ═══════════════════════════════════════════════════════════
//  ANTI-NUKE EVENTS
// ═══════════════════════════════════════════════════════════
client.on('channelDelete', async (channel) => {
    if (!CONFIG.antinuke.enabled || !channel.guild) return;
    const logs = await channel.guild.fetchAuditLogs({ type: 12, limit: 1 }).catch(() => null);
    const entry = logs?.entries.first();
    if (!entry || Date.now() - entry.createdTimestamp > 10000) return;
    await handleNuke(channel.guild, entry.executor.id, 'channelDelete', CONFIG.antinuke.channelDelete, 'Mass channel deletion');
});

client.on('channelCreate', async (channel) => {
    if (!CONFIG.antinuke.enabled || !channel.guild) return;
    const logs = await channel.guild.fetchAuditLogs({ type: 10, limit: 1 }).catch(() => null);
    const entry = logs?.entries.first();
    if (!entry || Date.now() - entry.createdTimestamp > 10000) return;
    await handleNuke(channel.guild, entry.executor.id, 'channelCreate', CONFIG.antinuke.channelCreate, 'Mass channel creation');
});

client.on('roleDelete', async (role) => {
    if (!CONFIG.antinuke.enabled || !role.guild) return;
    const logs = await role.guild.fetchAuditLogs({ type: 32, limit: 1 }).catch(() => null);
    const entry = logs?.entries.first();
    if (!entry || Date.now() - entry.createdTimestamp > 10000) return;
    await handleNuke(role.guild, entry.executor.id, 'roleDelete', CONFIG.antinuke.roleDelete, 'Mass role deletion');
});

client.on('roleCreate', async (role) => {
    if (!CONFIG.antinuke.enabled || !role.guild) return;
    const logs = await role.guild.fetchAuditLogs({ type: 30, limit: 1 }).catch(() => null);
    const entry = logs?.entries.first();
    if (!entry || Date.now() - entry.createdTimestamp > 10000) return;
    await handleNuke(role.guild, entry.executor.id, 'roleCreate', CONFIG.antinuke.roleCreate, 'Mass role creation');
});

client.on('guildBanAdd', async (ban) => {
    if (!CONFIG.antinuke.enabled) return;
    const logs = await ban.guild.fetchAuditLogs({ type: 22, limit: 1 }).catch(() => null);
    const entry = logs?.entries.first();
    if (!entry || Date.now() - entry.createdTimestamp > 10000) return;
    await handleNuke(ban.guild, entry.executor.id, 'ban', CONFIG.antinuke.banLimit, 'Mass banning');
});

client.on('guildMemberRemove', async (member) => {
    if (!CONFIG.antinuke.enabled) return;
    const logs = await member.guild.fetchAuditLogs({ type: 20, limit: 1 }).catch(() => null);
    const entry = logs?.entries.first();
    if (!entry || entry.target?.id !== member.id || Date.now() - entry.createdTimestamp > 10000) return;
    await handleNuke(member.guild, entry.executor.id, 'kick', CONFIG.antinuke.kickLimit, 'Mass kicking');
});

client.on('webhooksUpdate', async (channel) => {
    if (!CONFIG.antinuke.enabled) return;
    const logs = await channel.guild.fetchAuditLogs({ type: 50, limit: 1 }).catch(() => null);
    const entry = logs?.entries.first();
    if (!entry || Date.now() - entry.createdTimestamp > 10000) return;
    await handleNuke(channel.guild, entry.executor.id, 'webhook', CONFIG.antinuke.webhookLimit, 'Mass webhook creation');
});

// ═══════════════════════════════════════════════════════════
//  VOICE SESSION TRACKING
// ═══════════════════════════════════════════════════════════
client.on('voiceStateUpdate', (oldState, newState) => {
    if (!CONFIG.activity.enabled) return;
    const member = newState.member || oldState.member;
    if (!member || member.user.bot) return;

    if (!oldState.channelId && newState.channelId) {
        voiceSessions.set(member.id, Date.now());
    } else if (oldState.channelId && !newState.channelId) {
        voiceSessions.delete(member.id);
    }
});

// ═══════════════════════════════════════════════════════════
//  WELCOME / GOODBYE / AUTOROLE
// ═══════════════════════════════════════════════════════════
client.on('guildMemberAdd', async (member) => {
    if (CONFIG.features.autoRole && CONFIG.roles.auto) {
        const r = member.guild.roles.cache.get(CONFIG.roles.auto);
        if (r) member.roles.add(r).catch(() => {});
    }
    if (CONFIG.features.welcome && CONFIG.channels.welcome) {
        const ch = member.guild.channels.cache.get(CONFIG.channels.welcome);
        if (ch) {
            const embed = createEmbed('success', `🎉 Welcome to ${member.guild.name}!`,
                `Hey ${member}, welcome!\n\n**Member #${member.guild.memberCount}**\n**Account:** <t:${Math.floor(member.user.createdTimestamp / 1000)}:R>`)
                .setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 512 }));
            ch.send({ content: `${member}`, embeds: [embed] }).catch(() => {});
        }
    }
    sendLog(member.guild, createEmbed('info', '📥 Member Joined',
        `**User:** ${member.user.tag}\n**ID:** \`${member.id}\``));
});

client.on('guildMemberRemove', async (member) => {
    if (CONFIG.features.goodbye && CONFIG.channels.goodbye) {
        const ch = member.guild.channels.cache.get(CONFIG.channels.goodbye);
        if (ch) {
            ch.send({ embeds: [createEmbed('error', `👋 Goodbye, ${member.user.tag}`,
                `**${member.user.tag}** left. **Members:** ${member.guild.memberCount}`)
                .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))] }).catch(() => {});
        }
    }
});

// ═══════════════════════════════════════════════════════════
//  INTERACTIONS
// ═══════════════════════════════════════════════════════════
client.on('interactionCreate', async (interaction) => {
    // ── Buttons ──
    if (interaction.isButton()) {
        const id = interaction.customId;

        if (id.startsWith('ticket_open_')) return openTicket(interaction, id.replace('ticket_open_', ''));
        if (id === 'ticket_close') return closeTicket(interaction);
        if (id === 'ticket_claim') {
            if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageChannels))
                return interaction.reply({ embeds: [createEmbed('error', '❌ Denied', 'Staff only.')], ephemeral: true });
            return interaction.reply({ embeds: [createEmbed('success', '✋ Claimed', `By ${interaction.user}`)] });
        }
        if (id === 'verify_btn') {
            if (!CONFIG.roles.verify) return interaction.reply({ content: 'Verify role not set', ephemeral: true });
            const role = interaction.guild.roles.cache.get(CONFIG.roles.verify);
            if (!role) return interaction.reply({ content: 'Role not found', ephemeral: true });
            if (interaction.member.roles.cache.has(role.id))
                return interaction.reply({ embeds: [createEmbed('info', '✅ Already Verified', 'You already have it.')], ephemeral: true });
            await interaction.member.roles.add(role);
            return interaction.reply({ embeds: [createEmbed('success', '✅ Verified!', 'Access granted.')], ephemeral: true });
        }
        if (id.startsWith('gw_join_')) {
            const msgId = id.replace('gw_join_', '');
            const gw = giveaways.get(msgId);
            if (!gw || gw.ended) return interaction.reply({ content: 'Giveaway ended.', ephemeral: true });
            if (gw.entries.includes(interaction.user.id))
                return interaction.reply({ content: 'Already entered!', ephemeral: true });
            gw.entries.push(interaction.user.id);
            return interaction.reply({ content: `✅ Entered! Total: **${gw.entries.length}**`, ephemeral: true });
        }
        return;
    }

    if (!interaction.isChatInputCommand()) return;
    const { commandName, guild, member } = interaction;
    const reply = (e) => interaction.reply({ embeds: [e] }).catch(() => {});
    const replyE = (e) => interaction.reply({ embeds: [e], ephemeral: true }).catch(() => {});

    const isMod = member.permissions.has(PermissionsBitField.Flags.ModerateMembers) ||
        member.permissions.has(PermissionsBitField.Flags.KickMembers) ||
        member.permissions.has(PermissionsBitField.Flags.BanMembers) ||
        member.permissions.has(PermissionsBitField.Flags.Administrator);

    const requireMod = () => { if (!isMod) { replyE(createEmbed('error', '❌ Denied', 'Moderation permissions required.')); return false; } return true; };
    const requireAdmin = () => { if (!member.permissions.has(PermissionsBitField.Flags.Administrator)) { replyE(createEmbed('error', '❌ Denied', 'Admin only.')); return false; } return true; };

    try {
        switch (commandName) {

            case 'ping': {
                const t = Date.now();
                await interaction.deferReply();
                await interaction.editReply({ embeds: [createEmbed('success', '🏓 Pong!',
                    `**Bot:** \`${Date.now() - t}ms\`\n**API:** \`${Math.round(client.ws.ping)}ms\`\n**Uptime:** <t:${Math.floor((Date.now() - client.uptime) / 1000)}:R>`)] });
                break;
            }

            case 'help': {
                const embed = createEmbed('primary', `📖 ${CONFIG.botName} — Help`,
                    `**Prefix:** \`${CONFIG.prefix}\` • **Slash:** \`/\`\n\n` +
                    `**🤖 AI Chat**\n> \`/ai\` \`/ai-reset\` \`/ai-status\` \`!ai <msg>\`\n\n` +
                    `**📊 Activity**\n> \`/rank\` \`/leaderboard\` \`/activity-stats\`\n\n` +
                    `**🛡️ Protection**\n> \`/antispam\` \`/antinuke\` \`/antilink\` \`/security\`\n\n` +
                    `**🔨 Moderation**\n> \`/kick\` \`/ban\` \`/unban\` \`/timeout\` \`/untimeout\`\n> \`/warn\` \`/warnings\` \`/clearwarns\` \`/purge\` \`/slowmode\`\n> \`/lock\` \`/unlock\` \`/nickname\` \`/role\` \`/nuke\` \`/snipe\`\n\n` +
                    `**🎫 Tickets**\n> \`/ticket-panel\` \`/ticket-close\`\n\n` +
                    `**🎉 Giveaways**\n> \`/giveaway\` \`/reroll\` \`/end-giveaway\`\n\n` +
                    `**🛠️ Utilities**\n> \`/poll\` \`/embed\` \`/say\` \`/announce\` \`/dm\` \`/verify-panel\``)
                    .setThumbnail(client.user.displayAvatarURL());
                await reply(embed);
                break;
            }

            case 'serverinfo': {
                const g = guild;
                await reply(createEmbed('info', `🏠 ${g.name}`,
                    `**Owner:** <@${g.ownerId}>\n**Members:** ${g.memberCount}\n**Channels:** ${g.channels.cache.size}\n**Roles:** ${g.roles.cache.size}\n**Boosts:** ${g.premiumSubscriptionCount}\n**Created:** <t:${Math.floor(g.createdTimestamp / 1000)}:R>`)
                    .setThumbnail(g.iconURL({ dynamic: true, size: 512 })));
                break;
            }

            case 'userinfo': {
                const t = interaction.options.getUser('user') || interaction.user;
                const m = await guild.members.fetch(t.id).catch(() => null);
                const act = getActivity(guild.id, t.id);
                await reply(createEmbed('info', `👤 ${t.tag}`,
                    `**ID:** \`${t.id}\`\n**Bot:** ${t.bot ? 'Yes' : 'No'}\n**Created:** <t:${Math.floor(t.createdTimestamp / 1000)}:R>\n` +
                    (m ? `**Joined:** <t:${Math.floor(m.joinedTimestamp / 1000)}:R>\n**Top Role:** ${m.roles.highest}\n` : '') +
                    `**Level:** ${act.level}\n**Total XP:** ${act.totalXp}`)
                    .setThumbnail(t.displayAvatarURL({ dynamic: true, size: 512 })));
                break;
            }

            case 'avatar': {
                const t = interaction.options.getUser('user') || interaction.user;
                await reply(createEmbed('primary', `🖼️ ${t.tag}'s Avatar`, `[Download](${t.displayAvatarURL({ size: 4096 })})`)
                    .setImage(t.displayAvatarURL({ dynamic: true, size: 4096 })));
                break;
            }

            case 'botinfo': {
                await reply(createEmbed('premium', `🤖 ${CONFIG.botName}`,
                    `**Servers:** ${client.guilds.cache.size}\n**Users:** ${client.users.cache.size}\n**Ping:** \`${Math.round(client.ws.ping)}ms\`\n**Uptime:** <t:${Math.floor((Date.now() - client.uptime) / 1000)}:R>\n**Node:** ${process.version}\n\n**🤖 AI:** ${CONFIG.ai.enabled ? '✅' : '❌'}\n**📊 Activity:** ${CONFIG.activity.enabled ? '✅' : '❌'}\n**🛡️ Anti-Nuke:** ${CONFIG.antinuke.enabled ? '✅' : '❌'}`)
                    .setThumbnail(client.user.displayAvatarURL()));
                break;
            }

            // ═══════ AI ═══════
            case 'ai': {
                if (!CONFIG.ai.enabled) return replyE(createEmbed('error', '❌ Disabled', 'AI chat is disabled.'));
                const prompt = interaction.options.getString('prompt');
                const cd = aiCooldowns.get(interaction.user.id) || 0;
                if (Date.now() < cd) {
                    const left = Math.ceil((cd - Date.now()) / 1000);
                    return replyE(createEmbed('warning', '⏳ Cooldown', `Wait **${left}s**.`));
                }
                aiCooldowns.set(interaction.user.id, Date.now() + CONFIG.ai.cooldown * 1000);
                await interaction.deferReply();
                const r = await askAI(interaction.user.id, interaction.user.username, prompt);
                const chunks = r.match(/[\s\S]{1,1900}/g) || [r];
                await interaction.editReply({ embeds: [createEmbed('premium', '🤖 AI Reply', chunks[0])
                    .setAuthor({ name: interaction.user.username, iconURL: interaction.user.displayAvatarURL() })] });
                for (let i = 1; i < chunks.length; i++) {
                    await interaction.followUp({ embeds: [createEmbed('premium', null, chunks[i])] }).catch(() => {});
                }
                break;
            }

            case 'ai-reset': {
                aiHistory.delete(interaction.user.id);
                await replyE(createEmbed('success', '🧹 AI Memory Reset', 'Your conversation history has been cleared.'));
                break;
            }

            case 'ai-status': {
                if (!CONFIG.ai.enabled) return replyE(createEmbed('error', '🤖 AI Chat', 'Status: ❌ Disabled'));
                const hasKey = !!CONFIG.ai.apiKey && CONFIG.ai.apiKey !== 'sk-your-openai-api-key';
                await replyE(createEmbed('premium', '🤖 AI Chat Status',
                    `**Enabled:** ✅\n**Model:** \`${CONFIG.ai.model}\`\n**API Key:** ${hasKey ? '✅ Set' : '❌ Missing'}\n**Cooldown:** ${CONFIG.ai.cooldown}s\n**History Size:** 20 msgs\n**Trigger Prefix:** \`${CONFIG.ai.triggerPrefix}\``));
                break;
            }

            // ═══════ ACTIVITY ═══════
            case 'rank': {
                const t = interaction.options.getUser('user') || interaction.user;
                const data = getActivity(guild.id, t.id);
                const need = xpForLevel(data.level);
                const all = [...userXP.entries()].filter(([k]) => k.startsWith(guild.id + '-')).sort((a, b) => b[1].totalXp - a[1].totalXp);
                const pos = all.findIndex(([k]) => k === `${guild.id}-${t.id}`) + 1;
                await reply(createEmbed('premium', `📊 ${t.username}'s Rank`,
                    `**Rank:** #${pos || '?'} / ${all.length}\n**Level:** ${data.level}\n**XP:** ${data.xp} / ${need}\n\`${progressBar(data.xp, need, 20)}\`\n\n**Total XP:** ${data.totalXp}\n**Messages:** ${data.messages}\n**Voice Minutes:** ${data.voiceMinutes}`)
                    .setThumbnail(t.displayAvatarURL({ dynamic: true, size: 512 })));
                break;
            }

            case 'leaderboard': {
                const entries = [...userXP.entries()]
                    .filter(([k]) => k.startsWith(guild.id + '-'))
                    .sort((a, b) => b[1].totalXp - a[1].totalXp)
                    .slice(0, CONFIG.activity.leaderboardSize);
                if (!entries.length) return replyE(createEmbed('info', '📊 Leaderboard', 'No data yet!'));
                const medals = ['🥇', '🥈', '🥉'];
                const lines = [];
                for (let i = 0; i < entries.length; i++) {
                    const [key, data] = entries[i];
                    const uid = key.split('-')[1];
                    const u = await client.users.fetch(uid).catch(() => null);
                    lines.push(`${medals[i] || `**${i + 1}.**`} ${u ? u.username : 'Unknown'} — **Lvl ${data.level}** (${data.totalXp} XP)`);
                }
                await reply(createEmbed('premium', '🏆 Server Leaderboard', lines.join('\n')));
                break;
            }

            case 'activity-stats': {
                const t = interaction.options.getUser('user') || interaction.user;
                const data = getActivity(guild.id, t.id);
                await reply(createEmbed('info', `📈 ${t.username}'s Activity`,
                    `**Messages Sent:** ${data.messages}\n**Voice Minutes:** ${data.voiceMinutes}\n**Total XP:** ${data.totalXp}\n**Current Level:** ${data.level}\n**Current XP:** ${data.xp}`));
                break;
            }

            case 'xp-add': {
                if (!requireAdmin()) return;
                const t = interaction.options.getUser('user');
                const amt = interaction.options.getInteger('amount');
                const data = getActivity(guild.id, t.id);
                data.xp += amt; data.totalXp += amt;
                while (data.xp >= xpForLevel(data.level)) { data.xp -= xpForLevel(data.level); data.level++; }
                await reply(createEmbed('success', '✅ XP Added', `**+${amt}** XP → ${t.tag} (Now Lvl **${data.level}**)`));
                break;
            }

            case 'xp-remove': {
                if (!requireAdmin()) return;
                const t = interaction.options.getUser('user');
                const amt = interaction.options.getInteger('amount');
                const data = getActivity(guild.id, t.id);
                data.xp = Math.max(0, data.xp - amt);
                data.totalXp = Math.max(0, data.totalXp - amt);
                await reply(createEmbed('success', '✅ XP Removed', `**-${amt}** XP from ${t.tag}`));
                break;
            }

            case 'xp-reset': {
                if (!requireAdmin()) return;
                for (const [k] of userXP) if (k.startsWith(guild.id + '-')) userXP.delete(k);
                await reply(createEmbed('success', '🧹 XP Reset', 'All XP in this server has been cleared.'));
                break;
            }

            // ═══════ MODERATION ═══════
            case 'kick': {
                if (!requireMod()) return;
                const t = interaction.options.getMember('user');
                const r = interaction.options.getString('reason') || 'No reason';
                if (!t) return replyE(createEmbed('error', '❌ Not Found', 'Member not found.'));
                if (!t.kickable) return replyE(createEmbed('error', '❌ Cannot Kick', 'Cannot kick.'));
                await t.kick(`${interaction.user.tag}: ${r}`);
                await reply(createEmbed('success', '👢 Kicked', `**User:** ${t.user.tag}\n**Mod:** ${interaction.user}\n**Reason:** ${r}`));
                sendLog(guild, createEmbed('warning', '👢 Kick', `**User:** ${t.user.tag}\n**Mod:** ${interaction.user}\n**Reason:** ${r}`), true);
                break;
            }

            case 'ban': {
                if (!requireMod()) return;
                const u = interaction.options.getUser('user');
                const r = interaction.options.getString('reason') || 'No reason';
                const d = interaction.options.getInteger('delete_days') || 0;
                const tm = await guild.members.fetch(u.id).catch(() => null);
                if (tm && !tm.bannable) return replyE(createEmbed('error', '❌ Cannot Ban', 'Cannot ban.'));
                await guild.members.ban(u.id, { reason: `${interaction.user.tag}: ${r}`, deleteMessageSeconds: d * 86400 });
                await reply(createEmbed('success', '🔨 Banned', `**User:** ${u.tag}\n**Mod:** ${interaction.user}\n**Reason:** ${r}`));
                sendLog(guild, createEmbed('error', '🔨 Ban', `**User:** ${u.tag}\n**Mod:** ${interaction.user}`), true);
                break;
            }

            case 'unban': {
                if (!requireMod()) return;
                const id = interaction.options.getString('user_id');
                const bans = await guild.bans.fetch().catch(() => null);
                const b = bans?.get(id);
                if (!b) return replyE(createEmbed('error', '❌ Not Banned', 'User not banned.'));
                await guild.members.unban(id, `By ${interaction.user.tag}`);
                await reply(createEmbed('success', '✅ Unbanned', `**User:** ${b.user.tag}`));
                break;
            }

            case 'timeout': {
                if (!requireMod()) return;
                const t = interaction.options.getMember('user');
                const m = interaction.options.getInteger('minutes');
                const r = interaction.options.getString('reason') || 'No reason';
                if (!t) return replyE(createEmbed('error', '❌ Not Found', 'Member not found.'));
                if (!t.moderatable) return replyE(createEmbed('error', '❌ Cannot', 'Cannot timeout.'));
                await t.timeout(m * 60000, `${interaction.user.tag}: ${r}`);
                await reply(createEmbed('success', '⏰ Timed Out', `**User:** ${t.user.tag}\n**Duration:** ${m}m`));
                break;
            }

            case 'untimeout': {
                if (!requireMod()) return;
                const t = interaction.options.getMember('user');
                if (!t || !t.isCommunicationDisabled()) return replyE(createEmbed('error', '❌ Not Timed Out', 'User is not timed out.'));
                await t.timeout(null, `By ${interaction.user.tag}`);
                await reply(createEmbed('success', '✅ Untimed Out', `**User:** ${t.user.tag}`));
                break;
            }

            case 'warn': {
                if (!requireMod()) return;
                const u = interaction.options.getUser('user');
                const r = interaction.options.getString('reason');
                const key = `${guild.id}-${u.id}`;
                const list = warns.get(key) || [];
                list.push({ reason: r, by: interaction.user.tag, at: Date.now() });
                warns.set(key, list);
                await reply(createEmbed('warning', '⚠️ Warning', `**User:** ${u.tag}\n**Reason:** ${r}\n**Total:** ${list.length}/${CONFIG.maxWarns}\n\`${progressBar(list.length, CONFIG.maxWarns)}\``));
                u.send({ embeds: [createEmbed('warning', `⚠️ Warned in ${guild.name}`, `**Reason:** ${r}`)] }).catch(() => {});
                break;
            }

            case 'warnings': {
                if (!requireMod()) return;
                const u = interaction.options.getUser('user');
                const list = warns.get(`${guild.id}-${u.id}`) || [];
                if (!list.length) return reply(createEmbed('info', '📭 No Warnings', `**${u.tag}** has none.`));
                const desc = list.map((w, i) => `**${i + 1}.** ${w.reason}\n> ${w.by} • <t:${Math.floor(w.at / 1000)}:R>`).join('\n\n');
                await reply(createEmbed('warning', `⚠️ Warnings (${list.length})`, desc));
                break;
            }

            case 'clearwarns': {
                if (!requireMod()) return;
                const u = interaction.options.getUser('user');
                warns.delete(`${guild.id}-${u.id}`);
                await reply(createEmbed('success', '🧹 Cleared', `Warnings cleared for **${u.tag}**.`));
                break;
            }

            case 'purge': {
                if (!member.permissions.has(PermissionsBitField.Flags.ManageMessages)) return replyE(createEmbed('error', '❌ Denied', 'Need Manage Messages.'));
                const amt = interaction.options.getInteger('amount');
                await interaction.deferReply({ ephemeral: true });
                const del = await interaction.channel.bulkDelete(amt, true).catch(() => null);
                if (!del) return interaction.editReply({ embeds: [createEmbed('error', '❌ Failed', 'Could not delete.')] });
                await interaction.editReply({ embeds: [createEmbed('success', '🧹 Purged', `Deleted **${del.size}** messages.`)] });
                break;
            }

            case 'slowmode': {
                if (!member.permissions.has(PermissionsBitField.Flags.ManageChannels)) return replyE(createEmbed('error', '❌ Denied', 'Need Manage Channels.'));
                const s = interaction.options.getInteger('seconds');
                await interaction.channel.setRateLimitPerUser(s);
                await reply(createEmbed('success', '🐌 Slowmode', s === 0 ? 'Disabled.' : `Set to **${s}s**.`));
                break;
            }

            case 'lock': {
                if (!member.permissions.has(PermissionsBitField.Flags.ManageChannels)) return replyE(createEmbed('error', '❌ Denied', 'Need Manage Channels.'));
                await interaction.channel.permissionOverwrites.edit(guild.roles.everyone, { SendMessages: false });
                await reply(createEmbed('success', '🔒 Locked', 'Channel locked.'));
                break;
            }

            case 'unlock': {
                if (!member.permissions.has(PermissionsBitField.Flags.ManageChannels)) return replyE(createEmbed('error', '❌ Denied', 'Need Manage Channels.'));
                await interaction.channel.permissionOverwrites.edit(guild.roles.everyone, { SendMessages: null });
                await reply(createEmbed('success', '🔓 Unlocked', 'Channel unlocked.'));
                break;
            }

            case 'nickname': {
                if (!requireMod()) return;
                const t = interaction.options.getMember('user');
                const n = interaction.options.getString('nickname') || null;
                if (!t) return replyE(createEmbed('error', '❌ Not Found', 'Member not found.'));
                if (!t.manageable) return replyE(createEmbed('error', '❌ Cannot', 'Cannot manage.'));
                await t.setNickname(n, `By ${interaction.user.tag}`);
                await reply(createEmbed('success', '📝 Nickname', `**User:** ${t.user.tag}\n**New:** ${n || '(reset)'}`));
                break;
            }

            case 'role': {
                if (!member.permissions.has(PermissionsBitField.Flags.ManageRoles)) return replyE(createEmbed('error', '❌ Denied', 'Need Manage Roles.'));
                const t = interaction.options.getMember('user');
                const r = interaction.options.getRole('role');
                const a = interaction.options.getString('action');
                if (!t) return replyE(createEmbed('error', '❌ Not Found', 'Member not found.'));
                if (a === 'add') await t.roles.add(r); else await t.roles.remove(r);
                await reply(createEmbed('success', `✅ Role ${a === 'add' ? 'Added' : 'Removed'}`, `**User:** ${t.user.tag}\n**Role:** ${r}`));
                break;
            }

            case 'snipe': {
                const s = snipes.get(interaction.channel.id);
                if (!s) return replyE(createEmbed('error', '📭 Nothing', 'No deleted messages.'));
                await reply(createEmbed('info', '🎯 Sniped',
                    `**Author:** ${s.author.tag}\n**Deleted:** <t:${Math.floor(s.timestamp / 1000)}:R>\n\n\`\`\`${s.content.slice(0, 1000)}\`\`\``));
                break;
            }

            case 'nuke': {
                if (!member.permissions.has(PermissionsBitField.Flags.ManageChannels)) return replyE(createEmbed('error', '❌ Denied', 'Need Manage Channels.'));
                const pos = interaction.channel.position;
                const clone = await interaction.channel.clone();
                await interaction.channel.delete().catch(() => {});
                await clone.setPosition(pos).catch(() => {});
                clone.send({ embeds: [createEmbed('success', '💥 Nuked', `Fresh start by ${interaction.user}`)] }).catch(() => {});
                break;
            }

            // ═══════ TOGGLES ═══════
            case 'antinuke':
            case 'antispam':
            case 'antilink': {
                if (!requireAdmin()) return;
                const st = interaction.options.getString('state') === 'on';
                if (commandName === 'antinuke') CONFIG.antinuke.enabled = st;
                if (commandName === 'antispam') CONFIG.antispam.enabled = st;
                if (commandName === 'antilink') CONFIG.link.enabled = st;
                await reply(createEmbed('success', '🛡️ Updated', `**${commandName}** → **${st ? 'ENABLED' : 'DISABLED'}**`));
                break;
            }

            case 'security': {
                await reply(createEmbed('premium', '🔒 Security Status',
                    `**🛡️ Anti-Spam:** ${CONFIG.antispam.enabled ? '✅ ON' : '❌ OFF'}\n` +
                    `**🚨 Anti-Nuke:** ${CONFIG.antinuke.enabled ? '✅ ON' : '❌ OFF'}\n` +
                    `**🔗 Anti-Link:** ${CONFIG.link.enabled ? '✅ ON' : '❌ OFF'}\n` +
                    `**🔠 Anti-Caps:** ${CONFIG.antiCaps.enabled ? '✅ ON' : '❌ OFF'}\n` +
                    `**🔨 Punishment:** ${CONFIG.antinuke.punishment}\n` +
                    `**🤖 AI Chat:** ${CONFIG.ai.enabled ? '✅ ON' : '❌ OFF'}\n` +
                    `**📊 Activity:** ${CONFIG.activity.enabled ? '✅ ON' : '❌ OFF'}`));
                break;
            }

            // ═══════ TICKETS ═══════
            case 'ticket-panel': {
                if (!requireAdmin()) return;
                const embed = createEmbed('primary', '🎫 Support Tickets',
                    `Click a button below to open a ticket!\n\n> 🛠️ **Support** — General help\n> 💰 **Billing** — Payment issues\n> 🚨 **Report** — Report a user\n> 💡 **Suggestion** — Share ideas`);
                const row1 = new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setCustomId('ticket_open_support').setLabel('Support').setEmoji('🛠️').setStyle(ButtonStyle.Primary),
                    new ButtonBuilder().setCustomId('ticket_open_billing').setLabel('Billing').setEmoji('💰').setStyle(ButtonStyle.Success),
                );
                const row2 = new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setCustomId('ticket_open_report').setLabel('Report').setEmoji('🚨').setStyle(ButtonStyle.Danger),
                    new ButtonBuilder().setCustomId('ticket_open_suggestion').setLabel('Suggestion').setEmoji('💡').setStyle(ButtonStyle.Secondary),
                );
                await interaction.channel.send({ embeds: [embed], components: [row1, row2] });
                await replyE(createEmbed('success', '✅ Panel Sent', 'Ticket panel posted.'));
                break;
            }

            case 'ticket-close': {
                if (!tickets.has(interaction.channel.id)) return replyE(createEmbed('error', '❌ Not Ticket', 'Not a ticket.'));
                await interaction.reply({ embeds: [createEmbed('info', '🔒 Closing', 'Ticket closes in 5s...')] });
                setTimeout(() => interaction.channel.delete().catch(() => {}), 5000);
                break;
            }

            // ═══════ GIVEAWAY ═══════
            case 'giveaway': {
                if (!requireAdmin()) return;
                const prize = interaction.options.getString('prize');
                const mins = interaction.options.getInteger('minutes');
                const winners = interaction.options.getInteger('winners') || 1;
                const endsAt = Date.now() + mins * 60000;
                const embed = createEmbed('premium', '🎉 GIVEAWAY 🎉',
                    `**Prize:** ${prize}\n**Winners:** ${winners}\n**Ends:** <t:${Math.floor(endsAt / 1000)}:R>\n**Hosted by:** ${interaction.user}\n\n**Entries:** 0`);
                const msg = await interaction.channel.send({ embeds: [embed], components: [
                    new ActionRowBuilder().addComponents(
                        new ButtonBuilder().setCustomId('gw_join_placeholder').setLabel('Join').setEmoji('🎉').setStyle(ButtonStyle.Success)
                    )
                ]});
                await msg.edit({ components: [
                    new ActionRowBuilder().addComponents(
                        new ButtonBuilder().setCustomId(`gw_join_${msg.id}`).setLabel('Join').setEmoji('🎉').setStyle(ButtonStyle.Success)
                    )
                ]});
                giveaways.set(msg.id, { prize, winners, endsAt, entries: [], channelId: interaction.channel.id, host: interaction.user.id, messageId: msg.id, ended: false });
                await replyE(createEmbed('success', '🎉 Giveaway Started', `Ends <t:${Math.floor(endsAt / 1000)}:R>`));
                break;
            }

            case 'reroll': {
                if (!requireAdmin()) return;
                const id = interaction.options.getString('message_id');
                const gw = giveaways.get(id);
                if (!gw || !gw.entries.length) return replyE(createEmbed('error', '❌ No Entries', 'No entries found.'));
                const w = gw.entries[Math.floor(Math.random() * gw.entries.length)];
                await reply(createEmbed('success', '🎉 Reroll Winner', `New winner: <@${w}> for **${gw.prize}**`));
                break;
            }

            case 'end-giveaway': {
                if (!requireAdmin()) return;
                const id = interaction.options.getString('message_id');
                const gw = giveaways.get(id);
                if (!gw) return replyE(createEmbed('error', '❌ Not Found', 'Giveaway not found.'));
                await endGiveaway(gw);
                await replyE(createEmbed('success', '✅ Ended', 'Giveaway ended.'));
                break;
            }

            // ═══════ UTILITIES ═══════
            case 'poll': {
                const q = interaction.options.getString('question');
                const optsStr = interaction.options.getString('options');
                const opts = optsStr ? optsStr.split('|').map((s) => s.trim()).slice(0, 5) : ['Yes', 'No'];
                const emojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣'];
                let desc = `**${q}**\n\n`;
                opts.forEach((o, i) => { desc += `${emojis[i]} ${o}\n`; });
                const msg = await interaction.channel.send({ embeds: [createEmbed('info', '📊 Poll', desc)] });
                for (let i = 0; i < opts.length; i++) await msg.react(emojis[i]).catch(() => {});
                await replyE(createEmbed('success', '✅ Poll Created', 'Poll posted.'));
                break;
            }

            case 'embed': {
                if (!requireAdmin()) return;
                const title = interaction.options.getString('title');
                const desc = interaction.options.getString('description');
                const ch = interaction.options.getChannel('channel') || interaction.channel;
                await ch.send({ embeds: [createEmbed('primary', title, desc)] });
                await replyE(createEmbed('success', '✅ Sent', `Embed sent to ${ch}.`));
                break;
            }

            case 'say': {
                if (!requireMod()) return;
                const m = interaction.options.getString('message');
                await interaction.channel.send(m);
                await replyE(createEmbed('success', '✅ Sent', 'Message sent.'));
                break;
            }

            case 'announce': {
                if (!requireAdmin()) return;
                const title = interaction.options.getString('title');
                const m = interaction.options.getString('message');
                await interaction.channel.send({ content: '@everyone', embeds: [createEmbed('premium', `📢 ${title}`, m)] });
                await replyE(createEmbed('success', '✅ Announced', 'Announcement sent.'));
                break;
            }

            case 'dm': {
                if (!requireAdmin()) return;
                const u = interaction.options.getUser('user');
                const m = interaction.options.getString('message');
                await u.send({ embeds: [createEmbed('info', `📩 Message from ${guild.name}`, m)] }).catch(() => {});
                await replyE(createEmbed('success', '✅ DM Sent', `Sent to ${u.tag}`));
                break;
            }

            case 'verify-panel': {
                if (!requireAdmin()) return;
                const embed = createEmbed('success', '✅ Verification',
                    'Click the button below to verify and gain access!');
                const row = new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setCustomId('verify_btn').setLabel('Verify').setEmoji('✅').setStyle(ButtonStyle.Success)
                );
                await interaction.channel.send({ embeds: [embed], components: [row] });
                await replyE(createEmbed('success', '✅ Panel Sent', 'Verification panel posted.'));
                break;
            }
        }
    } catch (e) {
        console.error(`Error [${commandName}]:`, e);
        if (interaction.deferred || interaction.replied) {
            interaction.editReply({ embeds: [createEmbed('error', '❌ Error', `\`${e.message}\``)] }).catch(() => {});
        } else {
            interaction.reply({ embeds: [createEmbed('error', '❌ Error', `\`${e.message}\``)], ephemeral: true }).catch(() => {});
        }
    }
});

// ═══════════════════════════════════════════════════════════
//  TICKETS
// ═══════════════════════════════════════════════════════════
async function openTicket(interaction, type) {
    const guild = interaction.guild;
    const category = CONFIG.channels.ticketCategory ? guild.channels.cache.get(CONFIG.channels.ticketCategory) : null;
    const existing = guild.channels.cache.find((c) => c.name === `ticket-${interaction.user.username.toLowerCase()}`);
    if (existing) return interaction.reply({ embeds: [createEmbed('error', '❌ Already Open', `You already have: ${existing}`)], ephemeral: true });

    await interaction.deferReply({ ephemeral: true });

    const ch = await guild.channels.create({
        name: `ticket-${interaction.user.username}`.slice(0, 100),
        type: ChannelType.GuildText,
        parent: category?.id,
        permissionOverwrites: [
            { id: guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
            { id: interaction.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory] },
            { id: client.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ManageChannels] },
        ],
    }).catch(() => null);

    if (!ch) return interaction.editReply({ embeds: [createEmbed('error', '❌ Failed', 'Could not create ticket.')] });

    tickets.set(ch.id, { owner: interaction.user.id, type, createdAt: Date.now() });

    const embed = createEmbed('primary', `🎫 ${type.toUpperCase()} Ticket`,
        `Hello ${interaction.user}, thanks for opening a ticket!\n\n**Type:** ${type}\n**Support will be with you shortly.**`);
    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('ticket_close').setLabel('Close').setEmoji('🔒').setStyle(ButtonStyle.Danger),
        new ButtonBuilder().setCustomId('ticket_claim').setLabel('Claim').setEmoji('✋').setStyle(ButtonStyle.Success),
    );
    await ch.send({ content: `${interaction.user}`, embeds: [embed], components: [row] });

    if (CONFIG.channels.ticketLog) {
        const logCh = guild.channels.cache.get(CONFIG.channels.ticketLog);
        logCh?.send({ embeds: [createEmbed('info', '🎫 Ticket Opened',
            `**User:** ${interaction.user.tag}\n**Type:** ${type}\n**Channel:** ${ch}`)] }).catch(() => {});
    }

    await interaction.editReply({ embeds: [createEmbed('success', '✅ Ticket Created', `Your ticket: ${ch}`)] });
}

async function closeTicket(interaction) {
    if (!tickets.has(interaction.channel.id)) return interaction.reply({ embeds: [createEmbed('error', '❌ Not Ticket', 'Not a ticket.')], ephemeral: true });
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
        const t = tickets.get(interaction.channel.id);
        if (t.owner !== interaction.user.id) return interaction.reply({ embeds: [createEmbed('error', '❌ Denied', 'Only owner or staff.')], ephemeral: true });
    }
    await interaction.reply({ embeds: [createEmbed('info', '🔒 Closing', 'Ticket closes in 5s...')] });
    if (CONFIG.channels.ticketLog) {
        const logCh = interaction.guild.channels.cache.get(CONFIG.channels.ticketLog);
        logCh?.send({ embeds: [createEmbed('warning', '🔒 Ticket Closed', `**By:** ${interaction.user.tag}\n**Channel:** #${interaction.channel.name}`)] }).catch(() => {});
    }
    setTimeout(() => interaction.channel.delete().catch(() => {}), 5000);
}

// ═══════════════════════════════════════════════════════════
//  GIVEAWAY CHECKER
// ═══════════════════════════════════════════════════════════
async function checkGiveaways() {
    const now = Date.now();
    for (const [id, gw] of giveaways) {
        if (gw.ended || now < gw.endsAt) continue;
        await endGiveaway(gw);
    }
}

async function endGiveaway(gw) {
    gw.ended = true;
    const ch = client.channels.cache.get(gw.channelId);
    if (!ch) return;
    const msg = await ch.messages.fetch(gw.messageId).catch(() => null);
    if (!msg) return;
    const winners = [];
    const pool = [...gw.entries];
    for (let i = 0; i < gw.winners && pool.length; i++) {
        const idx = Math.floor(Math.random() * pool.length);
        winners.push(pool.splice(idx, 1)[0]);
    }
    await msg.edit({ embeds: [createEmbed('premium', '🎉 GIVEAWAY ENDED 🎉',
        `**Prize:** ${gw.prize}\n**Winners:** ${winners.length ? winners.map((w) => `<@${w}>`).join(', ') : 'None 😢'}\n**Total Entries:** ${gw.entries.length}`)],
        components: [] }).catch(() => {});
    if (winners.length) await ch.send({ content: `🎉 Congratulations ${winners.map((w) => `<@${w}>`).join(', ')}! You won **${gw.prize}**!` });
    else await ch.send({ content: `😢 No entries for **${gw.prize}**` });
    giveaways.delete(gw.messageId);
}

// ═══════════════════════════════════════════════════════════
//  PROCESS GUARDS
// ═══════════════════════════════════════════════════════════
process.on('unhandledRejection', (e) => console.error('Unhandled:', e));
process.on('uncaughtException', (e) => console.error('Uncaught:', e));

// ═══════════════════════════════════════════════════════════
//  LOGIN
// ═══════════════════════════════════════════════════════════
if (!CONFIG.token) { console.error('❌ DISCORD_TOKEN missing'); process.exit(1); }
client.login(CONFIG.token);
