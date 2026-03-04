import { ethers } from "hardhat";

async function main() {
    console.log("🚀 Deploying ARC Liquidity Router contracts...\n");

    const [deployer] = await ethers.getSigners();
    console.log("Deployer:", deployer.address);
    console.log("Balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "\n");

    // 1. Deploy LiquidityRouter
    console.log("1️⃣  Deploying LiquidityRouter...");
    const Router = await ethers.getContractFactory("LiquidityRouter");
    const router = await Router.deploy();
    await router.waitForDeployment();
    const routerAddr = await router.getAddress();
    console.log("   ✅ LiquidityRouter:", routerAddr);

    // 2. Deploy PriceOracle
    console.log("2️⃣  Deploying PriceOracle...");
    const Oracle = await ethers.getContractFactory("PriceOracle");
    const oracle = await Oracle.deploy();
    await oracle.waitForDeployment();
    const oracleAddr = await oracle.getAddress();
    console.log("   ✅ PriceOracle:", oracleAddr);

    // 3. Deploy GasOptimizer
    console.log("3️⃣  Deploying GasOptimizer...");
    const Optimizer = await ethers.getContractFactory("GasOptimizer");
    const optimizer = await Optimizer.deploy();
    await optimizer.waitForDeployment();
    const optimizerAddr = await optimizer.getAddress();
    console.log("   ✅ GasOptimizer:", optimizerAddr);

    // 4. Deploy Bridge Adapters
    console.log("4️⃣  Deploying Bridge Adapters...");

    const ThirdwebAdapter = await ethers.getContractFactory("ThirdwebAdapter");
    const twAdapter = await ThirdwebAdapter.deploy(routerAddr);
    await twAdapter.waitForDeployment();
    const twAddr = await twAdapter.getAddress();
    console.log("   ✅ ThirdwebAdapter:", twAddr);

    const LayerZeroAdapter = await ethers.getContractFactory("LayerZeroAdapter");
    const lzAdapter = await LayerZeroAdapter.deploy(routerAddr);
    await lzAdapter.waitForDeployment();
    const lzAddr = await lzAdapter.getAddress();
    console.log("   ✅ LayerZeroAdapter:", lzAddr);

    const AxelarAdapter = await ethers.getContractFactory("AxelarAdapter");
    const axAdapter = await AxelarAdapter.deploy(routerAddr);
    await axAdapter.waitForDeployment();
    const axAddr = await axAdapter.getAddress();
    console.log("   ✅ AxelarAdapter:", axAddr);

    // 5. Register adapters with router
    console.log("\n5️⃣  Registering adapters...");
    await router.registerAdapter(twAddr, "Thirdweb Bridge");
    await router.registerAdapter(lzAddr, "LayerZero");
    await router.registerAdapter(axAddr, "Axelar");
    console.log("   ✅ All adapters registered");

    // 6. Set initial USDC/EURC price
    console.log("6️⃣  Setting initial prices...");
    const usdcAddr = "0x3600000000000000000000000000000000000000";
    const eurcAddr = "0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a";
    await oracle.updatePrice(usdcAddr, eurcAddr, 92000000); // 0.92 EURC/USDC
    console.log("   ✅ USDC/EURC price set to 0.92");

    // Summary
    console.log("\n" + "=".repeat(50));
    console.log("📋 DEPLOYMENT SUMMARY");
    console.log("=".repeat(50));
    console.log(`LiquidityRouter:  ${routerAddr}`);
    console.log(`PriceOracle:      ${oracleAddr}`);
    console.log(`GasOptimizer:     ${optimizerAddr}`);
    console.log(`ThirdwebAdapter:  ${twAddr}`);
    console.log(`LayerZeroAdapter: ${lzAddr}`);
    console.log(`AxelarAdapter:    ${axAddr}`);
    console.log("=".repeat(50));
    console.log("\n✨ Deployment complete!");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
