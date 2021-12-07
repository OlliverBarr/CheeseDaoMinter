const { expect, assert } = require("chai");
const { ethers } = require("hardhat");
// const { Minter } = require("../typechain");

describe("CheezDAO Minter", function () {  
  let deployer;
  let minter;
  let user;
  let DAO;
  let mock;
  let initialBalance = ethers.utils.parseUnits("90003", 9);
  let price = ethers.utils.parseUnits("3", 9);
  beforeEach(async () => {
    [deployer, DAO, user] = await ethers.getSigners();

    const Mock = await ethers.getContractFactory("MockERC20");
    const Minter = await ethers.getContractFactory("Minter");
    mock = await Mock.deploy("Cheez", "CHZ", initialBalance, user.address);
    minter = await Minter.deploy("cat", "CAT", DAO.address);
    await minter.addNFT(1, 999999999999999, price, ":3", mock.address, 3000);
    await mock.connect(user).approve(minter.address, ethers.utils.parseUnits("1000",9));
  });
  describe("Buy", () => {
    it("Should be able to purchase an NFT, balance should decrease", async () => {
      await minter.connect(user).purchase(0,1);
      let balance = await mock.balanceOf(user.address);
      expect(balance).to.be.equal(initialBalance.sub(price));
      let NFTBalance = await minter.balanceOf(user.address, 0);
      expect(NFTBalance.toString()).to.be.equal("1");
    });

    it("Should not let you purchase more NFTs than supply exists", async () => {
      await minter.connect(user).purchase(0,3000);
      try { 
        await minter.connect(user).purchase(0,1);
      } catch(e) {
        assert(e.message.includes('Max supply reached'));
        return;
      }
      assert(false);
    });

    it("Should not let you purchase a non-existant NFT index", async () => {
      try{
      await minter.connect(user).purchase(1,1);
      } catch(e) {
        assert(e.message.includes('That NFT does not exist'));
        return;
      }
    })

    it("Should not be able to purchase an NFT while paused", async () => {
      await minter.connect(deployer).pause();
      try{
        await minter.connect(user).purchase(0,1);
      } catch(e) {
        assert(e.message.includes('Purchasing is paused'));
      } return;
    })

    it("Should allow for unpausing", async () => {
      await minter.connect(deployer).pause();
      await minter.connect(deployer).unpause();
      await minter.connect(user).purchase(0,1);
    })
    
  });
});
