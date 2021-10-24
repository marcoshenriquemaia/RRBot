import puppeteer from "puppeteer";
import getNumber from "../../utils/getNumber/index.js";

const Perks = async (ENV) => {
  const url = "https://rivalregions.com/#slide/profile";

  const browser = await puppeteer.launch({
    ignoreDefaultArgs: ["--disable-extensions"],
  });
  const page = await browser.newPage();
  await page.goto(url);
  await page.setCookie(
    {
      name: "rr",
      value: ENV.rr,
    },
    {
      name: "rr_f",
      value: ENV.rr_f,
    },
    {
      name: "rr_id",
      value: ENV.rr_id,
    },
    {
      name: "rr_add",
      value: ENV.rr_add,
    }
  );

  await page.cookies(url);
  await page.reload();
  const info = await page.evaluate(async () => {
    const getSettings = () => {
      return new Promise((resolve) => {
        const recursive = () => {
          const $textArea = document.querySelector(".prof_h #message");

          if (!$textArea) return setTimeout(recursive, 100);

          resolve($textArea.textContent);
        };

        recursive();
      });
    };

    const data = await getSettings();

    const splitedData = data.split(":");

    if (splitedData.length < 3) return "textArea not found";

    return {
      perk: splitedData[0],
      max: Number(splitedData[1]),
      type: splitedData[2],
    };
  });

  if (!info)
    return console.error(
      'Informações mal formatadas ou não preenchidas em "Sobre mim"'
    );

  await page.goto("https://rivalregions.com/#overview");
  await page.reload();
  await page.exposeFunction("getNumber", getNumber);

  const up = await page.evaluate((info) => {
    const perkSequence = ["F", "E", "R"];

    const getInfos = () => {
      return new Promise((resolve) => {
        const recursive = async () => {
          const $itemList = document.querySelectorAll(
            "#index_perks_list .perk_item.pointer.ib_border"
          );
          const $container = document.querySelector("#index_perks_list");

          if (!$itemList[0]) return setTimeout(recursive, 100);

          const itemPosition = perkSequence.indexOf(info.perk);
          const $item = $itemList[itemPosition];
          const $hasTimer = $container.querySelector(".no_imp.hasCountdown");

          if ($hasTimer) return resolve("has timer");

          if (!$item) return setTimeout(recursive, 100);

          console.log($item);

          const $currentPerkLevel = $item.querySelector(".yellow");
          const currentPerkLevel = await getNumber(
            $currentPerkLevel?.textContent
          );

          if (currentPerkLevel >= info.max) return resolve(false);

          $currentPerkLevel.click();

          if (info.type === "$") {
            setTimeout(() => {
              const $buttonWrapper = document.querySelectorAll(
                "#perk_target #perk_target_4 > div"
              )[0];
              const $button = $buttonWrapper.querySelector(".button_blue");

              if (!$button) return setTimeout(recursive, 100);

              $button.click();
              return resolve("Perk adicionado com dolar");
            }, 5000);
          } else if (info.type === "G") {
            setTimeout(() => {
              const $buttonWrapper = document.querySelectorAll(
                "#perk_target #perk_target_4 > div"
              )[1];
              const $button = $buttonWrapper.querySelector(".button_blue");

              if (!$button) return setTimeout(recursive, 100);

              $button.click();
              return resolve("Perk adicionado com gold");
            }, 5000);
          }

          resolve("Perk adicionado");
        };

        recursive();
      });
    };

    return getInfos();
  }, info);

  console.log(up);

  setTimeout(() => browser.close(), 3000);
};

export default Perks;
