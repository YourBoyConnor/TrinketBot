const { PermissionsBitField } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { createAudioPlayer, createAudioResource, joinVoiceChannel, AudioPlayerStatus } = require('@discordjs/voice');
const { join } = require('node:path');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('finger')
    .setDescription('Walter, put your dick away, Walter. I\'m not having sex with you right now, Walter.')
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
    let voiceChannel = memberOption.voice.channel;

    if (isMention) {
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

    const resource = createAudioResource(join(__dirname, 'Audio/finger.mp3'));

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
      return interaction.reply(`**<@${memberOption.id}>, put your dick away, <@${memberOption.id}>. I\'m not having sex with you right now, <@${memberOption.id}>.**`)
    } else {
      return interaction.reply(`**Walter, put your dick away, Walter. I'm not having sex with you right now, Walter.**`)
    }
  },
};
