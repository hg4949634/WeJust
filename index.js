// ====================== import ======================
import { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder } from 'discord.js';
import express from 'express';
import dotenv from 'dotenv';
dotenv.config();

// ====================== 기본 설정 ======================
const client = new Client({ intents: [GatewayIntentBits.Guilds] });
const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => res.send(" Bot is running fine!"));
app.listen(PORT, () => console.log(` Web server running on port ${PORT}`));

const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_IDS = process.env.GUILD_ID ? process.env.GUILD_ID.split(",").map(id => id.trim()) : [];
const DEPLOY_GLOBAL = process.env.DEPLOY_GLOBAL === "true";

// ====================== 환경 변수 진단 ======================
console.log(" 환경변수 확인:");
console.log({
  TOKEN: TOKEN ? " 존재함" : " 없음",
  CLIENT_ID: CLIENT_ID || " 없음",
  GUILD_IDS: GUILD_IDS.length > 0 ? GUILD_IDS : " 없음",
  DEPLOY_GLOBAL
});

if (!TOKEN || !CLIENT_ID) {
  console.error(" 필수 환경변수(TOKEN 또는 CLIENT_ID)가 없습니다! Render Environment Variables를 확인하세요.");
  process.exit(1);
}

// ====================== 명령어 정의 ======================
const commands = [
  new SlashCommandBuilder().setName('안녕').setDescription('봇이 인사를 해줍니다'),
  new SlashCommandBuilder()
    .setName('더하기')
    .setDescription('두 수를 더합니다')
    .addIntegerOption(opt =>
      opt.setName('a').setDescription('첫 번째 숫자').setRequired(true))
    .addIntegerOption(opt =>
      opt.setName('b').setDescription('두 번째 숫자').setRequired(true)),
  new SlashCommandBuilder().setName('준성아').setDescription('뭔지 알잖아요'),
  new SlashCommandBuilder().setName('젠장').setDescription('또 그녀석 때문인가...')
].map(cmd => cmd.toJSON());

// ====================== 명령어 등록 ======================
const rest = new REST({ version: '10' }).setToken(TOKEN);

(async () => {
  try {
    console.log(' 슬래시 명령어 등록 시작...');

    // 길드 명령어 등록
    for (const guildID of GUILD_IDS) {
      console.log(` [${guildID}] 길드 명령어 등록 시도 중...`);
      try {
        const data = await rest.put(
          Routes.applicationGuildCommands(CLIENT_ID, guildID),
          { body: commands }
        );
        console.log(`✅ [${guildID}] 길드 명령어 등록 성공 (${data.length}개)`);
      } catch (err) {
        console.error(` [${guildID}] 등록 실패`);
        console.error(`   ↳ 원인: ${err.rawError?.message || err.message}`);
        console.error(`   ↳ 상태 코드: ${err.status}`);
      }
    }

    // 전역 명령어 등록
    if (DEPLOY_GLOBAL) {
      console.log(" 전역 명령어 등록 시도 중...");
      try {
        const data = await rest.put(
          Routes.applicationCommands(CLIENT_ID),
          { body: commands }
        );
        console.log(`✅ 전역 명령어 등록 완료 (${data.length}개)`);
      } catch (err) {
        console.error(" 전역 명령어 등록 실패:", err.message);
        console.error(`   ↳ 상태 코드: ${err.status}`);
      }
    }

    console.log(' 명령어 등록 프로세스 완료!');
  } catch (err) {
    console.error(' 명령어 등록 중 치명적 오류:', err);
  }
})();

// ====================== Interaction 처리 ======================
client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  try {
    const { commandName } = interaction;

    // 즉시 응답 가능한 명령어
    if (commandName === '안녕')
      return await interaction.reply('안녕하세요!');
    if (commandName === '준성아')
      return await interaction.reply('그만봐');
    if (commandName === '젠장')
      return await interaction.reply('또 임채민 때문이야');

    // 시간이 걸릴 수 있는 명령어
    if (commandName === '더하기') {
      await interaction.deferReply();
      const a = interaction.options.getInteger('a');
      const b = interaction.options.getInteger('b');
      await interaction.editReply(`결과: ${a + b}`);
      return;
    }

  } catch (error) {
    console.error(' Interaction 처리 중 오류:');
    console.error(`   ↳ 명령어: ${interaction.commandName}`);
    console.error(`   ↳ 오류 내용: ${error.message}`);

    if (!interaction.replied && !interaction.deferred) {
      try {
        await interaction.reply({ content: ' 오류가 발생했습니다. 잠시 후 다시 시도해주세요.', ephemeral: true });
      } catch (nestedErr) {
        console.error("   ↳ 응답 실패 (이미 처리된 Interaction):", nestedErr.message);
      }
    }
  }
});

// ====================== 기타 핸들링 ======================
client.once('ready', () => {
  console.log(` 로그인 완료: ${client.user.tag}`);
});

client.on('error', err => console.error("💥 Client error:", err));
client.on('shardError', err => console.error("💥 Shard error:", err));
process.on('unhandledRejection', err => console.error("💥 Unhandled rejection:", err));

client.login(TOKEN);
