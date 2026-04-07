import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import { parseEther } from "viem";

const PropertyMarketModule = buildModule("PropertyMarketModule", (m) => {
  const propertyMarket = m.contract("PropertyMarket", [
    "0xCB71915479db29136E6eA6bc92D385Ee3CFFA2C0", // PropertyToken address
    parseEther("0.01"),                            // dailyRate (0.01 ETH por noite)
    "0xB8F5C0268801E8a6eA51FC016d0420Fccedc3c5D", // platformWallet (sua carteira)
  ]);

  return { propertyMarket };
});

export default PropertyMarketModule;