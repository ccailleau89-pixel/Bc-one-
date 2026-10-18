// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @title BurgerCoin (BC ONE)
 * @notice Fixed-supply ERC-20 for the BC ONE / Burger ID ecosystem.
 * @dev The full supply is minted once to the deployer. No owner, mint,
 *      blacklist, transfer tax, or hidden admin controls are included.
 *      Burger ID account balances remain an application-layer concern;
 *      this token does not merge or alter off-chain loyalty points.
 */
contract BurgerCoin is ERC20 {
    uint256 public constant INITIAL_SUPPLY = 100_000_000 * 10 ** 18;

    constructor() ERC20("Burger Coin", "BCONE") {
        _mint(msg.sender, INITIAL_SUPPLY);
    }
}
