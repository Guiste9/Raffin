import { useState, useEffect } from 'react'
import { graphClient, GET_ALL_PROPERTIES, GET_PROPERTIES_BY_OWNER, GET_PURCHASES_BY_BUYER } from '../lib/graphql'
export interface GraphProperty {
  id: string
  address: string
  name: string
  symbol: string
  owner: string
  totalShares: string
  pricePerShare: string
  propertyAddress: string
  propertyImageIPFS: string
  propertyDescription: string
  saleActive: boolean
  createdAt: string
}

export interface GraphPurchase {
  id: string
  buyer: string
  amount: string
  totalPaid: string
  createdAt: string
  property: GraphProperty
}

export function useAllProperties() {
  const [properties, setProperties] = useState<GraphProperty[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetch() {
      try {
        const data: any = await graphClient.request(GET_ALL_PROPERTIES)
        setProperties(data.properties)
      } catch (err) {
        setError('Erro ao buscar imóveis')
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }
    fetch()
  }, [])

  return { properties, isLoading, error }
}

export function useMyProperties(owner: string | undefined) {
  const [properties, setProperties] = useState<GraphProperty[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!owner) return

    async function fetch() {
      try {
        const data: any = await graphClient.request(GET_PROPERTIES_BY_OWNER, {
          owner: owner.toLowerCase(),
        })
        setProperties(data.properties)
      } catch (err) {
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }
    fetch()
  }, [owner])

  return { properties, isLoading }
}

export function useMyPurchases(buyer: string | undefined) {
  const [purchases, setPurchases] = useState<GraphPurchase[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!buyer) return

    async function fetch() {
      try {
        const data: any = await graphClient.request(GET_PURCHASES_BY_BUYER, {
          buyer: buyer.toLowerCase(),
        })
        setPurchases(data.sharePurchases)
      } catch (err) {
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }
    fetch()
  }, [buyer])

  return { purchases, isLoading }
}