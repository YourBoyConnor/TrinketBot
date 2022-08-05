const { PermissionsBitField } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { createAudioPlayer, createAudioResource, joinVoiceChannel, AudioPlayerStatus } = require('@discordjs/voice');
const { join } = require('node:path');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('finger')
    .setDescription('Walter, put your dick away, Walter. I\'m not having sex with you right now, Walter.'),
  async execute (client, interaction) {

    const player = createAudioPlayer();

    const voiceChannel = interaction.member.voice.channel;

    if (!voiceChannel) return interaction.reply("You need to be in a VC to use this command!");

    if (!interaction.guild.members.me.permissions.has(PermissionsBitField.Flags.Connect)) return interaction.reply("I am not allowed to connect to VC!");

    if (!interaction.guild.members.me.permissions.has(PermissionsBitField.Flags.Speak)) return interaction.reply("I am not allowed to speak in VC!");

    const resource = createAudioResource(join(__dirname, 'Audio/finger.mp3'));

    player.on(AudioPlayerStatus.Playing, () => {
      console.log('The Audio Player is now playing')
    });

    player.on('error', err => {
      console.log('Error: ${error.message}');
    });

    const connection = joinVoiceChannel({
       channelId: interaction.member.voice.channel.id,
       guildId: interaction.guild.id,
       adapterCreator: interaction.guild.voiceAdapterCreator,
    });

    const subscription = connection.subscribe(player);
    player.play(resource);

    player.on(AudioPlayerStatus.Idle, () => {
    	connection.destroy();
    });

    return interaction.reply('**Walter, put your dick away, Walter. I\'m not having sex with you right now, Walter.**')
  },
};
