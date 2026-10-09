import "dotenv/config";
import { syncWaga } from "../src/lib/crawler/sync";

syncWaga()
  .then((r) => {
    console.log("sync done:", r);
    process.exit(0);
  })
  .catch((e) => {
    console.error("sync failed:", e);
    process.exit(1);
  });
