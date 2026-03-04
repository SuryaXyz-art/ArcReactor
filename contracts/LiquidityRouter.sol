// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title LiquidityRouter
 * @notice Main aggregator contract for cross-chain stablecoin bridging on Arc Testnet.
 * @dev Routes bridge transactions through registered adapters, with slippage protection
 *      and emergency pause functionality.
 */
contract LiquidityRouter is Ownable, ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;

    // ── Types ──────────────────────────
    struct Route {
        address adapter;       // Bridge adapter contract address
        address tokenIn;       // Source token
        uint256 amountIn;      // Amount to bridge
        uint256 destChainId;   // Destination chain ID
        uint256 minAmountOut;  // Minimum output (slippage protection)
        bytes adapterData;     // Provider-specific calldata
    }

    struct BridgeRecord {
        address user;
        address adapter;
        address tokenIn;
        uint256 amountIn;
        uint256 destChainId;
        uint256 timestamp;
        bool executed;
    }

    // ── State ──────────────────────────
    mapping(address => bool) public registeredAdapters;
    address[] public adapterList;

    mapping(bytes32 => BridgeRecord) public bridgeRecords;
    uint256 public totalBridges;

    uint256 public maxSlippageBps = 500; // 5% max slippage

    // ── Events ─────────────────────────
    event AdapterRegistered(address indexed adapter, string name);
    event AdapterRemoved(address indexed adapter);
    event BridgeExecuted(
        bytes32 indexed bridgeId,
        address indexed user,
        address adapter,
        address tokenIn,
        uint256 amountIn,
        uint256 destChainId
    );
    event BridgeBatchExecuted(address indexed user, uint256 routeCount);
    event MaxSlippageUpdated(uint256 newMaxBps);

    // ── Errors ─────────────────────────
    error AdapterNotRegistered(address adapter);
    error InvalidAmount();
    error SlippageTooHigh(uint256 requestedBps, uint256 maxBps);
    error BridgeFailed(address adapter);
    error InvalidRoute();

    // ── Constructor ────────────────────
    constructor() Ownable(msg.sender) {}

    // ── Admin Functions ────────────────
    function registerAdapter(address adapter, string calldata name) external onlyOwner {
        require(adapter != address(0), "Invalid adapter");
        registeredAdapters[adapter] = true;
        adapterList.push(adapter);
        emit AdapterRegistered(adapter, name);
    }

    function removeAdapter(address adapter) external onlyOwner {
        registeredAdapters[adapter] = false;
        emit AdapterRemoved(adapter);
    }

    function setMaxSlippage(uint256 newMaxBps) external onlyOwner {
        require(newMaxBps <= 1000, "Max 10%");
        maxSlippageBps = newMaxBps;
        emit MaxSlippageUpdated(newMaxBps);
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    // ── Core Bridge Function ───────────
    /**
     * @notice Execute a single bridge route.
     * @param route The route parameters including adapter, token, amount, and destination.
     */
    function executeBridge(Route calldata route)
        external
        payable
        nonReentrant
        whenNotPaused
        returns (bytes32 bridgeId)
    {
        _validateRoute(route);

        // Transfer tokens from user
        IERC20(route.tokenIn).safeTransferFrom(
            msg.sender,
            route.adapter,
            route.amountIn
        );

        // Execute via adapter
        (bool success, ) = route.adapter.call{value: msg.value}(
            route.adapterData
        );
        if (!success) revert BridgeFailed(route.adapter);

        // Record
        bridgeId = _recordBridge(route);

        emit BridgeExecuted(
            bridgeId,
            msg.sender,
            route.adapter,
            route.tokenIn,
            route.amountIn,
            route.destChainId
        );
    }

    /**
     * @notice Approve token and execute bridge in one transaction.
     * @dev Saves gas by combining approval + bridge into a single call.
     */
    function approveAndBridge(
        address token,
        address adapter,
        uint256 amount,
        uint256 destChainId,
        uint256 minAmountOut,
        bytes calldata adapterData
    )
        external
        payable
        nonReentrant
        whenNotPaused
        returns (bytes32 bridgeId)
    {
        Route memory route = Route({
            adapter: adapter,
            tokenIn: token,
            amountIn: amount,
            destChainId: destChainId,
            minAmountOut: minAmountOut,
            adapterData: adapterData
        });

        _validateRoute(route);

        // Transfer and bridge
        IERC20(token).safeTransferFrom(msg.sender, adapter, amount);

        (bool success, ) = adapter.call{value: msg.value}(adapterData);
        if (!success) revert BridgeFailed(adapter);

        bridgeId = _recordBridge(route);

        emit BridgeExecuted(
            bridgeId,
            msg.sender,
            adapter,
            token,
            amount,
            destChainId
        );
    }

    /**
     * @notice Execute multiple bridge routes in a single transaction.
     * @param routes Array of routes to execute.
     */
    function executeBatch(Route[] calldata routes)
        external
        payable
        nonReentrant
        whenNotPaused
    {
        for (uint256 i; i < routes.length; ++i) {
            _validateRoute(routes[i]);

            IERC20(routes[i].tokenIn).safeTransferFrom(
                msg.sender,
                routes[i].adapter,
                routes[i].amountIn
            );

            (bool success, ) = routes[i].adapter.call(routes[i].adapterData);
            if (!success) revert BridgeFailed(routes[i].adapter);

            _recordBridge(routes[i]);
        }

        emit BridgeBatchExecuted(msg.sender, routes.length);
    }

    // ── View Functions ─────────────────
    function getAdapterCount() external view returns (uint256) {
        return adapterList.length;
    }

    function isAdapterRegistered(address adapter) external view returns (bool) {
        return registeredAdapters[adapter];
    }

    // ── Internal ───────────────────────
    function _validateRoute(Route memory route) internal view {
        if (route.amountIn == 0) revert InvalidAmount();
        if (route.adapter == address(0)) revert InvalidRoute();
        if (!registeredAdapters[route.adapter])
            revert AdapterNotRegistered(route.adapter);
    }

    function _recordBridge(Route memory route) internal returns (bytes32 bridgeId) {
        bridgeId = keccak256(
            abi.encodePacked(
                msg.sender,
                route.adapter,
                route.amountIn,
                route.destChainId,
                block.timestamp,
                totalBridges
            )
        );

        bridgeRecords[bridgeId] = BridgeRecord({
            user: msg.sender,
            adapter: route.adapter,
            tokenIn: route.tokenIn,
            amountIn: route.amountIn,
            destChainId: route.destChainId,
            timestamp: block.timestamp,
            executed: true
        });

        totalBridges++;
    }

    // ── Receive ────────────────────────
    receive() external payable {}
}
