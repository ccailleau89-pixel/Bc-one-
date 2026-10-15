// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/// @title BC ONE Fixed Supply (alternative draft)
/// @notice Alternative ERC-20 design with no privileged minting or owner role.
/// @dev This is an option for tokenomics review, not a decision to deploy both contracts.
///      Supply is expressed in whole BCONE tokens and minted once during construction.
contract BCOneFixedSupplyToken is ERC20 {
    uint256 private constant TOKEN_UNIT = 1 ether;

    error ZeroInitialSupply();
    error ZeroInitialRecipient();

    constructor(uint256 initialSupplyWholeTokens, address initialRecipient)
        ERC20("BC ONE", "BCONE")
    {
        if (initialSupplyWholeTokens == 0) revert ZeroInitialSupply();
        if (initialRecipient == address(0)) revert ZeroInitialRecipient();

        _mint(initialRecipient, initialSupplyWholeTokens * TOKEN_UNIT);
    }
}
