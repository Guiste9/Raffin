import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import { parseEther } from "viem";

const PropertyTokenModule = buildModule("PropertyTokenModule", (m) => {
  const propertyToken = m.contract("PropertyToken", [
    "Apartamento Meireles",         // name
    "APTMEI",                       // symbol
    20n,                            // totalShares
    parseEther("0.05"),             // pricePerShare
    "Meireles, Fortaleza, CE",      // propertyAddress
    "ipfs://placeholder",           // propertyImageIPFS
    "Apartamento de luxo com vista para o mar", // description
  ]);

  return { propertyToken };
});

export default PropertyTokenModule;