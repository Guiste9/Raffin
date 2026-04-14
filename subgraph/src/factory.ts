import { PropertyCreated as PropertyCreatedEvent } from '../generated/PropertyFactory/PropertyFactory'
import { PropertyToken as PropertyTokenTemplate } from '../generated/templates'
import { Property } from '../generated/schema'
import { PropertyToken } from '../generated/PropertyFactory/PropertyToken'

export function handlePropertyCreated(event: PropertyCreatedEvent): void {
  let contract = PropertyToken.bind(event.params.propertyAddress)

  let property = new Property(event.params.propertyAddress.toHexString())
  property.address = event.params.propertyAddress.toHexString()
  property.name = contract.name()
  property.symbol = contract.symbol()
  property.owner = event.params.owner.toHexString()
  property.totalShares = contract.totalShares()
  property.pricePerShare = contract.pricePerShare()
  property.propertyAddress = contract.propertyAddress()
  property.propertyImageIPFS = contract.propertyImageIPFS()
  property.propertyDescription = contract.propertyDescription()
  property.saleActive = contract.saleActive()
  property.createdAt = event.block.timestamp
  property.save()

  PropertyTokenTemplate.create(event.params.propertyAddress)
}