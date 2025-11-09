const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder } = require('discord.js');
require("dotenv").config();
const express = require("express");
// default
const client = new Client({ intents: [GatewayIntentBits.Guilds] });
const app = express();
const PORT = process.env.PORT || 3000;
app.get("/", (req, res) => res.send("Bot is running!"));
app.listen(PORT, () => console.log(`Web server running on port ${PORT}`));
// environment
const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_IDS = process.env.GUILD_ID ? process.env.GUILD_ID.split(",").map(id => id.trim()) : [];
// under commands
const commands = [
  new SlashCommandBuilder()
    .setName('안녕')
    .setDescription('봇이 인사를 해줍니다'),
  new SlashCommandBuilder()
    .setName('더하기')
    .setDescription('두 수를 더합니다')
    .addIntegerOption(opt =>
      opt.setName('a').setDescription('첫 번째 숫자').setRequired(true))
    .addIntegerOption(opt =>
      opt.setName('b').setDescription('두 번째 숫자').setRequired(true)),
  new SlashCommandBuilder()
    .setName('준성아')
    .setDescription('뭔지 알잖아요'),
  new SlashCommandBuilder()
    .setName('젠장')
    .setDescription('또 그녀석 때문인가...')
].map(cmd => cmd.toJSON());
// registering commands
const rest = new REST({ version: '10' }).setToken(TOKEN);
(async () => {
  try {
    console.log('슬래시 명령어 등록 시작...');

    // commands : test guilds
    for (const guildID of GUILD_IDS) {
      await rest.put(
        Routes.applicationGuildCommands(CLIENT_ID, guildID),
        { body: commands }
      );
      console.log(`테스트 서버(${guildID})에 길드 명령어 등록 완료`);
    }

    // commands : global
    if (process.env.DEPLOY_GLOBAL === "true") {
      await rest.put(
        Routes.applicationCommands(CLIENT_ID),
        { body: commands }
      );
      console.log('전역 명령어 등록 완료');
    }

    console.log('모든 명령어 등록 완료!');
  } catch (error) {
    console.error('명령어 등록 중 오류:', error);
  }
})();

// interaction execution
client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  try {
    const { commandName } = interaction;

    // immediate commands
    if (commandName === '안녕')
      return await interaction.reply('안녕하세요!');
    if (commandName === '준성아')
      return await interaction.reply('그만봐');
    if (commandName === '젠장')
      return await interaction.reply('또 임채민 때문이야');

    // deferReply
    if (commandName === '더하기') {
      await interaction.deferReply();
      const a = interaction.options.getInteger('a');
      const b = interaction.options.getInteger('b');
      await interaction.editReply(`결과: ${a + b}`);
      return;
    }

  } catch (error) {
    console.error('Interaction 처리 중 오류:', error);
    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({ content: '오류가 발생했습니다.', ephemeral: true });
    }
  }
});

// etc handlings
client.once('ready', () => {
  console.log(`로그인됨: ${client.user.tag}`);
});

client.on('error', console.error);
client.on('shardError', console.error);
process.on('unhandledRejection', console.error);

client.login(TOKEN);
