const { PermissionsBitField } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { createAudioPlayer, createAudioResource, joinVoiceChannel, AudioPlayerStatus } = require('@discordjs/voice');
const { join } = require('node:path');
const play = require("play-dl");
const searchYoutube = require('youtube-api-v3-search');
require("dotenv").config();

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
    var argsOption = interaction.options.getString('args');
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
      const options = {
        q: argsOption,
        part: 'snippet',
        type: 'video'
      }
      await searchYoutube(process.env.API_KEY, options)
        .then(res => argsOption = `https://www.youtube.com/watch?v=${res.items[0].id.videoId}`);
    }
    const { stream } = await play.stream(argsOption, {
      discordPlayerCompatibility: true,
    });
    const resource = createAudioResource(stream);

    player.on(AudioPlayerStatus.Playing, () => {
      console.log('The Audio Player is now playing')
    });

    player.on('error', err => {
      console.log(`Error: ${err.message}`);
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
      return interaction.reply(`**Playing ${argsOption} for <@${memberOption.id}>!**`)
    } else {
      return interaction.reply(`**Playing ${argsOption} from YouTube!**`)
    }
  },
};
