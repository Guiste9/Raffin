import { useMemo } from 'react'
import { useReadContract, useReadContracts, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { formatEther, type Abi } from 'viem'
import { PROPERTY_MARKET_ADDRESS, PROPERTY_MARKET_ABI } from '../lib/contracts'

export interface Booking {
  id: number
  guest: `0x${string}`
  checkIn: bigint
  checkOut: bigint
  totalPaid: bigint
  cancelled: boolean
}

export type BookingStatus = 'active' | 'in_progress' | 'completed' | 'cancelled'

export function getBookingStatus(booking: Booking, nowSeconds = Math.floor(Date.now() / 1000)): BookingStatus {
  if (booking.cancelled) return 'cancelled'
  const now = BigInt(nowSeconds)
  if (booking.checkIn > now) return 'active'
  if (booking.checkOut > now) return 'in_progress'
  return 'completed'
}

export function canCancelBooking(booking: Booking, nowSeconds = Math.floor(Date.now() / 1000)): boolean {
  return getBookingStatus(booking, nowSeconds) === 'active'
}

export function getRefundAmount(totalPaid: bigint): bigint {
  return (totalPaid * 80n) / 100n
}

export function formatBookingDate(timestamp: bigint): string {
  return new Date(Number(timestamp) * 1000).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export function getBookingNights(checkIn: bigint, checkOut: bigint): number {
  return Number((checkOut - checkIn) / 86400n)
}

export function useMyBookings(address?: `0x${string}`) {
  const { data: bookingCount, refetch: refetchCount } = useReadContract({
    address: PROPERTY_MARKET_ADDRESS,
    abi: PROPERTY_MARKET_ABI,
    functionName: 'bookingCount',
  })

  const count = bookingCount ? Number(bookingCount) : 0

  const contracts = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        address: PROPERTY_MARKET_ADDRESS,
        abi: PROPERTY_MARKET_ABI as Abi,
        functionName: 'bookings' as const,
        args: [BigInt(i)] as const,
      })),
    [count]
  )

  const { data: bookingsData, isLoading, refetch: refetchBookings } = useReadContracts({
    contracts,
    query: { enabled: count > 0 },
  })

  const { writeContract, data: txHash, isPending, reset } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash: txHash })

  const allBookings = useMemo<Booking[]>(() => {
    if (!bookingsData) return []

    return bookingsData
      .map((item, index) => {
        if (item.status !== 'success' || !item.result) return null
        const [guest, checkIn, checkOut, totalPaid, cancelled] = item.result as readonly [
          `0x${string}`,
          bigint,
          bigint,
          bigint,
          boolean,
        ]
        return { id: index, guest, checkIn, checkOut, totalPaid, cancelled }
      })
      .filter((b): b is Booking => b !== null)
  }, [bookingsData])

  const myBookings = useMemo(() => {
    if (!address) return []
    const normalized = address.toLowerCase()
    return allBookings.filter((b) => b.guest.toLowerCase() === normalized)
  }, [allBookings, address])

  const activeBookings = useMemo(
    () => myBookings.filter((b) => canCancelBooking(b)),
    [myBookings]
  )

  const historyBookings = useMemo(
    () => myBookings.filter((b) => !canCancelBooking(b)),
    [myBookings]
  )

  function cancelBooking(bookingId: number) {
    writeContract({
      address: PROPERTY_MARKET_ADDRESS,
      abi: PROPERTY_MARKET_ABI,
      functionName: 'cancelBooking',
      args: [BigInt(bookingId)],
    })
  }

  function refetch() {
    refetchCount()
    refetchBookings()
  }

  return {
    bookings: myBookings,
    activeBookings,
    historyBookings,
    bookingCount: count,
    isLoading,
    cancelBooking,
    isPending,
    isConfirming,
    isSuccess,
    txHash,
    reset,
    refetch,
    formatRefund: (totalPaid: bigint) => formatEther(getRefundAmount(totalPaid)),
    formatPaid: (totalPaid: bigint) => formatEther(totalPaid),
  }
}
