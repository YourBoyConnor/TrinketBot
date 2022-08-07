require("dotenv").config();
const { Client, Collection, GatewayIntentBits } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates, GatewayIntentBits.GuildPresences] });
const mySecret = process.env['BOT_TOKEN'];
const { createAudioPlayer, createAudioResource, joinVoiceChannel, AudioPlayerStatus } = require('@discordjs/voice');
const { join } = require('node:path');

client.slashCommands = new Collection();
client.on('ready', async () => {
 var memberCount = client.guilds.cache.reduce((x, y) => x + y.memberCount, 0);
 console.log(`TrinketBot has started, with ${memberCount} users, in ${client.channels.cache.size} channels of ${client.guilds.cache.size} guilds.`);
 client.user.setActivity( { name: 'with trinkets', type: 0 } );
})

const readSlashCommands = () => {

  const fs = require('fs');
  const commands = [];
  const commandFiles = fs.readdirSync('./Commands').filter(file => file.endsWith('.js'));

  for (const file of commandFiles) {
    const command = require(`./Commands/${file}`);
    console.log("Successfully loaded " + command.data.name)
    client.slashCommands.set(command.data.name, command);
  }
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

client.on('voiceStateUpdate', async (oldVoiceState, newVoiceState) => {
  const player = createAudioPlayer();
  const voiceChannel = newVoiceState.channelId;
  const botConnection = newVoiceState.member.user.bot;
  let memberStatus = "EMPTY";
  if (newVoiceState.member.presence.activities.length != 0) {
    memberStatus = newVoiceState.member.presence.activities[0].state;
  }

  const fs = require('fs');
  const commandFiles = fs.readdirSync('./Commands/Audio/Producers').filter(file => file.endsWith('.mp3'));

  let triggerString = 'random';

  let memberStatusMatch = false;

  if (memberStatus == null) {
    memberStatusMatch = false;
  }
  else if (memberStatus.toUpperCase() === 'RANDOM') {
    memberStatusMatch = true;
  } else {
    for (const file of commandFiles) {
      let fileString = file.substring(0, file.length - 4);
      if (memberStatus.toUpperCase() == fileString.toUpperCase()) {
        memberStatusMatch = true;
        triggerString = fileString;
        break;
      }
    }
  }

  if (newVoiceState.deaf || botConnection || !memberStatusMatch) return;

  try {
    const resources = [];

    const fs = require('fs');
    const commandFiles = fs.readdirSync('./Commands/Audio/Producers').filter(file => file.endsWith('.mp3'));

    for (const file of commandFiles) {
      let path = `Commands/Audio/Producers/${file}`;
      resources.push(createAudioResource(join(__dirname, path)));
    }

    let resource = null;

    if (triggerString !== 'random') {
      let path = `Commands/Audio/Producers/${triggerString}.mp3`;
      resource = createAudioResource(join(__dirname, path));
    } else {
      resource = resources[Math.floor(Math.random() * resources.length)];
    }

    player.on(AudioPlayerStatus.Playing, () => {
      console.log('The Audio Player is now playing')
    });

    player.on('error', err => {
      console.log('Error: ${error.message}');
    });


    let connection = joinVoiceChannel({
       channelId: voiceChannel,
       guildId: newVoiceState.guild.id,
       adapterCreator: newVoiceState.guild.voiceAdapterCreator,
    });

    const subscription = connection.subscribe(player);
    player.play(resource);

    player.on(AudioPlayerStatus.Idle, () => {
    	connection.destroy();
    });

  } catch (error) {
      console.error(error);
  }
})

client.login(mySecret);
