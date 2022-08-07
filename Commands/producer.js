const { PermissionsBitField } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { createAudioPlayer, createAudioResource, joinVoiceChannel, AudioPlayerStatus } = require('@discordjs/voice');
const { join } = require('node:path');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('producer')
    .setDescription('Oh lord...')
    .addUserOption(option =>
		    option.setName('user')
			     .setDescription('The bot will join this user\'s channel to play. If this is blank, it defaults to your channel.')
			     .setRequired(false))
    .addStringOption(option =>
       	option.setName('specific_producer')
       		.setDescription('The producer tag you want to play. Enter \"producers\" to list producers. If blank, play a random one.')
       		.setRequired(false)),

  async execute (client, interaction) {

    const producerOption = interaction.options.getString('specific_producer');
    let isSpecific = false;

    if (producerOption != undefined) {
      isSpecific = true;
    }

    if (producerOption === 'producers') {
      let producers = [];
      const fs = require('fs');
      const commandFiles = fs.readdirSync('./Commands/Audio/Producers').filter(file => file.endsWith('.mp3'));

      for (const file of commandFiles) {
        producers.push(file.substring(0, file.length - 4));
      }

      let producerString = '**Available Producers:**\n' + producers.toString().replaceAll(',', '\n');

      return interaction.reply(producerString);
    }

    const memberOption = interaction.options.getMember('user');
    let isMention = false;

    if (memberOption != undefined) {
      isMention = true;
    }

    const player = createAudioPlayer();
    let voiceChannel;

    if (isMention) {
      voiceChannel = memberOption.voice.channel;
      if (!voiceChannel) {
        return interaction.reply("They need to be in a VC to use this command!");
      }
    } else {
      voiceChannel = interaction.member.voice.channel;
      if (!voiceChannel) {
        return interaction.reply("You need to be in a VC to use this command!");
      }
    }

    if (!interaction.guild.members.me.permissions.has(PermissionsBitField.Flags.Connect)) return interaction.reply("I am not allowed to connect to VC!");

    if (!interaction.guild.members.me.permissions.has(PermissionsBitField.Flags.Speak)) return interaction.reply("I am not allowed to speak in VC!");

    const resources = [];

    if (isSpecific) {
      let path = `Audio/Producers/${producerOption}.mp3`;
      resources.push(createAudioResource(join(__dirname, path)));
    } else {
      const fs = require('fs');
      const commandFiles = fs.readdirSync('./Commands/Audio/Producers').filter(file => file.endsWith('.mp3'));

      for (const file of commandFiles) {
        let path = `Audio/Producers/${file}`;
        resources.push(createAudioResource(join(__dirname, path)));
      }
    }

    const resource = resources[Math.floor(Math.random() * resources.length)];

    player.on(AudioPlayerStatus.Playing, () => {
      console.log('The Audio Player is now playing')
    });

    player.on('error', err => {
      console.log('Error: ${error.message}');
    });

    let connection;
    if (isMention) {
      connection = joinVoiceChannel({
         channelId: memberOption.voice.channel.id,
         guildId: interaction.guild.id,
         adapterCreator: interaction.guild.voiceAdapterCreator,
      });
    } else {
      connection = joinVoiceChannel({
         channelId: interaction.member.voice.channel.id,
         guildId: interaction.guild.id,
         adapterCreator: interaction.guild.voiceAdapterCreator,
      });
    }
    const subscription = connection.subscribe(player);
    player.play(resource);

    player.on(AudioPlayerStatus.Idle, () => {
    	connection.destroy();
    });

    if (isMention) {
      return interaction.reply(`**<@${memberOption.id}> ON THE BEAT HOE**`)
    } else {
      return interaction.reply(`**MUSTARD  ON THE BEAT HOE**`)
    }
  },
};
