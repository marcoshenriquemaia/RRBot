import dotenv from "dotenv";
import { Telegraf, Markup } from "telegraf";
import Perks from "./auto/perks/index.js";
import fs from "fs";

const config = JSON.parse(fs.readFileSync('config.json'))

dotenv.config();

const perk = (content) => {
  const perkButtonOption = [
    {
      name: "Strength",
      action: "Select Strength",
    },
    {
      name: "Education",
      action: "Select Education",
    },
    {
      name: "Resistance",
      action: "Select Resistance",
    },
  ];

  const buttons = () =>
    Markup.inlineKeyboard(
      perkButtonOption.map((item) =>
        Markup.button.callback(item.name, item.action)
      )
    );

  content.reply(`Tel me what perk you want:`, buttons());
};

const max = () => {};

const type = () => {};

const authConfig = (content) => {
  content.reply(`Send me the new authentications in the following format, replacing the example values:
  
rr = 3a0078b7cf609015fd9d239252157cfa3
rr_f = 3a0078b7cf60r015fd9d23925277cfa3
rr_id = 198761554754123
rr_add = e3afngkedawew47f455ca4522f605df447
  `);
};

const buttonList = [
  {
    name: "Change perk",
    action: "perk",
  },
  {
    name: "Change perk max",
    action: "max",
  },
  {
    name: "Change perk payment type",
    action: "type",
  },
  {
    name: "Update authentication",
    action: "update_auth",
  },
];

const bot = new Telegraf(process.env.BOT_TOKEN);

const buttons = () =>
  Markup.inlineKeyboard(
    buttonList.map((item) => Markup.button.callback(item.name, item.action))
  );

bot.start(async (content) => {
  const from = content.update.message.from;

  await content.reply("Welcome to RRBot, created by Nikola Tesla");
  await content.reply("What do you want to do?", buttons());
});

bot.on("text", (content) => {
  const message = content.update.message.text;

  if (message[0] === "/")
    return content.reply(
      `I didn't find this command. Send /start to talk with me`
    );

  if (message.includes("rr =")) {
    const formatedAuthConfig = message.split(/\r?\n/).reduce((acc, item) => {
      const splitedItem = item.split(' = ')
      const key = splitedItem[0]
      const value = splitedItem[1]

      return { ...acc, [key]: value }
    }, {})

    fs.writeFileSync(
      "config.json",
      JSON.stringify({...config, ...formatedAuthConfig}),
      console.log
    );
    return content.reply("Auth");
  }
  return content.reply('Something wrong')
});

bot.action("perk", perk);
bot.action("max", max);
bot.action("type", type);
bot.action("update_auth", authConfig);

bot.startPolling();

const ENV = config;

const run = () => {
  try {
    Perks(ENV);
    setTimeout(run, 60000 * 5);
  } catch (err) {
    Perks(ENV);
    setTimeout(run, 60000 * 5);
  }
};

run();
