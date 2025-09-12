const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder } = require('discord.js');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

const TOKEN = "MTQxNjExNTE2MjQ1NjI2MDYwOA.Gr3yyB.GC2KscPfGKYU6GSvp_LOtxIFnYWMWJNq8b1IO8";          // Developer Portal에서 발급받은 토큰
const CLIENT_ID = "1416115162456260608";  // Developer Portal → General Information
const GUILD_ID = "928485420487036979";    // 테스트할 디스코드 서버 ID

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

client.login(TOKEN);
