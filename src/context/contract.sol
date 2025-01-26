// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

contract Pegbreaker is Ownable {
    // DPG stablecoin
    ERC20 public dpgToken;
    // DAI stablecoin
    ERC20 public daiToken;
    // DPB governance token
    ERC20 public dpbToken;

    // Epoch Management
    uint256 public currentEpoch;
    uint256 public epochDuration = 30 days; // Example epoch duration of 30 days
    mapping(address => uint256) public stakes;

    // Bond Management
    struct Bond {
        uint256 amount;
        uint256 bondType; // 1-year or 2-year
        uint256 creationTimestamp;
    }
    mapping(address => Bond[]) public userBonds;

    // Chainlink DAI/USD Price Feed
    AggregatorV3Interface internal priceFeed;

    // Event declarations
    event MintDPG(address indexed user, uint256 amount);
    event BurnDPG(address indexed user, uint256 amount);
    event StakeDPG(address indexed user, uint256 amount);
    event BondIssued(address indexed user, uint256 bondAmount, uint256 bondType);
    event BondRedeemed(address indexed user, uint256 bondAmount, uint256 bondType);

    // Constructor
    constructor(address _dpgToken, address _daiToken, address _dpbToken, address _priceFeed) Ownable(msg.sender) {
        dpgToken = ERC20(_dpgToken);
        daiToken = ERC20(_daiToken);
        dpbToken = ERC20(_dpbToken);
        priceFeed = AggregatorV3Interface(_priceFeed);
        currentEpoch = block.timestamp;
    }

    // Function to get the latest DAI price in USD from Chainlink Price Feed
    function getDAIPrice() public view returns (uint256) {
        (, int256 price, , ,) = priceFeed.latestRoundData();
        require(price > 0, "Invalid price feed");
        return uint256(price); // Price in 8 decimal places
    }

    // Function to mint DPG when DAI >= $1
    function mintDPGWithDAI(uint256 _amount) external {
        require(daiToken.balanceOf(msg.sender) >= _amount, "Insufficient DAI");
        require(daiToken.transferFrom(msg.sender, address(this), _amount), "Transfer failed");

        // Only allow minting if DAI is > $1
        uint256 daiPrice = getDAIPrice();
        require(daiPrice >= 1 * 10**8, "DAI price must be >= $1");

        // Mint DPG at 1:1 ratio with DAI
        dpgToken.transfer(msg.sender, _amount);
        emit MintDPG(msg.sender, _amount);
    }

     // Function to mint DPG with Ethereum
     function mintDPGWithETH() external payable {
        require(msg.value > 0, "ETH required for minting");

        // Get the current price of DAI in USD
        uint256 daiPrice = getDAIPrice();
        require(daiPrice >= 1 * 10**8, "DAI price must be >= $1");

        // Calculate the amount of DAI to borrow (50% of the ETH value)
        uint256 ethValueInUSD = (msg.value * daiPrice) / 10**18; // Get ETH value in USD
        uint256 daiAmountToBorrow = (ethValueInUSD / 2); // Borrow 50% of ETH value

        // Check if we have enough DAI to mint
        require(daiToken.balanceOf(address(this)) >= daiAmountToBorrow, "Insufficient DAI in contract");

        // Convert borrowed DAI to DPG at a 1:1 ratio
        daiToken.transferFrom(address(this), msg.sender, daiAmountToBorrow); // Transfer DAI to user

        // Mint the equivalent amount of DPG to the user
        uint256 dpgAmount = daiAmountToBorrow;
        dpgToken.transfer(msg.sender, dpgAmount);

        emit MintDPG(msg.sender, dpgAmount);
    }

    // Function to burn DPG
    function burnDPG(uint256 _amount) external {
        require(dpgToken.balanceOf(msg.sender) >= _amount, "Insufficient DPG");
        require(dpgToken.transferFrom(msg.sender, address(this), _amount), "Transfer failed");

        emit BurnDPG(msg.sender, _amount);
    }

    // Staking logic (epoch management)
    function stakeDPG(uint256 _amount) external {
        require(dpgToken.balanceOf(msg.sender) >= _amount, "Insufficient DPG");
        dpgToken.transferFrom(msg.sender, address(this), _amount);

        // Add the amount to the user's stake balance
        stakes[msg.sender] += _amount;

        emit StakeDPG(msg.sender, _amount);
    }


    // Function to calculate bond returns based on bond type (1-year or 2-year)
    function calculateBond(uint256 bondType) internal pure returns (uint256) {
        if (bondType == 1) {
            return 25; // 25% return for 1-year bond
        } else if (bondType == 2) {
            return 60; // 60% return for 2-year bond
        }
        return 0;
    }

    // Function to issue bonds
    function issueBond(uint256 bondType) external {
        require(bondType == 1 || bondType == 2, "Invalid bond type");

        uint256 bondAmount = calculateBond(bondType);
        
        // Locking the user's DPG tokens for the bond
        dpgToken.transferFrom(msg.sender, address(this), bondAmount);

        // Store the bond information
        userBonds[msg.sender].push(Bond({
            amount: bondAmount,
            bondType: bondType,
            creationTimestamp: block.timestamp
        }));

        emit BondIssued(msg.sender, bondAmount, bondType);
    }

    // Function to redeem bonds (based on bond type and lock period)
    function redeemBond(uint256 bondIndex) external {
        Bond storage bond = userBonds[msg.sender][bondIndex];

        require(bond.amount > 0, "Invalid bond");
        uint256 bondDuration = bond.bondType == 1 ? 365 days : 730 days; // 1-year or 2-year lock period

        // Ensure the bond has matured
        require(block.timestamp >= bond.creationTimestamp + bondDuration, "Bond has not matured yet");

        // Transfer the bond amount back to the user
        uint256 payout = bond.amount + (bond.amount * calculateBond(bond.bondType)) / 100; // Adding bond return
        dpgToken.transfer(msg.sender, payout);

        emit BondRedeemed(msg.sender, payout, bond.bondType);

        // Remove the redeemed bond
        delete userBonds[msg.sender][bondIndex];
    }

    // Function to check if the current epoch has passed
    function isEpochComplete() public view returns (bool) {
        return block.timestamp >= currentEpoch + epochDuration;
    }

    // Function to advance to the next epoch (can only be called by owner)
    function advanceEpoch() external onlyOwner {
        require(isEpochComplete(), "Epoch has not completed yet");
        currentEpoch = block.timestamp;
    }

    // Function to withdraw DAI or DPG (emergency function, only owner)
    function emergencyWithdraw(address token, uint256 amount) external onlyOwner {
        ERC20(token).transfer(owner(), amount);
    }

    // Function to get balances of all tokens for a user
    function getTokenBalances(address user) external view returns (uint256 dpgBalance, uint256 daiBalance, uint256 dpbBalance) {
        dpgBalance = dpgToken.balanceOf(user);
        daiBalance = daiToken.balanceOf(user);
        dpbBalance = dpbToken.balanceOf(user);
    }

    // New Function: Check User Bonds
    function getUserBonds(address user) external view returns (Bond[] memory) {
        return userBonds[user];
    }

    // New Function: Check User Stake
    function getUserStake(address user) external view returns (uint256) {
        return stakes[user];
    }

    // Function to get the market cap of DPG token (based on total supply and price)
function getDPGMarketCap() public view returns (uint256) {
    uint256 totalSupplyDPG = dpgToken.totalSupply();
    uint256 dpgPrice = getDAIPrice(); // Using DAI price as an approximation
    return (totalSupplyDPG * dpgPrice) / 10**8; // Adjust for decimals if necessary
}

// Function to get the market cap of DAI token (based on total supply and price)
function getDAIMarketCap() public view returns (uint256) {
    uint256 totalSupplyDAI = daiToken.totalSupply();
    uint256 daiPrice = getDAIPrice(); // DAI price is in USD with 8 decimals
    return (totalSupplyDAI * daiPrice) / 10**8; // Adjust for decimals if necessary
}

// Function to get the market cap of DPB token (based on total supply and a hypothetical price)
function getDPBMarketCap() public view returns (uint256) {
    uint256 totalSupplyDPB = dpbToken.totalSupply();
    uint256 dpbPrice = 1 * 10**8; // Set a fixed price for DPB token or use a price feed
    return (totalSupplyDPB * dpbPrice) / 10**8; // Adjust for decimals if necessary
}

}
