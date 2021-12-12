// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "./FlightSuretyData.sol";

contract FlightSuretyApp {
    // Allow SafeMath functions to be accaled fo all unint256 types.
    using SafeMath for uint256;

    // Holds the data contract.
    FlightSuretyData flightSuretyData;

    // Account used to deploy contract.
    address private contractOwner;

    // Holds the thresshold for when any subsequent airline requires
    // multi-party consensus on registration.
    uint8 private constant AIRLINE_CONSENSUS_THRESSHOLD = 4;
    // Holds the registration fee for new airlines.
    uint256 private constant AIRLINE_REGISTRATION_FEE = 10 ether;
    // Holds the divisor for calculating the thresshold of the vote limit. In
    // the case for 50% the divisor is 100/50=2.
    uint8 private constant AIRLINE_VOTES_DIVISOR = 2;
    // Holds the votes for the newly registered airlines.
    mapping(address => address[]) public votes;

    // Flight satus codes.
    uint8 private constant STATUS_CODE_UNKNOWN = 0;
    uint8 private constant STATUS_CODE_ON_TIME = 10;
    uint8 private constant STATUS_CODE_LATE_AIRLINE = 20;
    uint8 private constant STATUS_CODE_LATE_WEATHER = 30;
    uint8 private constant STATUS_CODE_LATE_TECHNICAL = 40;
    uint8 private constant STATUS_CODE_LATE_OTHER = 50;

    // Holds the registration fee for new oracles.
    uint256 private constant ORACLE_REGISTRATION_FEE = 10 ether;
    // The number of oracles that must response for a valid status.
    uint256 private constant ORACLE_MIN_RESPONSES = 3;

    // Event thrown when a new airline is registered. 
    event Registered(address airline);
    // Event thrown when a registered airline has paid its registration fee.
    event Funded(address airline);
    // Event thrown when a registered airline casts a vote for a new airline.
    event Voted(address voter, address airline);

    // Modifier that requires the operational boolean variable to be true. This
    // is used on all state changing functions to pause the contract in the
    // event there is an issue that needs to be fixed.
    modifier requireIsOperational() {
        // Check operational status of data contract.
        require(isOperational(), "Contract is currently not operational");
        _;
    }

    // Modifier that requires the contract owner account to be the function
    // caller.
    modifier requireContractOwner() {
        require(msg.sender == contractOwner, "Caller is not contract owner");
        _;
    }

    // Modifier that requires the caller to be a registered airline.
    modifier requireAirline() {
        // Lookup the airline using the caller address, if it doens't exits it
        // results in an error.
        (address airlineAddress, uint id, bool isVoter) = flightSuretyData.getAirline(msg.sender);
        _;
    }

    // Modifier that requires the caller to be a funded airline.
    modifier requireFundedAirline() {
        require(flightSuretyData.isFundedAirline(msg.sender), "Caller is not a funded airline");
        _;
    }

    // Modifier that requires the caller to not have voted on the supplied
    // airline yet.
    modifier requireUnvotedAirline(address _address) {
        // Check if consensus is already required otherwise skip checking votes.
        if (flightSuretyData.getAirlineCount() >= AIRLINE_CONSENSUS_THRESSHOLD) {
            // Loop over all the votes for the supplied airline.
            for (uint idx=0; idx < votes[_address].length; idx++) {
                // Check if the caller is the current voter.
                if (votes[_address][idx] == msg.sender) {
                    revert("Caller has already voted on the airline");
                }
            }
        }
        _;
    }

    // Modifier that required the caller to send a certain fee to call the function.
    modifier requireFee(uint fee) {
        require(msg.value >= fee, "The message value is less that the required fee");
        _;
    }

    // Modifier that returns any excess change to the sender.
    modifier returnChange(uint amount) {
        _;
        uint change = msg.value.sub(amount);
        payable(msg.sender).transfer(change);
    }

    constructor(FlightSuretyData dataContract) {
        contractOwner = msg.sender;
        flightSuretyData = dataContract;
    }

    // Get operating status of contract.
    function isOperational() public view returns(bool) {
        return flightSuretyData.isOperational();
    }

    // Register a new airline.
    function registerAirline(address _address)
    requireIsOperational
    requireFundedAirline  // Verify if the caller is a registered and funded airline.
    requireUnvotedAirline(_address)  // Verify if the caller has not voted yet.
    public {
        // Retrieve current number of registered airlines.
        uint count = flightSuretyData.getAirlineCount();

        // Check wether or not consesus is required based upon the specified thresshold.
        if (count < AIRLINE_CONSENSUS_THRESSHOLD) {
            flightSuretyData.registerAirline(_address, false);
            // Emit event to inform a new airline was registered.
            emit Registered(_address);
        } else {
            // Register the callers vote for the new airline.
            votes[_address].push(msg.sender);
            // Emit event to inform a new vote was casted.
            emit Voted(msg.sender, _address);

            // Calculate the thresshold to reach consensus. Solidity will round
            // a division to zero.
            uint thresshold = count.sub(count.div(AIRLINE_VOTES_DIVISOR));
            // Check if the new airline has reached the thresshold of 50% of
            // votes to be registered.
            if (votes[_address].length >= thresshold) {
                flightSuretyData.registerAirline(_address, false);
                votes[_address] = new address[](0);
                // Emit event to inform a new airline was registered.
                emit Registered(_address);
            }
        }
    }

    // Return the current airline registration fee.
    function getAirlineRegistrationFee()
    requireIsOperational
    public view returns (uint256 fee) {
        fee = AIRLINE_REGISTRATION_FEE;
        return (fee);
    }

    // Allow registrered airlines to pay the registration fee in order to
    // become a voter.
    function payAirlineRegistrationFee()
    requireIsOperational
    requireAirline  // Verify if the caller is a registered airline.
    requireFee(AIRLINE_REGISTRATION_FEE)  // Verifiy the airline registration fee.
    returnChange(AIRLINE_REGISTRATION_FEE)  // Return any excess change to the sender.
    public payable {
        // Send registration fee to the data contract.
        payable(address(flightSuretyData)).transfer(msg.value);
        // Update voter status of airline
        flightSuretyData.updateAirline(msg.sender, true);
        // Emit event to inform an airline was funded.
        emit Funded(msg.sender);
    }

    // Return the current oracle registration fee.
    function getOracleRegistrationFee()
    requireIsOperational
    public view returns (uint256 fee) {
        fee = ORACLE_REGISTRATION_FEE;
        return (fee);
    }

}
