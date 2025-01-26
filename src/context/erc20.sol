// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract DummyERC20 is ERC20 {
    constructor(string memory name, string memory symbol) ERC20(name, symbol) {
        // Mint 10,000 tokens to the deployer
        _mint(msg.sender, 10_000 * 10 ** decimals()); 
    }
}

// 10_000 * 10 ** decimals() = 10,000 tokens
