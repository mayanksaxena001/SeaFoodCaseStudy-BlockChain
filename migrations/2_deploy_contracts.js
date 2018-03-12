var SeaFoodContract = artifacts.require("./SeaFoodContract.sol");

module.exports = function(deployer) {
  deployer.deploy(SeaFoodContract);
};
