const MyContract = artifacts.require("WrappedCurioCards");
module.exports = async function (deployer, network, accounts) {
  // deployment steps
  await deployer.deploy(MyContract);

};

