const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder } = require('discord.js');
require("dotenv").config();
const client = new Client({ intents: [GatewayIntentBits.Guilds] });
const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;
app.get("/", (req, res) => res.send("Bot is running!"));
app.listen(PORT, () => console.log(`Web server on port ${PORT}`));

const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const guildIDs = process.env.GUILD_ID
  ? [...new Set(process.env.GUILD_ID.split(",").map(id => id.trim()))]
  : [];

//명령어 정의
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
    .setDescription('뭔지 알잖아요'),
  new SlashCommandBuilder()
    .setName('젠장')
    .setDescription('또 그녀석 때문인가...')
].map(command => command.toJSON());

// REST API로 디스코드 서버에 명령어 등록
const rest = new REST({ version: '10' }).setToken(TOKEN);

(async () => {
  try {
    console.log('슬래시 명령어 등록 시작...');

    // 🔹 테스트 서버 길드 등록
    for (const guildID of guildIDs) {
      if (!/^\d{17,19}$/.test(guildID)) {
        console.warn(`잘못된 길드 ID 무시됨: ${guildID}`);
        continue;
      }

      // 기존 길드 명령어 초기화
      await rest.put(
        Routes.applicationGuildCommands(CLIENT_ID, guildID),
        { body: [] }
      );
      console.log(`테스트 서버(${guildID}) 기존 명령어 초기화`);

      // 새 명령어 등록
      await rest.put(
        Routes.applicationGuildCommands(CLIENT_ID, guildID),
        { body: commands }
      );
      console.log(`테스트 서버(${guildID}) 새 길드 명령어 등록 완료`);
    }

    // 🔹 전역 등록 (배포용, DEPLOY_GLOBAL=true)
    if (process.env.DEPLOY_GLOBAL === "true") {
      await rest.put(
        Routes.applicationCommands(CLIENT_ID),
        { body: commands }
      );
      console.log('전역 명령어 등록 완료');
    }

    console.log('모든 명령어 등록 완료!');
  } catch (error) {
    console.error(error);
  }
})();



client.on('clientReady', () => {
  console.log(`로그인됨: ${client.user.tag}`);
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === '안녕') {
    await interaction.reply('안녕하세요!');
  }

  if (interaction.commandName === '더하기') {
    const a = interaction.options.getInteger('a');
    const b = interaction.options.getInteger('b');
    await interaction.reply(`결과: ${a + b}`);
  }
  if (interaction.commandName === '준성아') {
    await interaction.reply('그만봐');
  }
  if (interaction.commandName === '젠장') {
    await interaction.reply('또 임채민 때문이야');
  }
});

client.login(process.env.TOKEN);
