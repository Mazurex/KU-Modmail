const {
  Client,
  GatewayIntentBits,
  REST,
  Routes,
  Collection,
} = require("discord.js");
const path = require("path");
const fs = require("fs");
const mongoose = require("mongoose");
const Stats = require("./models/stats");

const eventsDir = path.join(__dirname, "events");
const commandsDir = path.join(__dirname, "commands");
const eventFolders = fs.readdirSync(eventsDir);
require("dotenv").config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent,
  ],
});

(async () => {
  console.log("Connecting to DB");

  try {
    await mongoose.connect(process.env.uri);

    console.log("Connected to the database!");
  } catch (error) {
    console.error(`Error with the database connection: ${error}`);
  }
})();

const readCommands = (dir) => {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      readCommands(path);
    } else if (file.endsWith(".js")) {
      const command = require(filePath);
      if ("data" in command && "execute" in command) {
        client.commands.set(command.data.name, command);
        console.log(`Registered command "${command.data.name}"`);
      } else {
        console.log(
          `Command "${file}" is missing a required "data" or "execute" property`
        );
      }
    }
  }
};

client.commands = new Collection();
readCommands(commandsDir);

const commands = Array.from(client.commands.values()).map(
  (command) => command.data
);

console.log(`Loaded ${commands.length} commands.`);

const eventHandler = (eventDir, eventName) => {
  const eventFiles = fs
    .readdirSync(eventDir)
    .filter((file) => file.endsWith(".js"));

  for (const file of eventFiles) {
    try {
      const handler = require(path.join(eventDir, file));

      client.on(eventName, (...args) => {
        try {
          handler(client, ...args);
        } catch (error) {
          console.error(error);
        }
      });
    } catch (error) {
      console.error(error);
    }
  }
};

for (const folder of eventFolders) {
  const eventDir = path.join(eventsDir, folder);
  if (fs.lstatSync(eventDir).isDirectory()) {
    eventHandler(eventDir, folder);
  }
}

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);

  if (!command) {
    return console.error(
      `No command matching ${interaction.commandName} was found`
    );
  }

  try {
    await command.execute(interaction, client);

    console.log(
      `${interaction.user.username} has used the ${interaction.commandName} command`
    );

    const stats = await Stats.findOne();
    if (!stats) {
      console.log("Stats database not found!");
    } else {
      stats.commands_executed_last_startup += 1;
      stats.total_commands += 1;
      await stats.save();
    }
  } catch (error) {
    console.error(error);

    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({
        content: "There was an issue with executing this command!",
      });
    }
  }
});

client.once("ready", () => {
  const rest = new REST({ version: "10" }).setToken(process.env.token);

  rest
    .put(Routes.applicationCommands(process.env.client_id), {
      body: commands,
    })
    .then(() => {
      if (commands.length === 0) {
        console.log("No commands found. Skipping registration.");
      } else {
        console.log(`Successfully registered ${commands.length} command(s).`);
      }
    })
    .catch((error) => {
      console.error(error);
    });
});

client.login(process.env.token);
