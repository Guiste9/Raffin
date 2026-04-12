export async function uploadImageToIPFS(file: File): Promise<string> {
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
        method: 'POST',
        headers: {
            'pinata_api_key': import.meta.env.VITE_PINATA_API_KEY,
            'pinata_secret_api_key': import.meta.env.VITE_PINATA_SECRET,
        },
        body: formData
    })

    if (!response.ok) {
        throw new Error(`Failed to upload image: ${response.statusText}`)
    }

    const data = await response.json()
    return `ipfs://${data.IpfsHash}`
}

export function ipfsToHttp(ipfsUrl: string): string {
    if (ipfsUrl.startsWith('ipfs://')) {
        return `https://gateway.pinata.cloud/ipfs/${ipfsUrl.replace('ipfs://', '')}`
    }
    return ipfsUrl
}