const FlightSuretyApp = artifacts.require("FlightSuretyApp");
const FlightSuretyData = artifacts.require("FlightSuretyData");

module.exports = function(deployer) {
  deployer.deploy(FlightSuretyData)
  .then(() => {
    return deployer.deploy(FlightSuretyApp, FlightSuretyData.address);
  });
};
