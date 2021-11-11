import puppeteer from "puppeteer";
import getNumber from "../../utils/getNumber/index.js";

const Perks = async (ENV) => {
  const url = "https://rivalregions.com/#slide/profile";
  
  const browser = await puppeteer.launch({
    // headless: false,
  });
  try {
    const page = await browser.newPage();
    console.log("antes do goTo");
    await page.goto(url);
    console.log("antes do cookie");
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

    setTimeout(() => browser.close(), 60000 * 2);

    console.log("antes do close cookie url");
    await page.cookies(url);
    console.log("antes do close reload");
    await page.reload();
    console.log("antes do wait for selector");

    await page.waitForSelector(".prof_h #message", {
      timeout: 30000,
    });

    const info = await page.evaluate(async () => {
      let attempts = 0;

      const getSettings = () => {
        return new Promise((resolve) => {
          const recursive = () => {
            const $textArea = document.querySelector(".prof_h #message");

            if (attempts === 20) return resolve("Token expired");

            if (!$textArea) {
              setTimeout(recursive, 100);
              attempts++;
              return;
            }

            resolve($textArea.textContent);
          };

          recursive();
        });
      };

      const data = await getSettings();

      if (data === "Token expired") return "Token expired";

      const splitedData = data.split(":");

      if (splitedData.length < 3) return "textArea not found";

      return {
        perk: splitedData[0],
        max: Number(splitedData[1]),
        type: splitedData[2],
      };
    });

    console.log(info);

    if (info === "Token expired") {
      browser.close();
      return console.error(info);
    }

    if (!info) {
      browser.close();
      return console.error(
        'Informações mal formatadas ou não preenchidas em "Sobre mim"'
      );
    }

    await page.goto("https://rivalregions.com/#overview");
    await page.reload();
    await page.exposeFunction("getNumber", getNumber);
    await page.waitForSelector(
      "#index_perks_list .perk_item.pointer.ib_border"
    );

    const up = await page.evaluate((info) => {
      let attempts = 0;

      const perkSequence = ["F", "E", "R"];

      const getInfos = () => {
        return new Promise((resolve) => {
          if (attempts === 20) return resolve("Token expired");

          const recursive = async () => {
            const $itemList = document.querySelectorAll(
              "#index_perks_list .perk_item.pointer.ib_border"
            );
            const $container = document.querySelector("#index_perks_list");

            const itemPosition = perkSequence.indexOf(info.perk);
            const $item = $itemList[itemPosition];
            const $hasTimer = $container.querySelector(".no_imp.hasCountdown");

            if ($hasTimer) {
              const splitedHour = $hasTimer.textContent.split(":");
              const hasHour = splitedHour.length === 3;

              const milliseconds = hasHour
                ? Number(splitedHour[2]) * 1000 +
                  Number(splitedHour[1]) * 60000 +
                  Number(splitedHour[0]) * 36000000
                : Number(splitedHour[1]) * 1000 +
                  Number(splitedHour[0]) * 60000;

              return resolve(milliseconds);
            }

            if (!$item) {
              setTimeout(recursive, 100);
              return attempts++;
            }

            const $currentPerkLevel = $item.querySelector(".yellow");
            const currentPerkLevel = await getNumber(
              $currentPerkLevel?.textContent
            );

            if (currentPerkLevel >= info.max) return resolve(false);

            $currentPerkLevel.click();

            if (info.type === "$") {
              const $buttonWrapper = document.querySelectorAll(
                "#perk_target #perk_target_4 > div"
              )[0];
              const $button = $buttonWrapper.querySelector(".button_blue");

              if (!$button) return setTimeout(recursive, 100);

              $button.click();
              return resolve(10000);
            } else if (info.type === "G") {
              const $buttonWrapper = document.querySelectorAll(
                "#perk_target #perk_target_4 > div"
              )[1];
              const $button = $buttonWrapper.querySelector(".button_blue");

              if (!$button) return setTimeout(recursive, 100);

              $button.click();
              return resolve(10000);
            }

            resolve("Perk adicionado");
          };

          recursive();
        });
      };

      return getInfos();
    }, info);

    console.log(up);

    setTimeout(() => browser.close(), 5000);

    return up;
  } catch (error) {
    browser.close()
    console.log(error.message)
    return 'Error'
  }
};

export default Perks;
