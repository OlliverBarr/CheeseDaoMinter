require('dotenv').config();
async function main() {
  const [deployer] = await ethers.getSigners();
  let price = ethers.utils.parseUnits("3", 9);
  let cheese = "0xBbD83eF0c9D347C85e60F1b5D2c58796dBE1bA0d";
  const Minter = await ethers.getContractFactory("Minter");
  let minter = await Minter.deploy("Test", "TST", "0xd9412032d40Af059244d8853A49ebc1990dEcE01");
  var nonce = await deployer.provider.getTransactionCount(deployer.address);
    console.log("Deploying contracts with the account:", deployer.address);
    console.log("Deployed to", minter.address);
    await minter.addNFT(1, 9999999999999, price, process.env.TokenURI, cheese, 3000, {nonce : nonce++});
    await minter.addNFT(1, 9999999999999, price, "mousetrap", cheese, 10000, {nonce : nonce++});
    await minter.adminMint(0, 1, {nonce : nonce++});
  }
  
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });