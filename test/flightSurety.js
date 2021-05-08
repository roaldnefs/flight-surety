const FlightSuretyApp = artifacts.require("FlightSuretyApp");

contract("FlightSuretyApp", accounts => {
    it("should be testable", async () => {
      const instance = await FlightSuretyApp.deployed();
    //   const balance = await instance.getBalance.call(accounts[0]);
      assert.equal(true, true, "isn't testable");
    });
  });
