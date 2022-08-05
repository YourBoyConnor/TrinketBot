const { PermissionsBitField } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { getVoiceConnection } = require('@discordjs/voice');
const { join } = require('node:path');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('leave')
    .setDescription('Makes the bot leave the channel.'),
  async execute (client, interaction) {

    const voiceChannel = interaction.member.voice.channel;

    if (!voiceChannel) return interaction.reply("You need to be in a VC to use this command!");

    if (!interaction.guild.members.me.permissions.has(PermissionsBitField.Flags.Connect)) return interaction.reply("I am not allowed to connect to VC!");

    if (!interaction.guild.members.me.permissions.has(PermissionsBitField.Flags.Speak)) return interaction.reply("I am not allowed to speak in VC!");

    //const userConnection =
    const connection = getVoiceConnection(interaction.member.voice.channel.guild.id);

    if (connection) {
      connection.destroy();
      return interaction.reply('**I have left the VC.**')
    } else {
      return interaction.reply('**I am not currently in the VC!**')
    }

  },
};
