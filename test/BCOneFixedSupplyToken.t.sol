// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {BCOneFixedSupplyToken} from "../contracts/BCOneFixedSupplyToken.sol";

contract BCOneFixedSupplyTokenTest is Test {
    uint256 private constant UNIT = 1 ether;
    address private treasury = address(0xA11CE);
    address private alice = address(0xB0B);
    address private bob = address(0xB0B1);

    BCOneFixedSupplyToken private token;

    function setUp() public {
        token = new BCOneFixedSupplyToken(10_000, treasury);
    }

    function testMetadataAndFixedSupply() public view {
        assertEq(token.name(), "BC ONE");
        assertEq(token.symbol(), "BCONE");
        assertEq(token.decimals(), 18);
        assertEq(token.totalSupply(), 10_000 * UNIT);
        assertEq(token.balanceOf(treasury), 10_000 * UNIT);
    }

    function testTransfersDoNotChangeSupply() public {
        vm.prank(treasury);
        token.transfer(alice, 100 * UNIT);

        vm.prank(alice);
        token.transfer(bob, 40 * UNIT);

        assertEq(token.balanceOf(treasury), 9_900 * UNIT);
        assertEq(token.balanceOf(alice), 60 * UNIT);
        assertEq(token.balanceOf(bob), 40 * UNIT);
        assertEq(token.totalSupply(), 10_000 * UNIT);
    }

    function testMintFunctionIsNotExposed() public {
        vm.prank(treasury);
        (bool success,) = address(token).call(abi.encodeWithSignature("mint(address,uint256)", alice, 1));
        assertFalse(success);
        assertEq(token.totalSupply(), 10_000 * UNIT);
    }

    function testZeroSupplyReverts() public {
        vm.expectRevert(BCOneFixedSupplyToken.ZeroInitialSupply.selector);
        new BCOneFixedSupplyToken(0, treasury);
    }

    function testZeroRecipientReverts() public {
        vm.expectRevert(BCOneFixedSupplyToken.ZeroInitialRecipient.selector);
        new BCOneFixedSupplyToken(1, address(0));
    }

    function testFuzzTransfersConserveSupply(uint256 amount) public {
        amount = bound(amount, 0, 10_000 * UNIT);

        vm.prank(treasury);
        token.transfer(alice, amount);

        vm.prank(alice);
        token.transfer(bob, amount / 3);

        assertEq(token.balanceOf(treasury) + token.balanceOf(alice) + token.balanceOf(bob), token.totalSupply());
        assertEq(token.totalSupply(), 10_000 * UNIT);
    }
}
