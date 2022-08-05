require("dotenv").config();
const { Client, Collection, GatewayIntentBits } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates] });
const mySecret = process.env['BOT_TOKEN'];

client.slashCommands = new Collection();
client.on('ready', async () => {
 var memberCount = client.guilds.cache.reduce((x, y) => x + y.memberCount, 0);
 console.log(`TrinketBot has started, with ${memberCount} users, in ${client.channels.cache.size} channels of ${client.guilds.cache.size} guilds.`);
 client.user.setActivity("with Trinkets", { type: "PLAYING" });
})

const readSlashCommands = () => {
  let command = require(`./trinkets`);
  console.log("Successfully loaded " + command.data.name)
  client.slashCommands.set(command.data.name, command);
}

readSlashCommands();

client.on('interactionCreate', async (interaction) => {
if (!interaction.isCommand())
    return;
const command = client.slashCommands.get(interaction.commandName);
if (!command)
    return;
  try {
      command.execute(client, interaction);
  } catch (error) {
      console.error(error);
      return interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
  }
})

client.login(mySecret);
