// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title PriceOracle
 * @notice USDC/EURC price oracle for Arc Testnet.
 * @dev Owner-updateable rate feed for testnet usage. In production,
 *      this would integrate with Chainlink or other oracle providers.
 */
contract PriceOracle is Ownable {
    // ── Types ──────────────────────────
    struct Price {
        uint256 rate;        // Rate with 8 decimals (e.g., 92000000 = 0.92 EURC/USDC)
        uint256 timestamp;
        bool isValid;
    }

    // ── State ──────────────────────────
    mapping(bytes32 => Price) public prices;
    uint256 public stalenessPeriod = 1 hours;

    // ── Events ─────────────────────────
    event PriceUpdated(
        address indexed tokenA,
        address indexed tokenB,
        uint256 rate,
        uint256 timestamp
    );
    event StalenessPeriodUpdated(uint256 newPeriod);

    // ── Errors ─────────────────────────
    error PriceStale(bytes32 pairId, uint256 lastUpdate);
    error PriceNotFound(bytes32 pairId);

    // ── Constructor ────────────────────
    constructor() Ownable(msg.sender) {}

    // ── Admin ──────────────────────────
    /**
     * @notice Update the price for a token pair.
     * @param tokenA First token address.
     * @param tokenB Second token address.
     * @param rate Price rate with 8 decimals.
     */
    function updatePrice(
        address tokenA,
        address tokenB,
        uint256 rate
    ) external onlyOwner {
        bytes32 pairId = _getPairId(tokenA, tokenB);
        prices[pairId] = Price({
            rate: rate,
            timestamp: block.timestamp,
            isValid: true
        });
        emit PriceUpdated(tokenA, tokenB, rate, block.timestamp);
    }

    /**
     * @notice Batch update prices for multiple pairs.
     */
    function batchUpdatePrices(
        address[] calldata tokensA,
        address[] calldata tokensB,
        uint256[] calldata rates
    ) external onlyOwner {
        require(
            tokensA.length == tokensB.length &&
            tokensB.length == rates.length,
            "Length mismatch"
        );
        for (uint256 i; i < tokensA.length; ++i) {
            bytes32 pairId = _getPairId(tokensA[i], tokensB[i]);
            prices[pairId] = Price({
                rate: rates[i],
                timestamp: block.timestamp,
                isValid: true
            });
            emit PriceUpdated(tokensA[i], tokensB[i], rates[i], block.timestamp);
        }
    }

    function setStaleness(uint256 period) external onlyOwner {
        stalenessPeriod = period;
        emit StalenessPeriodUpdated(period);
    }

    // ── View Functions ─────────────────
    /**
     * @notice Get the price for a token pair.
     * @return rate The price rate with 8 decimals.
     */
    function getPrice(
        address tokenA,
        address tokenB
    ) external view returns (uint256 rate) {
        bytes32 pairId = _getPairId(tokenA, tokenB);
        Price memory price = prices[pairId];

        if (!price.isValid) revert PriceNotFound(pairId);
        if (block.timestamp - price.timestamp > stalenessPeriod)
            revert PriceStale(pairId, price.timestamp);

        return price.rate;
    }

    /**
     * @notice Check if a price feed is fresh.
     */
    function isPriceFresh(
        address tokenA,
        address tokenB
    ) external view returns (bool) {
        bytes32 pairId = _getPairId(tokenA, tokenB);
        Price memory price = prices[pairId];
        return price.isValid && (block.timestamp - price.timestamp <= stalenessPeriod);
    }

    /**
     * @notice Convert amount from tokenA to tokenB.
     */
    function convert(
        address tokenA,
        address tokenB,
        uint256 amount
    ) external view returns (uint256) {
        bytes32 pairId = _getPairId(tokenA, tokenB);
        Price memory price = prices[pairId];

        if (!price.isValid) revert PriceNotFound(pairId);
        if (block.timestamp - price.timestamp > stalenessPeriod)
            revert PriceStale(pairId, price.timestamp);

        return (amount * price.rate) / 1e8;
    }

    // ── Internal ───────────────────────
    function _getPairId(
        address tokenA,
        address tokenB
    ) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked(tokenA, tokenB));
    }
}
