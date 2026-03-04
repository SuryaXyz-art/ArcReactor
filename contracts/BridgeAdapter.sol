// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title BridgeAdapter
 * @notice Abstract adapter interface for bridge providers.
 * @dev Each bridge provider (Thirdweb, LayerZero, Axelar) implements this
 *      interface to standardize quote fetching and bridge execution.
 */
abstract contract BridgeAdapter {
    // ── Types ──────────────────────────
    struct Quote {
        uint256 amountOut;
        uint256 bridgeFee;
        uint256 estimatedGas;
        uint256 estimatedTime; // seconds
    }

    // ── State ──────────────────────────
    string public providerName;
    address public router; // LiquidityRouter address
    bool public isActive;

    // ── Events ─────────────────────────
    event BridgeInitiated(
        address indexed sender,
        address token,
        uint256 amount,
        uint256 destChainId,
        bytes32 bridgeId
    );
    event BridgeCompleted(bytes32 indexed bridgeId);

    // ── Modifiers ──────────────────────
    modifier onlyRouter() {
        require(msg.sender == router, "Only router");
        _;
    }

    modifier whenActive() {
        require(isActive, "Adapter inactive");
        _;
    }

    // ── Constructor ────────────────────
    constructor(string memory _name, address _router) {
        providerName = _name;
        router = _router;
        isActive = true;
    }

    // ── Abstract Functions ─────────────
    /**
     * @notice Get a quote for bridging tokens.
     * @param token The token to bridge.
     * @param amount The amount to bridge.
     * @param destChainId The destination chain ID.
     * @return quote The bridge quote.
     */
    function getQuote(
        address token,
        uint256 amount,
        uint256 destChainId
    ) external view virtual returns (Quote memory quote);

    /**
     * @notice Execute a bridge through this provider.
     * @param token The token to bridge.
     * @param amount The amount to bridge.
     * @param destChainId The destination chain ID.
     * @param recipient The recipient on the destination chain.
     * @param data Provider-specific calldata.
     */
    function executeBridge(
        address token,
        uint256 amount,
        uint256 destChainId,
        address recipient,
        bytes calldata data
    ) external payable virtual onlyRouter whenActive returns (bytes32 bridgeId);

    // ── Admin ──────────────────────────
    function setActive(bool _active) external {
        require(msg.sender == router, "Only router");
        isActive = _active;
    }
}

/**
 * @title ThirdwebAdapter
 * @notice Adapter for Thirdweb Bridge on Arc Testnet.
 */
contract ThirdwebAdapter is BridgeAdapter {
    constructor(address _router) BridgeAdapter("Thirdweb Bridge", _router) {}

    function getQuote(
        address /* token */,
        uint256 amount,
        uint256 /* destChainId */
    ) external pure override returns (Quote memory) {
        // 0.1% fee + base fee
        uint256 fee = (amount * 10) / 10000 + 500000; // 6 decimals
        return Quote({
            amountOut: amount - fee,
            bridgeFee: fee,
            estimatedGas: 200000,
            estimatedTime: 180 // 3 minutes
        });
    }

    function executeBridge(
        address token,
        uint256 amount,
        uint256 destChainId,
        address recipient,
        bytes calldata /* data */
    ) external payable override onlyRouter whenActive returns (bytes32) {
        bytes32 bridgeId = keccak256(
            abi.encodePacked(token, amount, destChainId, recipient, block.timestamp)
        );
        emit BridgeInitiated(recipient, token, amount, destChainId, bridgeId);
        return bridgeId;
    }
}

/**
 * @title LayerZeroAdapter
 * @notice Adapter for LayerZero bridge.
 */
contract LayerZeroAdapter is BridgeAdapter {
    constructor(address _router) BridgeAdapter("LayerZero", _router) {}

    function getQuote(
        address /* token */,
        uint256 amount,
        uint256 /* destChainId */
    ) external pure override returns (Quote memory) {
        uint256 fee = (amount * 20) / 10000 + 300000;
        return Quote({
            amountOut: amount - fee,
            bridgeFee: fee,
            estimatedGas: 250000,
            estimatedTime: 420 // 7 minutes
        });
    }

    function executeBridge(
        address token,
        uint256 amount,
        uint256 destChainId,
        address recipient,
        bytes calldata /* data */
    ) external payable override onlyRouter whenActive returns (bytes32) {
        bytes32 bridgeId = keccak256(
            abi.encodePacked(token, amount, destChainId, recipient, block.timestamp)
        );
        emit BridgeInitiated(recipient, token, amount, destChainId, bridgeId);
        return bridgeId;
    }
}

/**
 * @title AxelarAdapter
 * @notice Adapter for Axelar GMP bridge.
 */
contract AxelarAdapter is BridgeAdapter {
    constructor(address _router) BridgeAdapter("Axelar", _router) {}

    function getQuote(
        address /* token */,
        uint256 amount,
        uint256 /* destChainId */
    ) external pure override returns (Quote memory) {
        uint256 fee = (amount * 15) / 10000 + 1000000;
        return Quote({
            amountOut: amount - fee,
            bridgeFee: fee,
            estimatedGas: 300000,
            estimatedTime: 600 // 10 minutes
        });
    }

    function executeBridge(
        address token,
        uint256 amount,
        uint256 destChainId,
        address recipient,
        bytes calldata /* data */
    ) external payable override onlyRouter whenActive returns (bytes32) {
        bytes32 bridgeId = keccak256(
            abi.encodePacked(token, amount, destChainId, recipient, block.timestamp)
        );
        emit BridgeInitiated(recipient, token, amount, destChainId, bridgeId);
        return bridgeId;
    }
}
