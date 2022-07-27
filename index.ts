import fs from "fs";
import Bundlr from "@bundlr-network/client";
import * as readline from "node:readline";
import { stdin, stdout } from "process";

const privateKey: string = fs.readFileSync("./privateKeyChar.txt", {
  encoding: "utf-8",
  flag: "r",
});
const dataPath: string = "./data/data1.txt"; // please include file extentions
const dataSizeBytes: number = fs.statSync(dataPath).size;
console.log(
  `Private key: ${privateKey}\nData path: ${dataPath}\nData size: ${dataSizeBytes} bytes`
);

const bundlr = new Bundlr(
  "https://devnet.bundlr.network",
  "solana",
  privateKey,
  { providerUrl: "https://api.devnet.solana.com" }
);

async function upload() {
  const uploadPriceAtomicUnits: number = (
    await bundlr.getPrice(dataSizeBytes)
  ).toNumber();
  const uploadPriceSolana: number = bundlr.utils
    .unitConverter(uploadPriceAtomicUnits)
    .toNumber();
  console.log(`Upload price (SOL): ${uploadPriceSolana}`);

  const rl = readline.createInterface({ input: stdin, output: stdout });
  rl.question(
    "Do you want to proceed with funding and upload? (Y/N)\n",
    (res: string) => {
      res = res.toLowerCase();
      if (res === "y") {
        async function uploadFile() {
          try {
            console.warn(
              "Do not close the program or else you will loose your SOL."
            );

            console.log("Funding node...");
            await bundlr.fund(uploadPriceAtomicUnits);

            console.log("Uploading to arweave...");
            const uploadFileID: string = (await bundlr.uploadFile(dataPath))
              .data.id;

            console.log(`https://www.arweave.net/${uploadFileID}`);
            process.exit(0);
          } catch (err) {
            console.error(err);
            process.exit(1);
          }
        }
        uploadFile();
      } else {
        console.error("Exiting....");
        process.exit(0);
      }
    }
  );
}
upload();