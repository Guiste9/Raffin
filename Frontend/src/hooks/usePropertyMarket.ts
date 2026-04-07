import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { formatEther, parseEther } from 'viem'
import { PROPERTY_MARKET_ADDRESS, PROPERTY_MARKET_ABI } from '../lib/contracts'

export function usePropertyMarket() {
  const { writeContract, data: txHash, isPending } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash: txHash })

  const { data: dailyRate, isLoading: dailyRateLoading, error: dailyRateError } = useReadContract({
    address: PROPERTY_MARKET_ADDRESS,
    abi: PROPERTY_MARKET_ABI,
    functionName: 'dailyRate',
    query: {
      retry: 3,
      retryDelay: 1000,
    }
  })

  const { data: bookingCount } = useReadContract({
    address: PROPERTY_MARKET_ADDRESS,
    abi: PROPERTY_MARKET_ABI,
    functionName: 'bookingCount',
  })

  const { data: maintenanceFund } = useReadContract({
    address: PROPERTY_MARKET_ADDRESS,
    abi: PROPERTY_MARKET_ABI,
    functionName: 'maintenanceFund',
  })

  console.log('dailyRate raw:', dailyRate)
  console.log('dailyRate error:', dailyRateError)

  function bookStay(checkIn: Date, checkOut: Date) {
    if (!dailyRate) {
      alert('Aguarde o carregamento da diária.')
      return
    }

    const checkInTimestamp = BigInt(Math.floor(checkIn.getTime() / 1000))
    const checkOutTimestamp = BigInt(Math.floor(checkOut.getTime() / 1000))
    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))
    const totalCost = BigInt(nights) * (dailyRate as bigint)

    writeContract({
      address: PROPERTY_MARKET_ADDRESS,
      abi: PROPERTY_MARKET_ABI,
      functionName: 'bookStay',
      args: [checkInTimestamp, checkOutTimestamp],
      value: totalCost,
    })
  }

  function claimRent() {
    writeContract({
      address: PROPERTY_MARKET_ADDRESS,
      abi: PROPERTY_MARKET_ABI,
      functionName: 'claimRent',
    })
  }

  function createSaleOffer(shares: number, pricePerShare: string) {
    writeContract({
      address: PROPERTY_MARKET_ADDRESS,
      abi: PROPERTY_MARKET_ABI,
      functionName: 'createSaleOffer',
      args: [BigInt(shares), parseEther(pricePerShare)],
    })
  }

  const dailyRateFormatted = dailyRate ? formatEther(dailyRate as bigint) : undefined

  return {
    dailyRate: dailyRateFormatted,
    dailyRateRaw: dailyRate as bigint | undefined,
    dailyRateLoading,
    dailyRateError,
    bookingCount: bookingCount ? Number(bookingCount) : 0,
    maintenanceFund: maintenanceFund ? formatEther(maintenanceFund as bigint) : '0',
    bookStay,
    claimRent,
    createSaleOffer,
    isPending,
    isConfirming,
    isSuccess,
    txHash,
  }
}