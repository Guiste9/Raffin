import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const PropertyFactoryModule = buildModule("PropertyFactoryModule", (m) => {
  const propertyFactory = m.contract("PropertyFactory", []);
  return { propertyFactory };
});

export default PropertyFactoryModule;