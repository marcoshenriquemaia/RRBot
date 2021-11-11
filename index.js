import dotenv from "dotenv";
import { Telegraf, Markup } from "telegraf";
import Perks from "./auto/perks/index.js";
import fs from "fs";

const config = JSON.parse(fs.readFileSync("config.json"));

let nextUp = 0;

let log = "Sem Log";

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
  content.reply(`const RRBotGetAuth = () => {
    const storageKeyList = ['rr', 'rr_f', 'rr_id', 'rr_add']
  
    const readCookie = (name) => {
      const nameEQ = name + "=";
      const ca = document.cookie.split(';');
      for(let i=0; i < ca.length;i++) {
          let c = ca[i];
          while (c.charAt(0)==' ') c = c.substring(1,c.length);
          if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
      }
      return null;
    }
  
    function fallbackCopyTextToClipboard(text) {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      
      // Avoid scrolling to bottom
      textArea.style.top = "0";
      textArea.style.left = "0";
      textArea.style.position = "fixed";
    
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
    
      try {
        const successful = document.execCommand('copy');
        const msg = successful ? 'successful' : 'unsuccessful';
        console.log('Copying text command was ' + msg + 'know, just paste to @RRTeslaBot');
      } catch (err) {
        console.error('Fallback: Oops, unable to copy', err);
      }
    
      document.body.removeChild(textArea);
    }
  
    const object = storageKeyList.reduce((acc, key) => ({ ...acc, [key]: readCookie(key) }) ,{})
  
    fallbackCopyTextToClipboard(JSON.stringify(object))
  }
  
  RRBotGetAuth()
  
  
  `);
};

const buttonList = [
  // {
  //   name: "Change perk",
  //   action: "perk",
  // },
  // {
  //   name: "Change perk max",
  //   action: "max",
  // },
  // {
  //   name: "Change perk payment type",
  //   action: "type",
  // },
  {
    name: "Update authentication",
    action: "update_auth",
  },
  {
    name: "Log",
    action: "log",
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

  if (message.includes(`"rr":`)) {
    const formatedAuthConfig = JSON.parse(message);

    fs.writeFileSync(
      "config.json",
      JSON.stringify({ ...config, ...formatedAuthConfig }),
      console.log
    );
    return content.reply("Auth");
  }
  return content.reply("Something wrong");
});

bot.action("perk", perk);
bot.action("max", max);
bot.action("type", type);
bot.action("update_auth", authConfig);
bot.action("log", (content) => {
  content.reply(log);
});

bot.startPolling();

const ENV = config;

const run = async () => {
  console.log('Running')
  const date = new Date();
  const currentMilli = date.getTime();
  if (currentMilli > nextUp || !nextUp) {
    const newNextUp = await Perks(ENV);

    if (newNextUp === "Error") {
      console.log("error");
      log = `Error: ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
      setTimeout(run, 5000);
      return 
    }

    nextUp = currentMilli + newNextUp + 40000;

    if (nextUp) {
      log = `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
    }
  }
  setTimeout(run, 5000);
};

run();
