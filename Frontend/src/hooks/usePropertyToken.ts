import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { formatEther } from 'viem'
import { PROPERTY_TOKEN_ADDRESS, PROPERTY_TOKEN_ABI } from '../lib/contracts'

export function usePropertyToken(contractAddress?: `0x${string}`) {
  const address = contractAddress ?? PROPERTY_TOKEN_ADDRESS

  const { writeContract, data: txHash, isPending } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash: txHash })

  const { data: name } = useReadContract({
    address,
    abi: PROPERTY_TOKEN_ABI,
    functionName: 'name',
  })

  const { data: totalShares } = useReadContract({
    address,
    abi: PROPERTY_TOKEN_ABI,
    functionName: 'totalShares',
  })

  const { data: pricePerShare } = useReadContract({
    address,
    abi: PROPERTY_TOKEN_ABI,
    functionName: 'pricePerShare',
  })

  const { data: availableShares } = useReadContract({
    address,
    abi: PROPERTY_TOKEN_ABI,
    functionName: 'availableShares',
  })

  const { data: propertyDescription } = useReadContract({
    address,
    abi: PROPERTY_TOKEN_ABI,
    functionName: 'propertyDescription',
  })

  const { data: propertyAddress } = useReadContract({
    address,
    abi: PROPERTY_TOKEN_ABI,
    functionName: 'propertyAddress',
  })

  const { data: saleActive } = useReadContract({
    address,
    abi: PROPERTY_TOKEN_ABI,
    functionName: 'saleActive',
  })

  const { data: propertyImageIPFS } = useReadContract({
    address,
    abi: PROPERTY_TOKEN_ABI,
    functionName: 'propertyImageIPFS',
  })

  function purchaseShares(amount: number) {
    if (!pricePerShare) return
    const totalCost = BigInt(amount) * (pricePerShare as bigint)

    writeContract({
      address,
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
    propertyImageIPFS: propertyImageIPFS as string | undefined,
    saleActive: saleActive as boolean | undefined,
    purchaseShares,
    isPending,
    isConfirming,
    isSuccess,
    txHash,
  }
}