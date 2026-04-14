import { useState, useEffect } from 'react'
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { parseEther } from 'viem'
import { uploadImageToIPFS } from '../lib/pinata'
import { PROPERTY_FACTORY_ADDRESS, PROPERTY_FACTORY_ABI } from '../lib/contracts'

export interface CreatePropertyForm {
  name: string
  symbol: string
  description: string
  location: string
  totalShares: string
  pricePerShare: string
  dailyRate: string
  image: File | null
}

export function useCreateProperty() {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [ipfsHash, setIpfsHash] = useState<string | null>(null)

  const { writeContract, data: txHash, isPending } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  })

  async function createProperty(form: CreatePropertyForm) {
    setUploadError(null)

    if (!form.image) {
      setUploadError('Selecione uma imagem.')
      return
    }

    try {
      console.log('iniciando upload IPFS...')
      setIsUploading(true)
      const imageIPFS = await uploadImageToIPFS(form.image)
      console.log('upload concluído:', imageIPFS)
      setIpfsHash(imageIPFS)
      setIsUploading(false)

      console.log('criando imóvel via Factory...')
      writeContract({
        address: PROPERTY_FACTORY_ADDRESS,
        abi: PROPERTY_FACTORY_ABI,
        functionName: 'createProperty',
        args: [
          form.name,
          form.symbol.toUpperCase(),
          BigInt(form.totalShares),
          parseEther(form.pricePerShare),
          form.location,
          imageIPFS,
          form.description,
        ],
      })
      console.log('writeContract chamado')
    } catch (err) {
      console.error('erro detalhado:', err)
      setIsUploading(false)
      setUploadError(`Erro: ${err instanceof Error ? err.message : 'Falha desconhecida'}`)
    }
  }

  return {
    createProperty,
    isUploading,
    isPending,
    isConfirming,
    isSuccess,
    uploadError,
    ipfsHash,
    txHash,
  }
}