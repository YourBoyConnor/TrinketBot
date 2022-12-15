const { PermissionsBitField } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { createAudioPlayer, createAudioResource, joinVoiceChannel, AudioPlayerStatus } = require('@discordjs/voice');
const { join } = require('node:path');
const ytdl = require('ytdl-core');
const search = require('youtube-search');
require("dotenv").config();

var opts = {
  maxResults: 1,
  key: process.env.API_KEY
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('play')
    .setDescription('Play from YouTube given a link or a search term.')
    .addStringOption(option =>
      option.setName('args')
        .setDescription('The search term or link you would like to play.')
        .setRequired(true))
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The bot will join this user\'s channel to play. If this is blank, it defaults to your channel.')
        .setRequired(false)),

  async execute(client, interaction) {

    const memberOption = interaction.options.getMember('user');
    const argsOption = interaction.options.getString('args');
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

    if (!argsOption.startsWith("http")) {
      search(argsOption, opts, function (err, results) {
        argsOption = results.url;
      });
    }
    const stream = ytdl(argsOption);
    const resource = createAudioResource(stream.stream, {
      inputType: stream.type
    });

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
      return interaction.reply(`**Playing for <@${memberOption.id}>!**`)
    } else {
      return interaction.reply(`**Playing!**`)
    }
  },
};
