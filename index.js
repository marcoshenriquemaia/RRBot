import dotenv from "dotenv";
import Perks from "./auto/perks/index.js";

dotenv.config();

const run = () => {
  const ENV = {
    rr: process.env.rr,
    rr_f: process.env.rr_f,
    rr_id: process.env.rr_id,
    rr_add: process.env.rr_add,
  }

  Perks(ENV)
  setTimeout(run, 30000)
};

run()

console.log('INICIOU!')