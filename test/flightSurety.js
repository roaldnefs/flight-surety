const truffleConfig = require("../truffle-config");
const truffleAssertions = require('truffle-assertions');

const FlightSuretyApp = artifacts.require("FlightSuretyApp");
const FlightSuretyData = artifacts.require("FlightSuretyData");

contract("FlightSuretyApp", accounts => {

    // Tests related to operations and settings.

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

        // Set the operational status back to true, to allow the other tests
        // to run.
        await instance.setOperatingStatus(true, {from: accounts[0]});
    });

    // TODO: call function that requires the contract to be operational instead
    // of the non existing setTestingMode() function.
    // it("(multiparty) can block access to functions using requireIsOperational when operating status is false", async () => {
    //     const instance = await FlightSuretyData.deployed();
    //     let reverted = false;
    //     try {
    //         await instance.FlightSuretyApp.setTestingMode(true);
    //     }
    //     catch (error) {
    //         reverted = true;
    //     }
    //     assert.equal(reverted, true, "Access not block for requireIsOperational");

    //     // Set the operational status back to true, to allow the other tests
    //     // to run
    //     await instance.FlightSuretyData.setOperatingStatus(true, {from: accounts[0]});
    // });

    // Tests related to airlines.

    it("(airlines) first airline is registered when contract is deployed", async () => {
        const instance = await FlightSuretyData.deployed();
        let found = true;

        // Retrieve the first 
        const airline = await instance.getAirline(accounts[0]);

        assert.equal(airline[0], accounts[0], "The contract owner was not registered as the first airline");
        assert.equal(airline[1], 1, "The contract owner was not registered as the first airline");
        assert.equal(airline[2], true, "The first airline is not register as a voter");
    });

    it("(airlines) only funded and registered airlines can register new airlines", async () => {
        const instance = await FlightSuretyApp.deployed();
        let blocked = false;
        let emitted = false;

        // Register second airline using the first airline. The first airline
        // was accepted as a voter on deployment of the contract.
        await instance.registerAirline(accounts[1], {from: accounts[0]});

        // Register third airline using the newly and unfunded second
        // airline. This should be blocked by the modifiers.
        try {
            await instance.registerAirline(accounts[2], {from: accounts[1]});
        } catch(error) {
            blocked = true;
        }

        // Pay registration fee and attempt the register the third airline again.
        await instance.payAirlineRegistrationFee({from: accounts[1], value: web3.utils.toWei('10', 'ether')})
        let tx = await instance.registerAirline(accounts[2], {from: accounts[1]});

        // Check the emitted event Registered() on registration of the third airline.
        truffleAssertions.eventEmitted(tx, 'Registered', (ev) => {
            emitted = true;
            return true;
        });

        assert.equal(blocked, true, "Unfunded airline was able to register another airline");
        assert.equal(emitted, true, "Funded airline was not able to register another airline");
    });

    // it("(airlines) only allow airlines to register the first four airlines", async () => {
    //     const instance = await FlightSuretyApp.deployed();
    //     let blocked = true;
    //     let allowed = true;

    //     // Attempt to register an airline from a non registered airline.
    //     try {
    //         await instance.registerAirline(accounts[2], {from: accounts[1]});
    //     } catch(error) {
    //         blocked = false;
    //     }

    //     // Attempt to register another three airlines from already registered
    //     // airlines.
    //     try {
    //         await instance.registerAirline(accounts[1], {from: accounts[0]});
    //         await instance.registerAirline(accounts[2], {from: accounts[1]});
    //         await instance.registerAirline(accounts[3], {from: accounts[2]});
    //     } catch(error) {
    //         allowed = false;
    //     }

    //     assert.equal(blocked, false, "A non registered airline was able to register a new airlines")
    //     assert.equal(allowed, true, "The first four airlines where not allowed to register new airlines")
    // });

    it("(airlines) check airline registration fee is set to 10 ether", async () => {
        const instance = await FlightSuretyApp.deployed();
        const fee = await instance.getAirlineRegistrationFee();
        assert.equal(fee, web3.utils.toWei('10', "ether"), "The airline registration fee is not correct.");
    });

  });
