async function main() {
    let price = ethers.utils.parseUnits("3", 9);
    let cheese = "0xBbD83eF0c9D347C85e60F1b5D2c58796dBE1bA0d";
    const [deployer] = await ethers.getSigners();
    const Minter = await ethers.getContractFactory("Minter");
    let minter = await Minter.deploy("Test", "TST", "0xd9412032d40Af059244d8853A49ebc1990dEcE01");
    console.log("Deploying contracts with the account:", deployer.address);
    await minter.addNFT(1, 999999999999999, price, "cat", cheese, 3000);
    await minter.addNFT(1, 999999999999999, price, "mousetrap", cheese, 10000);
    await minter.adminMint(1, 1);
  }
  
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });