import { isAddress } from 'ethers'

export const isValidUrl = (url: string) => {
    try {
        new URL(url)
        return true
    } catch {
        return false
    }
}

export const isValidEthereumAddress = (address: unknown) => isAddress(address)
