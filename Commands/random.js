const { PermissionsBitField } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { createAudioPlayer, createAudioResource, joinVoiceChannel, AudioPlayerStatus } = require('@discordjs/voice');
const { join } = require('node:path');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('random')
    .setDescription('Performs a random command!')
    .addUserOption(option =>
		    option.setName('user')
			     .setDescription('The bot will join this user\'s channel to play. If this is blank, it defaults to your channel.')
			     .setRequired(false)),

  async execute (client, interaction) {

    const fs = require('fs');
    const commands = [];
    const commandFiles = fs.readdirSync('./Commands').filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
    	const command = file.toString().substring(0, file.toString().length - 3);
    	commands.push(command);
    }

    const finalCommand = commands[Math.floor(Math.random() * commands.length)];

    const command = client.slashCommands.get(finalCommand);
    if (!command)
        return;
    try {
        command.execute(client, interaction);
    } catch (error) {
        console.error(error);
        return interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }
  },
};
