require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config(); // <-- Import and run dotenv

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.28",
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545",
      accounts: [process.env.PRIVATE_KEY],
    },
  },
};
