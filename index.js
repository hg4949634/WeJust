const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder } = require('discord.js');
require("dotenv").config();
const client = new Client({ intents: [GatewayIntentBits.Guilds] });
const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;
app.get("/", (req, res) => res.send("Bot is running!"));
app.listen(PORT, () => console.log(`✅ Web server on port ${PORT}`));

var TOKEN, CLIENT_ID, GUILD_ID;

// /안녕 명령어 정의
const commands = [
  new SlashCommandBuilder()
    .setName('안녕')
    .setDescription('봇이 인사를 해줍니다'),
  new SlashCommandBuilder()
    .setName('더하기')
    .setDescription('두 수를 더합니다')
    .addIntegerOption(option =>
      option.setName('a')
            .setDescription('첫 번째 숫자')
            .setRequired(true))
    .addIntegerOption(option =>
      option.setName('b')
            .setDescription('두 번째 숫자')
            .setRequired(true)),
  new SlashCommandBuilder()
    .setName('준성아')
    .setDescription('뭔지 알잖아요')
].map(command => command.toJSON());

// REST API로 디스코드 서버에 명령어 등록
const rest = new REST({ version: '10' }).setToken(TOKEN);

(async () => {
  try {
    console.log('📌 슬래시 명령어 등록 중...');
    await rest.put(
      Routes.applicationCommands(CLIENT_ID),
      { body: commands },
    );
    console.log('✅ 슬래시 명령어 등록 완료!');
  } catch (error) {
    console.error(error);
  }
})();

client.on('ready', () => {
  console.log(`✅ 로그인됨: ${client.user.tag}`);
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === '안녕') {
    await interaction.reply('안녕하세요! 🤖');
  }

  if (interaction.commandName === '더하기') {
    const a = interaction.options.getInteger('a');
    const b = interaction.options.getInteger('b');
    await interaction.reply(`결과: ${a + b}`);
  }
  if (interaction.commandName === '준성아') {
    await interaction.reply('그만봐');
  }
});

client.login(process.env.TOKEN);
