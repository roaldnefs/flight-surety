const truffleConfig = require("../truffle-config");
const truffleAssertions = require('truffle-assertions');

const FlightSuretyApp = artifacts.require("FlightSuretyApp");
const FlightSuretyData = artifacts.require("FlightSuretyData");

contract("FlightSuretyApp", accounts => {

    // Tests related to operations and settings.

    it("(Extra) Has correct initial isOperational() value", async () => {
        const instance = await FlightSuretyApp.deployed();
        const status = await instance.isOperational.call();
        assert.equal(status, true, "Incorrect initial operating status value");
    });

    it("(Extra) Can block access to setOperatingStatus() for non-contract owner account", async () => {
        const instance = await FlightSuretyData.deployed();
        let denied = false;
        try {
            await instance.setOperatingStatus(false, {from: accounts[1]});
        } catch(error) {
            denied = true;
        }
        assert.equal(denied, true, "Access not restricted to contract owner");
    });

    it("(Extra) Can allow access to setOperatingStatus() for contract owner account", async () => {
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

    // Tests related to airlines.

    it("(Airline Contract Initialization) First airline is registered when contract is deployed", async () => {
        const instance = await FlightSuretyData.deployed();
        let found = true;

        // Retrieve the first 
        const airline = await instance.getAirline(accounts[0]);

        assert.equal(airline[0], accounts[0], "The contract owner was not registered as the first airline");
        assert.equal(airline[1], 1, "The contract owner was not registered as the first airline");
        assert.equal(airline[2], true, "The first airline is not register as a voter");
    });

    it("(Multiparty Consensus) Airline can be registered, but does not participate in contract until it submits funding of 10 ether", async () => {
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

    it("(Multiparty Consensus) Only existing airline may register a new airline until there are at least four airlines registered", async () => {
        const instance = await FlightSuretyApp.deployed();
        let blocked = true;
        let allowed = true;

        // Attempt to register an airline from a non registered airline.
        try {
            await instance.registerAirline(accounts[4], {from: accounts[3]});
        } catch(error) {
            blocked = false;
        }

        // Pay registration fee for the third airline.
        await instance.payAirlineRegistrationFee({from: accounts[2], value: web3.utils.toWei('10', 'ether')})

        // Attempt to register the rest of the four airlines. The first three
        // have already been registered in previous tests.
        try {
            await instance.registerAirline(accounts[3], {from: accounts[2]});
        } catch(error) {
            allowed = false;
        }

        // Pay registration fee for the fourth airline.
        await instance.payAirlineRegistrationFee({from: accounts[3], value: web3.utils.toWei('10', 'ether')})

        assert.equal(blocked, false, "A non registered airline was able to register a new airlines")
        assert.equal(allowed, true, "The first four airlines where not allowed to register new airlines")
    });

    it("(Extra) Check airline registration fee is set to 10 ether", async () => {
        const instance = await FlightSuretyApp.deployed();
        const fee = await instance.getAirlineRegistrationFee();
        assert.equal(fee, web3.utils.toWei('10', "ether"), "The airline registration fee is not correct.");
    });

    it("(Multiparty Consensus) Registration of fifth airline requires multi-party consensus of 50% of registered airlines", async () => {
        const instance = await FlightSuretyApp.deployed();

        let consensus_required = false;
        let vote_blocked = false;
        let emitted_registered = false;
        let voted = false;

        // Register the fifth airline, requires at least two votes to be accepted.
        let tx = await instance.registerAirline(accounts[4], {from: accounts[0]});
        try {
            // Try the get the airline details for the newly added airline, it
            // should be available yet as it first requires consensus first.
            const airline = await instance.getAirline(accounts[4]);
        } catch(error) {
            consensus_required = true;
        }
        // Check if vote was cast on the registration of the fifth airline.
        truffleAssertions.eventEmitted(tx, 'Voted', (ev) => {
            voted = true;
            return true;
        });

        try {
            // Try to vote on the fifth airline for a second time as the first
            // airline. It should be blocked to vote multiple times.
            await instance.registerAirline(accounts[4], {from: accounts[0]});
        } catch(error) {
            vote_blocked = true;
        }
        
        // Send the second vote to allow the fifth airline to be registered.
        tx = await instance.registerAirline(accounts[4], {from: accounts[1]});
        truffleAssertions.eventEmitted(tx, 'Registered', (ev) => {
            emitted_registered = true;
            return true;
        });

        // Pay registration fee for the fifth airline to let it be used in
        // subsequent tests.
        await instance.payAirlineRegistrationFee({from: accounts[4], value: web3.utils.toWei('10', 'ether')})

        assert.equal(consensus_required, true, "Registration of fifth and subsequent airlines should require multi-party consensus.")
        assert.equal(voted, true, "Registration of fifth and subsequent airlines should result in a new vote.")
        assert.equal(vote_blocked, true, "Airlines should only be allowed to vote once on a new airline.");
        assert.equal(emitted_registered, true, "Airline should have been registered at multi-party consensus of 50% of registered airlines.");
    });

    it("(Multiparty Consensus) Registration of subsequent airlines requires multi-party consensus of 50% of registered airlines", async () => {
        const instance = await FlightSuretyApp.deployed();
        const dataInstance = await FlightSuretyData.deployed();

        let registered = false;
        let voted = false;

        // Count the number if registered airlines.
        let count = await dataInstance.getAirlineCount()

        // Register the sixth airline, requires at least three votes to be accepted.
        let tx = await instance.registerAirline(accounts[5], {from: accounts[0]});
        // Check if vote was cast on the registration of the sixth airline.
        truffleAssertions.eventEmitted(tx, 'Voted', (ev) => {
            voted = true;
            return true;
        });

        // Cast the additional votes.
        await instance.registerAirline(accounts[5], {from: accounts[1]});
        tx = await instance.registerAirline(accounts[5], {from: accounts[2]});
        // Check if registratios was passed on the third vote.
        truffleAssertions.eventEmitted(tx, 'Registered', (ev) => {
            registered = true;
            return true;
        });

        assert.equal(count, 5, "Expected five airlines to be registered.");
        assert.equal(voted, true, "Registration of subsequent airlines should require multi-party consensus.");
        assert.equal(registered, true, "Airline should have been registered at multi-party consensus of 50% of registered airlines.");
    });

  });
