<!DOCTYPE html>
<html>
<head><title>Dashboard</title></head>
<body>
  <h2>Bot Dashboard</h2>
  <div id="userInfo"></div>
  <div id="guildsList"></div>

  <script>
    const params = new URLSearchParams(window.location.search);
    const user = JSON.parse(decodeURIComponent(params.get("user")));
    const guilds = JSON.parse(decodeURIComponent(params.get("guilds")));

    document.getElementById("userInfo").innerHTML = `
      Logged in as <strong>${user.username}#${user.discriminator}</strong>
      <br><img src="https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png" width="80">
    `;

    const guildsHTML = guilds.map(g => `<li>${g.name}</li>`).join('');
    document.getElementById("guildsList").innerHTML = `<h3>Your Servers</h3><ul>${guildsHTML}</ul>`;
  </script>
</body>
</html>
