import dotenv from "dotenv";
import Perks from "./auto/perks/index.js";

dotenv.config();
const ENV = {
  rr: process.env.rr,
  rr_f: process.env.rr_f,
  rr_id: process.env.rr_id,
  rr_add: process.env.rr_add,
}


const run = () => {
  Perks(ENV)
  setTimeout(run, 60000)
};

run()

console.log('INICIOU!', ENV)