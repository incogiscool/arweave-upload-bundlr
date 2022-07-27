const fs = require("fs");
const Bundlr = require("@bundlr-network/client");

const privateKey = fs.readFileSync("./privateKeyChar.txt", {
  encoding: "utf-8",
  flag: "r",
});

const dataPath = "./data/data1.txt"; // Make sure to include file extentions
const dataStats = fs.statSync(dataPath);
const dataSize = dataStats.size;

const bundlr = new Bundlr.default(
  "https://devnet.bundlr.network",
  "solana",
  privateKey,
  {
    providerUrl: "https://api.devnet.solana.com",
  }
);

const upload = async () => {
  console.warn("Do not exit or else you will loose your SOL.");

  console.log("Data size (bytes): " + dataSize);

  const uploadPriceAtomicUnits = await bundlr.getPrice(dataSize);
  const uploadPriceSOL = bundlr.utils.unitConverter(uploadPriceAtomicUnits);

  console.log("Upload price (SOL): " + uploadPriceSOL);
  console.log("Upload price (Atomic Units): " + uploadPriceAtomicUnits);

  console.log("Funding...");
  await bundlr.fund(uploadPriceAtomicUnits);

  let uploadFile = await bundlr.uploadFile(dataPath);
  const uploadedFileID = uploadFile.data.id;

  // let uploadFolder = await bundlr.uploader.uploadFolder(dataPath);
  // let uploadedFileID = uploadFolder;
  // NOTE - UPLOAD FOLDER DOES NOT CALCULATE FOR ALL ITEMS WHEN FUNDING, YOU NEED TO CALCULATE EACH ITEM THEN ADD THEM UP

  console.log(`https://www.arweave.net/${uploadedFileID}`);
};

const getLoadedAddressBalance = async () => {
  const balance = await bundlr.getLoadedBalance();
  const convertedBalance = bundlr.utils.unitConverter(balance).toNumber();
  console.log("Loaded address balance (SOL): " + convertedBalance);
  console.log("Loaded address balance (Atomic Units): " + balance);
};

getLoadedAddressBalance();
upload();