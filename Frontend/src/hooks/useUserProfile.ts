import { useReadContract } from 'wagmi'
import { formatEther } from 'viem'
import { PROPERTY_TOKEN_ADDRESS, PROPERTY_TOKEN_ABI } from '../lib/contracts'

export function useUserProfile(address: `0x${string}` | undefined) {
  const { data: balance, isLoading: balanceLoading } = useReadContract({
    address: PROPERTY_TOKEN_ADDRESS,
    abi: PROPERTY_TOKEN_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  })

  const { data: name } = useReadContract({
    address: PROPERTY_TOKEN_ADDRESS,
    abi: PROPERTY_TOKEN_ABI,
    functionName: 'name',
  })

  const { data: pricePerShare } = useReadContract({
    address: PROPERTY_TOKEN_ADDRESS,
    abi: PROPERTY_TOKEN_ABI,
    functionName: 'pricePerShare',
  })

  const { data: totalShares } = useReadContract({
    address: PROPERTY_TOKEN_ADDRESS,
    abi: PROPERTY_TOKEN_ABI,
    functionName: 'totalShares',
  })

  const { data: decimals } = useReadContract({
    address: PROPERTY_TOKEN_ADDRESS,
    abi: PROPERTY_TOKEN_ABI,
    functionName: 'decimals',
  })

  // Converte corretamente levando em conta os decimais do token
  const dec = decimals ? Number(decimals) : 18
  const sharesOwned = balance
    ? Number(BigInt(balance as bigint) / BigInt(10 ** dec))
    : 0

  const shareValue = sharesOwned && pricePerShare
    ? (sharesOwned * parseFloat(formatEther(pricePerShare as bigint))).toFixed(4)
    : '0'

  const ownershipPercent = sharesOwned && totalShares
    ? ((sharesOwned / Number(totalShares as bigint)) * 100).toFixed(1)
    : '0'

  return {
    sharesOwned,
    shareValue,
    ownershipPercent,
    propertyName: name as string | undefined,
    isLoading: balanceLoading,
  }
}