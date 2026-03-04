// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title GasOptimizer
 * @notice Gas optimization utilities for batch transactions and multicall.
 * @dev Designed for Arc Testnet where gas is paid in USDC.
 */
contract GasOptimizer is Ownable {
    using SafeERC20 for IERC20;

    // ── Types ──────────────────────────
    struct Call {
        address target;
        uint256 value;
        bytes data;
    }

    struct GasEstimate {
        uint256 estimatedGas;
        uint256 gasPriceWei;
        uint256 totalCostWei;
    }

    // ── Events ─────────────────────────
    event MulticallExecuted(address indexed sender, uint256 callCount);
    event ApproveAndBridgeExecuted(
        address indexed sender,
        address token,
        address bridge,
        uint256 amount
    );

    // ── Errors ─────────────────────────
    error CallFailed(uint256 index, bytes returnData);
    error InsufficientValue();

    // ── Constructor ────────────────────
    constructor() Ownable(msg.sender) {}

    // ── Multicall ──────────────────────
    /**
     * @notice Execute multiple calls in a single transaction.
     * @param calls Array of calls to execute.
     * @return results Array of return data from each call.
     */
    function multicall(Call[] calldata calls)
        external
        payable
        returns (bytes[] memory results)
    {
        results = new bytes[](calls.length);
        uint256 totalValue;

        for (uint256 i; i < calls.length; ++i) {
            totalValue += calls[i].value;
            (bool success, bytes memory result) = calls[i].target.call{
                value: calls[i].value
            }(calls[i].data);

            if (!success) revert CallFailed(i, result);
            results[i] = result;
        }

        if (msg.value < totalValue) revert InsufficientValue();
        emit MulticallExecuted(msg.sender, calls.length);
    }

    /**
     * @notice Approve and bridge tokens in a single transaction.
     * @dev Saves gas by combining ERC-20 approval with bridge execution.
     */
    function approveAndBridge(
        address token,
        address bridge,
        uint256 amount,
        bytes calldata bridgeData
    ) external payable {
        // Approve bridge to spend tokens
        IERC20(token).safeTransferFrom(msg.sender, address(this), amount);
        IERC20(token).approve(bridge, amount);

        // Execute bridge
        (bool success, ) = bridge.call{value: msg.value}(bridgeData);
        require(success, "Bridge call failed");

        emit ApproveAndBridgeExecuted(msg.sender, token, bridge, amount);
    }

    /**
     * @notice Estimate gas for a call (static call wrapper).
     * @dev Uses gasleft() to measure actual gas consumption.
     */
    function estimateGas(
        address target,
        bytes calldata data
    ) external view returns (uint256) {
        uint256 gasBefore = gasleft();
        // Static call to estimate
        (bool success, ) = target.staticcall(data);
        uint256 gasUsed = gasBefore - gasleft();
        // Add 20% buffer
        return success ? (gasUsed * 120) / 100 : 0;
    }

    // ── Receive ────────────────────────
    receive() external payable {}

    /**
     * @notice Withdraw stuck tokens (emergency).
     */
    function rescueTokens(address token, uint256 amount) external onlyOwner {
        IERC20(token).safeTransfer(owner(), amount);
    }

    /**
     * @notice Withdraw stuck ETH/USDC (emergency).
     */
    function rescueETH() external onlyOwner {
        (bool success, ) = owner().call{value: address(this).balance}("");
        require(success, "Transfer failed");
    }
}
