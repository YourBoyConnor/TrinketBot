const { PermissionsBitField } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { createAudioPlayer, createAudioResource, joinVoiceChannel, AudioPlayerStatus } = require('@discordjs/voice');
const { join } = require('node:path');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('venom')
    .setDescription('I got a song filled with shit for the strong willed...')
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

    const resource = createAudioResource(join(__dirname, 'Audio/venom.mp3'));

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
      return interaction.reply(`**WHEN THE WORLD GIVES <@${memberOption.id}>**`)
    } else {
      return interaction.reply(`**WHEN THE WORLD GIVES YOU A RAW DEAL**`)
    }
  },
};
