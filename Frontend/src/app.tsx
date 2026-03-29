import { WagmiProvider, createConfig, http } from 'wagmi'
import { sepolia } from 'wagmi/chains'
import { injected } from 'wagmi/connectors'
import { useAccount, useConnect, useDisconnect, useBalance } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { formatEther } from 'viem'

const queryClient = new QueryClient()

const config = createConfig({
  chains: [sepolia],
  connectors: [injected()],
  transports: {
    [sepolia.id]: http("https://burned-greatest-sunset.ethereum-sepolia.quiknode.pro/f7a3f5095097a71ddb8baf2fbb19f628d1cf2447/"),
  },
})

function Profile() {
  const { address, isConnected } = useAccount()
  const { connectAsync, connectors, isPending } = useConnect()
  const { disconnect } = useDisconnect()

  const { data, isLoading } = useBalance({
    address,
  })

  if (isConnected) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="text-center">
          <p>Connected to {address}</p>

          <p>
            Balance:{" "}
            {isLoading
              ? "Loading..."
              : data
              ? formatEther(data.value)
              : "0"}{" "}
            ETH
          </p>

          <button className="btn btn-primary mt-3" onClick={() => disconnect()}>
            Disconnect
          </button>
        </div>
      </div>
    )
  }

  if (isPending) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <p>Conectando...</p>
      </div>
    )
  }

  return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      {connectors.map((connector) => (
        <button
          key={connector.uid}
          className="btn btn-primary"
          onClick={() => connectAsync({ connector })}
        >
          Conectar com {connector.name}
        </button>
      ))}
    </div>
  )
}

function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <Profile />
      </QueryClientProvider>
    </WagmiProvider>
  )
}

export default App