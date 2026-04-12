import { useReadContract } from 'wagmi'
import { PROPERTY_TOKEN_ABI } from '../lib/contracts'

export interface StoredProperty {
  address: `0x${string}`
  createdAt: string
}

export function getStoredProperties(): StoredProperty[] {
  const stored = localStorage.getItem('myProperties')
  return stored ? JSON.parse(stored) : []
}

export function usePropertyDetails(address: `0x${string}`) {
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

  const { data: propertyImageIPFS } = useReadContract({
    address,
    abi: PROPERTY_TOKEN_ABI,
    functionName: 'propertyImageIPFS',
  })

  const { data: saleActive } = useReadContract({
    address,
    abi: PROPERTY_TOKEN_ABI,
    functionName: 'saleActive',
  })

  return {
    name: name as string | undefined,
    totalShares: totalShares ? Number(totalShares) : undefined,
    pricePerShare: pricePerShare as bigint | undefined,
    availableShares: availableShares ? Number(availableShares) : undefined,
    propertyDescription: propertyDescription as string | undefined,
    propertyAddress: propertyAddress as string | undefined,
    propertyImageIPFS: propertyImageIPFS as string | undefined,
    saleActive: saleActive as boolean | undefined,
  }
}