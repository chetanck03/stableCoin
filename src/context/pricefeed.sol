// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// Interface for ERC20 tokens
interface IERC20 {
    function balanceOf(address account) external view returns (uint256);
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    function transfer(address recipient, uint256 amount) external returns (bool);
}

// Interface for price feed
interface AggregatorV3Interface {
    function latestRoundData()
        external
        view
        returns (
            uint80 roundId,
            int256 answer,
            uint256 startedAt,
            uint256 updatedAt,
            uint80 answeredInRound
        );
}

// Mock Price Feed Contract
contract MockPriceFeed is AggregatorV3Interface {
    int256 public price = 100000000; // 1 DAI = 1 USD (in 8 decimal places)

    function latestRoundData()
        external
        view
        override
        returns (
            uint80 roundId,
            int256 answer,
            uint256 startedAt,
            uint256 updatedAt,
            uint80 answeredInRound
        )
    {
        return (0, price, block.timestamp, block.timestamp, 0);
    }
}
