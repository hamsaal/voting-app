const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("ElectionManager Contract", function () {
  let auth;
  let electionManager;
  let owner;
  let voter1;
  let voter2;
  let voter3;

  beforeEach(async function () {
    [owner, voter1, voter2, voter3] = await ethers.getSigners();

    const Auth = await ethers.getContractFactory("Auth");
    auth = await Auth.deploy();
    await auth.waitForDeployment();

    const ElectionManager = await ethers.getContractFactory("ElectionManager");
    electionManager = await ElectionManager.deploy(await auth.getAddress());
    await electionManager.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the Auth contract address correctly", async function () {
      expect(await electionManager.auth()).to.equal(await auth.getAddress());
    });

    it("Should initialize with zero elections", async function () {
      expect(await electionManager.electionCount()).to.equal(0);
    });
  });

  describe("Creating Elections", function () {
    it("Should allow admin to create election", async function () {
      const now = await time.latest();
      const startTime = now + 3600;
      const endTime = startTime + 86400;

      await expect(
        electionManager.connect(owner).createElection(
          "Test Election",
          "Test Description",
          ["Candidate 1", "Candidate 2"],
          startTime,
          endTime
        )
      )
        .to.emit(electionManager, "ElectionCreated")
        .withArgs(1, "Test Election", startTime, endTime);

      expect(await electionManager.electionCount()).to.equal(1);
    });

    it("Should fail when non-admin tries to create election", async function () {
      const now = await time.latest();
      const startTime = now + 3600;
      const endTime = startTime + 86400;

      await expect(
        electionManager.connect(voter1).createElection(
          "Test Election",
          "Test Description",
          ["Candidate 1", "Candidate 2"],
          startTime,
          endTime
        )
      ).to.be.revertedWith("Caller is not an admin");
    });

    it("Should fail when start time is after end time", async function () {
      const now = await time.latest();
      const startTime = now + 86400;
      const endTime = now + 3600;

      await expect(
        electionManager.connect(owner).createElection(
          "Test Election",
          "Test Description",
          ["Candidate 1", "Candidate 2"],
          startTime,
          endTime
        )
      ).to.be.revertedWith("Start time must be less than end time");
    });
  });

  describe("Voting", function () {
    let electionId;
    let startTime;
    let endTime;

    beforeEach(async function () {
      const now = await time.latest();
      startTime = now + 100;
      endTime = startTime + 86400;

      await electionManager.connect(owner).createElection(
        "Test Election",
        "Test Description",
        ["Alice", "Bob", "Charlie"],
        startTime,
        endTime
      );
      electionId = 1;
    });

    it("Should allow voting during active election period", async function () {
      await time.increaseTo(startTime + 1);

      await expect(
        electionManager.connect(voter1).vote(electionId, 0)
      )
        .to.emit(electionManager, "Voted")
        .withArgs(electionId, voter1.address, 0);

      expect(await electionManager.hasVoted(electionId, voter1.address)).to.equal(true);
    });

    it("Should prevent voting before election starts", async function () {
      await expect(
        electionManager.connect(voter1).vote(electionId, 0)
      ).to.be.revertedWith("Election is not active");
    });

    it("Should prevent double voting", async function () {
      await time.increaseTo(startTime + 1);
      await electionManager.connect(voter1).vote(electionId, 0);

      await expect(
        electionManager.connect(voter1).vote(electionId, 1)
      ).to.be.revertedWith("Already voted");
    });

    it("Should track votes correctly for multiple voters", async function () {
      await time.increaseTo(startTime + 1);

      await electionManager.connect(voter1).vote(electionId, 0);
      await electionManager.connect(voter2).vote(electionId, 1);
      await electionManager.connect(voter3).vote(electionId, 0);

      expect(await electionManager.votes(electionId, 0)).to.equal(2);
      expect(await electionManager.votes(electionId, 1)).to.equal(1);
    });
  });

  describe("Results & Publishing", function () {
    let electionId;
    let startTime;
    let endTime;

    beforeEach(async function () {
      const now = await time.latest();
      startTime = now + 100;
      endTime = startTime + 1000;

      await electionManager.connect(owner).createElection(
        "Results Test",
        "Testing results",
        ["Alice", "Bob"],
        startTime,
        endTime
      );
      electionId = 1;

      await time.increaseTo(startTime + 1);
      await electionManager.connect(voter1).vote(electionId, 0);
      await electionManager.connect(voter2).vote(electionId, 0);
      await electionManager.connect(voter3).vote(electionId, 1);
    });

    it("Should compute winner correctly after election ends", async function () {
      await time.increaseTo(endTime + 1);

      const winner = await electionManager.connect(owner).computeWinner(electionId);
      expect(winner).to.equal("Alice");
    });

    it("Should return correct election results", async function () {
      const results = await electionManager.connect(owner).getElectionResults(electionId);
      
      expect(results[0]).to.deep.equal(["Alice", "Bob"]);
      expect(results[1][0]).to.equal(2); // Alice votes
      expect(results[1][1]).to.equal(1); // Bob votes
      expect(results[3]).to.equal("Alice"); // winner
    });

    it("Should allow admin to publish results", async function () {
      await expect(
        electionManager.connect(owner).publishResults(electionId)
      ).to.emit(electionManager, "ResultsPublished");

      expect(await electionManager.resultsPublished(electionId)).to.equal(true);
    });

    it("Should prevent publishing results twice", async function () {
      await electionManager.connect(owner).publishResults(electionId);

      await expect(
        electionManager.connect(owner).publishResults(electionId)
      ).to.be.revertedWith("Already published");
    });
  });

  describe("Complete Lifecycle", function () {
    it("Should handle full election workflow", async function () {
      const now = await time.latest();
      const startTime = now + 100;
      const endTime = startTime + 2000;

      // Create election
      await electionManager.connect(owner).createElection(
        "Presidential Election",
        "Vote for president",
        ["Candidate A", "Candidate B"],
        startTime,
        endTime
      );

      // Vote
      await time.increaseTo(startTime + 1);
      await electionManager.connect(voter1).vote(1, 0);
      await electionManager.connect(voter2).vote(1, 0);
      await electionManager.connect(voter3).vote(1, 1);

      // Get results after election
      await time.increaseTo(endTime + 1);
      const winner = await electionManager.connect(owner).computeWinner(1);
      expect(winner).to.equal("Candidate A");

      // Publish
      await electionManager.connect(owner).publishResults(1);
      expect(await electionManager.resultsPublished(1)).to.equal(true);
    });
  });
});

