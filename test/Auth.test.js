const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Auth Contract", function () {
  let auth;
  let owner;
  let addr1;
  let addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    const Auth = await ethers.getContractFactory("Auth");
    auth = await Auth.deploy();
    await auth.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the deployer as admin", async function () {
      expect(await auth.isAdmin(owner.address)).to.equal(true);
    });
  });

  describe("Admin Management", function () {
    it("Should allow admin to add new admin", async function () {
      await auth.connect(owner).addAdmin(addr1.address);
      expect(await auth.isAdmin(addr1.address)).to.equal(true);
    });

    it("Should fail when non-admin tries to add admin", async function () {
      await expect(
        auth.connect(addr1).addAdmin(addr2.address)
      ).to.be.revertedWith("Auth: caller is not an admin");
    });

    it("Should allow admin to remove another admin", async function () {
      await auth.connect(owner).addAdmin(addr1.address);
      expect(await auth.isAdmin(addr1.address)).to.equal(true);
      
      await auth.connect(owner).removeAdmin(addr1.address);
      expect(await auth.isAdmin(addr1.address)).to.equal(false);
    });

    it("Should fail when non-admin tries to remove admin", async function () {
      await auth.connect(owner).addAdmin(addr1.address);
      
      await expect(
        auth.connect(addr2).removeAdmin(addr1.address)
      ).to.be.revertedWith("Auth: caller is not an admin");
    });

    it("Should prevent removed admin from performing admin actions", async function () {
      await auth.connect(owner).addAdmin(addr1.address);
      await auth.connect(owner).removeAdmin(addr1.address);
      
      await expect(
        auth.connect(addr1).addAdmin(addr2.address)
      ).to.be.revertedWith("Auth: caller is not an admin");
    });
  });
});

