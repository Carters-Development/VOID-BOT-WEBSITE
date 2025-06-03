const loginBtn = document.getElementById('loginBtn');
const loginSection = document.getElementById('loginSection');
const dashboard = document.getElementById('dashboard');
const usernameSpan = document.getElementById('username');
const guildList = document.getElementById('guildList');
const guildSelect = document.getElementById('guildSelect');
const welcomeMsg = document.getElementById('welcomeMsg');
const saveConfigBtn = document.getElementById('saveConfigBtn');
const inviteLink = document.getElementById('inviteLink');

const CLIENT_ID = 'YOUR_CLIENT_ID';
const PERMISSIONS = '8'; // Admin permissions for invite
const REDIRECT_URI = 'http://localhost:3000/callback';
const BOT_INVITE_LINK = `https://discord.com/api/oauth2/authorize?client_id=${CLIENT_ID}&permissions=${PERMISSIONS}&scope=bot%20applications.commands`;

// Store user data here
let user = null;
let guilds = [];

loginBtn.onclick = () => {
  window.location.href = 'http://localhost:3000/login';
};

// If the backend sends user data directly after OAuth callback, you can load it here.
// For now, manual JSON input is needed or you can extend with cookies / sessions.

async function loadDashboard(data) {
  user = data.user;
  guilds = data.guilds;
  loginSection.style.display = 'none';
  dashboard.style.display = 'block';
  usernameSpan.textContent = user.username;

  // Populate guild list and dropdown
  guildList.innerHTML = '';
  guildSelect.innerHTML = '';
  guilds.forEach(guild => {
    const li = document.createElement('li');
    li.textContent = `${guild.name} (ID: ${guild.id})`;
    guildList.appendChild(li);

    // Only include guilds where user has Manage Guild permission (0x20)
    if (guild.permissions & 0x20) {
      const option = document.createElement('option');
      option.value = guild.id;
      option.textContent = guild.name;
      guildSelect.appendChild(option);
    }
  });

  // Load config for selected guild
  guildSelect.onchange = loadConfig;
  if (guildSelect.options.length > 0) {
    guildSelect.selectedIndex = 0;
    loadConfig();
  }

  inviteLink.href = BOT_INVITE_LINK;
}

async function loadConfig() {
  const guildId = guildSelect.value;
  const res = await fetch(`http://localhost:3000/config/${guildId}`);
  const data = await res.json();
  welcomeMsg.value = data.welcomeMessage || '';
}

saveConfigBtn.onclick = async () => {
  const guildId = guildSelect.value;
  const message = welcomeMsg.value.trim();
  if (!message) {
    alert('Please enter a welcome message.');
    return;
  }
  const res = await fetch('http://localhost:3000/saveConfig', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ guildId, welcomeMessage: message }),
  });
  const data = await res.json();
  if (data.success) alert('Configuration saved!');
  else alert('Failed to save.');
}
