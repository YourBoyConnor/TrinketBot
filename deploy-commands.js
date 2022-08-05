require("dotenv").config();
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const commands = [];
const mySecret = process.env['BOT_TOKEN'];

const deploySlashCommands = async () => {
   const rest = new REST({ version: '9' }).setToken(mySecret);
   const applicationId = '1003138443506884708'
   const command = require('./trinkets');

   commands.push(command.data.toJSON());

   rest.put(Routes.applicationCommands(applicationId), { body: commands })
   .then(() => console.log('Successfully registered application commands.'))
   .catch(console.error);
}

deploySlashCommands();
