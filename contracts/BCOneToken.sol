// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {ERC20Capped} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Capped.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Ownable2Step} from "@openzeppelin/contracts/access/Ownable2Step.sol";

/// @title BC ONE
/// @notice Draft capped ERC-20 token. Not deployed; tokenomics and chain remain unapproved.
/// @dev Supply arguments and mint amounts are expressed in whole BCONE tokens, not wei/base units.
///      The maximum supply is immutable. Only the owner may mint, and minting cannot exceed the cap.
contract BCOneToken is ERC20, ERC20Capped, Ownable2Step {
    uint256 private constant TOKEN_UNIT = 1 ether;

    error ZeroMaxSupply();
    error InitialSupplyExceedsMaxSupply();

    /// @param initialSupplyWholeTokens Initial amount minted to initialOwner, in whole tokens.
    /// @param maxSupplyWholeTokens Immutable maximum supply, in whole tokens.
    /// @param initialOwner Initial owner allowed to mint up to the cap and transfer ownership.
    constructor(uint256 initialSupplyWholeTokens, uint256 maxSupplyWholeTokens, address initialOwner)
        ERC20("BC ONE", "BCONE")
        ERC20Capped(maxSupplyWholeTokens * TOKEN_UNIT)
        Ownable(initialOwner)
    {
        if (maxSupplyWholeTokens == 0) revert ZeroMaxSupply();
        if (initialSupplyWholeTokens > maxSupplyWholeTokens) {
            revert InitialSupplyExceedsMaxSupply();
        }

        if (initialSupplyWholeTokens > 0) {
            _mint(initialOwner, initialSupplyWholeTokens * TOKEN_UNIT);
        }
    }

    /// @notice Mint whole BCONE tokens to a recipient, subject to the immutable supply cap.
    /// @dev This privileged function is intentionally retained as a design choice for review.
    ///      It must not be used until the issuance policy and owner governance are approved.
    function mint(address to, uint256 amountWholeTokens) external onlyOwner {
        _mint(to, amountWholeTokens * TOKEN_UNIT);
    }

    function _update(address from, address to, uint256 value) internal override(ERC20, ERC20Capped) {
        super._update(from, to, value);
    }
}
