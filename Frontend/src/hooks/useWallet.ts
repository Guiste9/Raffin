import { useAccount, useConnect, useDisconnect, useBalance } from 'wagmi'
import { formatEther } from 'viem'

export function useWallet() {
  const { address, isConnected } = useAccount()
  const { connectAsync, connectors, isPending } = useConnect()
  const { disconnect } = useDisconnect()
  const { data: balanceData, isLoading: balanceLoading } = useBalance({ address })

  const balance = balanceLoading
    ? 'Carregando...'
    : balanceData
    ? `${parseFloat(formatEther(balanceData.value)).toFixed(4)} ETH`
    : '0 ETH'

  return {
    address,
    isConnected,
    isPending,
    connectors,
    balance,
    connectAsync,
    disconnect,
  }
}