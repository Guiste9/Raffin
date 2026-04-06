import { createConfig, http } from 'wagmi'
import { sepolia } from 'wagmi/chains'
import { injected, coinbaseWallet, metaMask } from 'wagmi/connectors'

export const config = createConfig({
  chains: [sepolia],
  connectors: [
    injected(),
    metaMask(),
    coinbaseWallet({ appName: 'RaffChain' }),
  ],
  transports: {
    [sepolia.id]: http(),
  },
})