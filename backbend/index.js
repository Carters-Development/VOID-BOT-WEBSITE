import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = 'http://localhost:3000/callback';

const DATA_FILE = path.resolve('./backend/data.json');

async function loadData() {
  try {
    const content = await fs.readFile(DATA_FILE, 'utf8');
    return JSON.parse(content);
  } catch {
    return {};
  }
}

async function saveData(data) {
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
}

// OAuth2 login endpoint
app.get('/login', (req, res) => {
  const discordAuthUrl = `https://discord.com/api/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=identify%20guilds`;
  res.redirect(discordAuthUrl);
});

// OAuth2 callback endpoint
app.get('/callback', async (req, res) => {
  const code = req.query.code;
  if (!code) return res.status(400).send('No code provided');

  const params = new URLSearchParams();
  params.append('client_id', CLIENT_ID);
  params.append('client_secret', CLIENT_SECRET);
  params.append('grant_type', 'authorization_code');
  params.append('code', code);
  params.append('redirect_uri', REDIRECT_URI);
  params.append('scope', 'identify guilds');

  try {
    const tokenRes = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      body: params,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    const tokenData = await tokenRes.json();

    if (tokenData.error) return res.status(400).send(tokenData.error_description);

    // Get user info
    const userRes = await fetch('https://discord.com/api/users/@me', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const userData = await userRes.json();

    // Get guilds
    const guildRes = await fetch('https://discord.com/api/users/@me/guilds', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const guildsData = await guildRes.json();

    // Here you could set a session cookie or JWT and redirect to frontend
    // For simplicity, just send JSON data:
    res.json({
      user: userData,
      guilds: guildsData,
      access_token: tokenData.access_token,
    });
  } catch (error) {
    res.status(500).send('Server error');
  }
});

// Save config per guild
app.post('/saveConfig', async (req, res) => {
  // Expect JSON: { guildId, welcomeMessage }
  const { guildId, welcomeMessage } = req.body;
  if (!guildId || !welcomeMessage) return res.status(400).send('Missing data');

  const data = await loadData();
  data[guildId] = { welcomeMessage };
  await saveData(data);
  res.json({ success: true });
});

// Get config for a guild
app.get('/config/:guildId', async (req, res) => {
  const data = await loadData();
  res.json(data[req.params.guildId] || {});
});

app.listen(3000, () => console.log('Backend running on http://localhost:3000'));
