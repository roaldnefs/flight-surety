const FlightSuretyApp = artifacts.require("FlightSuretyApp");
const FlightSuretyData = artifacts.require("FlightSuretyData");

contract("FlightSuretyApp", accounts => {

    it("(multiparty) has correct initial isOperational() value", async () => {
        const instance = await FlightSuretyApp.deployed();
        const status = await instance.isOperational.call();
        assert.equal(status, true, "Incorrect initial operating status value");
    });

    it("(multiparty) can block access to setOperatingStatus() for non-contract owner account", async () => {
        const instance = await FlightSuretyData.deployed();
        let denied = false;
        try {
            await instance.setOperatingStatus(false, {from: accounts[1]});
        } catch(error) {
            denied = true;
        }
        assert.equal(denied, true, "Access not restricted to contract owner");
    });

    it("(multiparty) can allow access to setOperatingStatus() for contract owner account", async () => {
        const instance = await FlightSuretyData.deployed();
        let denied = false;
        try {
            await instance.setOperatingStatus(false, {from: accounts[0]});
        } catch(error) {
            denied = true;
        }
        assert.equal(denied, false, "Access not restricted to contract owner");
    });

  });
