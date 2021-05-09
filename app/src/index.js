import Web3 from "web3";
import flightSuretyAppArtifact from "../../build/contracts/FlightSuretyApp.json";

const App = {
  web3: null,
  account: null,
  meta: null,

  start: async function() {
    const { web3 } = this;

    try {
      // Get contract instance.
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = flightSuretyAppArtifact.networks[networkId];
      this.meta = new web3.eth.Contract(
        flightSuretyAppArtifact.abi,
        deployedNetwork.address,
      );

      // Get accounts.
      const accounts = await web3.eth.getAccounts();
      this.account = accounts[0];

      // Refresh the operational status of the contract at the moment the
      // dapp is opened.
      this.refreshStatus();
    } catch (error) {
      console.error("Could not connect to contract or chain.");

      // FIXME: make it DRY
      // Status elements showing the operational status of the contracts.
      const activeElements = document.getElementsByClassName("status-active");
      const inactiveElements = document.getElementsByClassName("status-inactive");
      const unknownElements = document.getElementsByClassName("status-unknown");

      // Hide the unknown status at the moment we are able to retrieve the
      // contract status.
      [...unknownElements].forEach(element => {
        element.classList.remove("hidden");
      });
      [...activeElements].forEach(element => {
        element.classList.add("hidden");
      });
      [...inactiveElements].forEach(element => {
        element.classList.add("hidden");
      });
    }
  },

  // Refresh the operational status of the contract.
  refreshStatus: async function() {
    // Retrieve the operational status of the contracts.
    const { isOperational } = this.meta.methods;
    const status = await isOperational().call();

    // Status elements showing the operational status of the contracts.
    const activeElements = document.getElementsByClassName("status-active");
    const inactiveElements = document.getElementsByClassName("status-inactive");
    const unknownElements = document.getElementsByClassName("status-unknown");

    // Hide the unknown status at the moment we are able to retrieve the
    // contract status.
    [...unknownElements].forEach(element => {
      element.classList.add("hidden");
    });

    // Show the active or inactive status based upon the operational status of
    // the contracts.
    if (status) {
      [...activeElements].forEach(element => {
        element.classList.remove("hidden");
      });
      [...inactiveElements].forEach(element => {
        element.classList.add("hidden");
      });
    } else {
      [...activeElements].forEach(element => {
        element.classList.add("hidden");
      });
      [...inactiveElements].forEach(element => {
        element.classList.remove("hidden");
      });
    }
  },

};

window.App = App;

window.addEventListener("load", function() {
  if (window.ethereum) {
    // use MetaMask's provider
    App.web3 = new Web3(window.ethereum);
    window.ethereum.enable(); // get permission to access accounts

    window.ethereum.on('networkChanged', (networkId) => {
      console.log("network changed to " + networkId);
      App.start();
    });
  } else {
    console.warn(
      "No web3 detected. Falling back to http://127.0.0.1:8545. You should remove this fallback when you deploy live",
    );
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    App.web3 = new Web3(
      new Web3.providers.HttpProvider("http://127.0.0.1:8545"),
    );
  }

  App.start();
});
