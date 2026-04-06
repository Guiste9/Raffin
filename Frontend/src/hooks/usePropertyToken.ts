import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { parseEther, formatEther } from 'viem'
import { PROPERTY_TOKEN_ADDRESS, PROPERTY_TOKEN_ABI } from '../lib/contracts'

export function usePropertyToken() {
  const { writeContract, data: txHash, isPending } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash: txHash })

  const { data: name } = useReadContract({
    address: PROPERTY_TOKEN_ADDRESS,
    abi: PROPERTY_TOKEN_ABI,
    functionName: 'name',
  })

  const { data: totalShares } = useReadContract({
    address: PROPERTY_TOKEN_ADDRESS,
    abi: PROPERTY_TOKEN_ABI,
    functionName: 'totalShares',
  })

  const { data: pricePerShare } = useReadContract({
    address: PROPERTY_TOKEN_ADDRESS,
    abi: PROPERTY_TOKEN_ABI,
    functionName: 'pricePerShare',
  })

  const { data: availableShares } = useReadContract({
    address: PROPERTY_TOKEN_ADDRESS,
    abi: PROPERTY_TOKEN_ABI,
    functionName: 'availableShares',
  })

  const { data: propertyDescription } = useReadContract({
    address: PROPERTY_TOKEN_ADDRESS,
    abi: PROPERTY_TOKEN_ABI,
    functionName: 'propertyDescription',
  })

  const { data: propertyAddress } = useReadContract({
    address: PROPERTY_TOKEN_ADDRESS,
    abi: PROPERTY_TOKEN_ABI,
    functionName: 'propertyAddress',
  })

  const { data: saleActive } = useReadContract({
    address: PROPERTY_TOKEN_ADDRESS,
    abi: PROPERTY_TOKEN_ABI,
    functionName: 'saleActive',
  })

  function purchaseShares(amount: number) {
    if (!pricePerShare) return
    const totalCost = BigInt(amount) * (pricePerShare as bigint)

    writeContract({
      address: PROPERTY_TOKEN_ADDRESS,
      abi: PROPERTY_TOKEN_ABI,
      functionName: 'purchaseShares',
      args: [BigInt(amount)],
      value: totalCost,
    })
  }

  return {
    name: name as string | undefined,
    totalShares: totalShares ? Number(totalShares) : undefined,
    pricePerShare: pricePerShare ? formatEther(pricePerShare as bigint) : undefined,
    availableShares: availableShares ? Number(availableShares) : undefined,
    propertyDescription: propertyDescription as string | undefined,
    propertyAddress: propertyAddress as string | undefined,
    saleActive: saleActive as boolean | undefined,
    purchaseShares,
    isPending,
    isConfirming,
    isSuccess,
    txHash,
  }
}