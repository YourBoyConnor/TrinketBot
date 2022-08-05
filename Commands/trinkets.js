const { PermissionsBitField } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { createAudioPlayer, createAudioResource, joinVoiceChannel, AudioPlayerStatus } = require('@discordjs/voice');
const { join } = require('node:path');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('trinkets')
    .setDescription('Trinkets. I love giving Trinkets to friends and family! Trinkets')
    .addUserOption(option =>
		    option.setName('user')
			     .setDescription('The bot will join this user\'s channel to play. If this is blank, it defaults to your channel.')
			     .setRequired(false)),

  async execute (client, interaction) {

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

    const resource = createAudioResource(join(__dirname, 'Audio/trinkets.mp3'));

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
      return interaction.reply(`'Trinkets. I love giving Trinkets to <@${memberOption.id}> and family! Trinkets'**`)
    } else {
      return interaction.reply(`**'Trinkets. I love giving Trinkets to friends and family! Trinkets'**`)
    }
  },
};
