require("dotenv").config();
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const commands = [];
const mySecret = process.env['BOT_TOKEN'];

const deploySlashCommands = async () => {
   const rest = new REST({ version: '9' }).setToken(mySecret);
   const applicationId = '1003138443506884708'

   const fs = require('fs');
   const dir = 'Commands';

   fs.readdir(dir, (err, files) => {
     files.forEach(file => {
       if (!file.toString().endsWith('.js')) return;

       let fileName = file.toString().substring(0, file.toString().length - 3);
       let filePath = './Commands/' + fileName;
       let command = require(filePath);
       commands.push(command.data.toJSON());
     });
   });

   rest.put(Routes.applicationCommands(applicationId), { body: commands })
   .then(() => console.log('Successfully registered application commands.'))
   .catch(console.error);
}

deploySlashCommands();
