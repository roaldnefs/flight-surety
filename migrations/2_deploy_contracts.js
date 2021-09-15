const FlightSuretyApp = artifacts.require("FlightSuretyApp");
const FlightSuretyData = artifacts.require("FlightSuretyData");
const fs = require('fs');


module.exports = function(deployer) {
  // Deploy the FlightSuretyData contract.
  deployer.deploy(FlightSuretyData, {value: web3.utils.toWei('10', 'ether')})
  // Deploy the FlightSuretyApp contract.
  .then(() => {
    return deployer.deploy(FlightSuretyApp, FlightSuretyData.address)
  })
  .then((deployer) => {
    return FlightSuretyData.deployed();
  })
  // Authorize the FlightSuretyApp instance.
  .then((instance) => {
    instance.setAuthorizedCaller(FlightSuretyApp.address, true);
  }) 
  // Create configuration files for the DApp and Oracle.
  .then(() => {
    let config = {
      localhost: {
        url: 'http://localhost:8545',
        dataAddress: FlightSuretyData.address,
        appAddress: FlightSuretyApp.address
      }
    }
    fs.writeFileSync(__dirname + '/../app/src/config.json', JSON.stringify(config, null, '\t'), 'utf-8');
    fs.writeFileSync(__dirname + '/../server/src/config.json', JSON.stringify(config, null, '\t'), 'utf-8');
  });
};
