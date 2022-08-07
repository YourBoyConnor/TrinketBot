const { PermissionsBitField } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { createAudioPlayer, createAudioResource, joinVoiceChannel, AudioPlayerStatus } = require('@discordjs/voice');
const { join } = require('node:path');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('sus')
    .setDescription('I\'m feeling like imposter...')
    .addUserOption(option =>
		    option.setName('user')
			     .setDescription('The bot will join this user\'s channel to play. If this is blank, it defaults to your channel.')
			     .setRequired(false))
    .addStringOption(option =>
        option.setName('specific_sound')
           .setDescription('The sound you want to play. Enter \"sounds\" to list sounds. If blank, play a random one.')
           .setRequired(false)),

  async execute (client, interaction) {

    const soundOption = interaction.options.getString('specific_sound');
    let isSpecific = false;

    if (soundOption != undefined) {
      isSpecific = true;
    }

    if (soundOption === 'sounds') {
      let sounds = [];
      const fs = require('fs');
      const commandFiles = fs.readdirSync('./Commands/Audio/Sus').filter(file => file.endsWith('.mp3'));

      for (const file of commandFiles) {
        sounds.push(file.substring(0, file.length - 4));
      }

      let soundString = '**Available Sounds:**\n' + sounds.toString().replaceAll(',', '\n');

      return interaction.reply(soundString);
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
      let path = `Audio/Sus/${soundOption}.mp3`;
      resources.push(createAudioResource(join(__dirname, path)));
    } else {
      const fs = require('fs');
      const commandFiles = fs.readdirSync('./Commands/Audio/Sus').filter(file => file.endsWith('.mp3'));

      for (const file of commandFiles) {
        let path = `Audio/Sus/${file}`;
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
      return interaction.reply(`**<@${memberOption.id}> is feeling like imposter...**`)
    } else {
      return interaction.reply(`**I\'m feeling like imposter...**`)
    }
  },
};
