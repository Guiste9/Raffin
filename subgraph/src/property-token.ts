import {
  SharesPurchased as SharesPurchasedEvent,
  SaleStatusChanged as SaleStatusChangedEvent,
  PropertyToken,
  Transfer as TransferEvent,
} from '../generated/PropertyToken/PropertyToken'
import { Property, SharePurchase } from '../generated/schema'


export function handleTransfer(event: TransferEvent): void {
  // Captura apenas o mint inicial (de address(0) para o dono)
  let zeroAddress = '0x0000000000000000000000000000000000000000'
  if (event.params.from.toHexString() != zeroAddress) return

  let contract = PropertyToken.bind(event.address)
  let property = Property.load(event.address.toHexString())

  if (!property) {
    property = new Property(event.address.toHexString())
    property.address = event.address.toHexString()
    property.name = contract.name()
    property.symbol = contract.symbol()
    property.owner = contract.owner().toHexString()
    property.totalShares = contract.totalShares()
    property.pricePerShare = contract.pricePerShare()
    property.propertyAddress = contract.propertyAddress()
    property.propertyImageIPFS = contract.propertyImageIPFS()
    property.propertyDescription = contract.propertyDescription()
    property.saleActive = contract.saleActive()
    property.createdAt = event.block.timestamp
    property.save()
  }
}

export function handleSharesPurchased(event: SharesPurchasedEvent): void {
  let contract = PropertyToken.bind(event.address)

  let property = Property.load(event.address.toHexString())

  if (!property) {
    property = new Property(event.address.toHexString())
    property.address = event.address.toHexString()
    property.name = contract.name()
    property.symbol = contract.symbol()
    property.owner = contract.owner().toHexString()
    property.totalShares = contract.totalShares()
    property.pricePerShare = contract.pricePerShare()
    property.propertyAddress = contract.propertyAddress()
    property.propertyImageIPFS = contract.propertyImageIPFS()
    property.propertyDescription = contract.propertyDescription()
    property.saleActive = contract.saleActive()
    property.createdAt = event.block.timestamp
  }

  property.save()

  let purchaseId = event.transaction.hash.toHexString() + '-' + event.logIndex.toString()
  let purchase = new SharePurchase(purchaseId)
  purchase.property = property.id
  purchase.buyer = event.params.buyer.toHexString()
  purchase.amount = event.params.bought
  purchase.totalPaid = event.params.amountPaid
  purchase.createdAt = event.block.timestamp
  purchase.save()
}

export function handleSaleStatusChanged(event: SaleStatusChangedEvent): void {
  let property = Property.load(event.address.toHexString())

  if (property) {
    property.saleActive = event.params.isActive
    property.save()
  }
}