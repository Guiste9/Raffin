import { newMockEvent } from "matchstick-as"
import { ethereum, Address, BigInt } from "@graphprotocol/graph-ts"
import {
  Approval,
  OwnershipTransferred,
  PropertyMetadataUpdated,
  SaleStatusChanged,
  SharesPurchased,
  Transfer
} from "../generated/PropertyToken/PropertyToken"

export function createApprovalEvent(
  owner: Address,
  spender: Address,
  value: BigInt
): Approval {
  let approvalEvent = changetype<Approval>(newMockEvent())

  approvalEvent.parameters = new Array()

  approvalEvent.parameters.push(
    new ethereum.EventParam("owner", ethereum.Value.fromAddress(owner))
  )
  approvalEvent.parameters.push(
    new ethereum.EventParam("spender", ethereum.Value.fromAddress(spender))
  )
  approvalEvent.parameters.push(
    new ethereum.EventParam("value", ethereum.Value.fromUnsignedBigInt(value))
  )

  return approvalEvent
}

export function createOwnershipTransferredEvent(
  previousOwner: Address,
  newOwner: Address
): OwnershipTransferred {
  let ownershipTransferredEvent =
    changetype<OwnershipTransferred>(newMockEvent())

  ownershipTransferredEvent.parameters = new Array()

  ownershipTransferredEvent.parameters.push(
    new ethereum.EventParam(
      "previousOwner",
      ethereum.Value.fromAddress(previousOwner)
    )
  )
  ownershipTransferredEvent.parameters.push(
    new ethereum.EventParam("newOwner", ethereum.Value.fromAddress(newOwner))
  )

  return ownershipTransferredEvent
}

export function createPropertyMetadataUpdatedEvent(
  newImageIPFS: string
): PropertyMetadataUpdated {
  let propertyMetadataUpdatedEvent =
    changetype<PropertyMetadataUpdated>(newMockEvent())

  propertyMetadataUpdatedEvent.parameters = new Array()

  propertyMetadataUpdatedEvent.parameters.push(
    new ethereum.EventParam(
      "newImageIPFS",
      ethereum.Value.fromString(newImageIPFS)
    )
  )

  return propertyMetadataUpdatedEvent
}

export function createSaleStatusChangedEvent(
  isActive: boolean
): SaleStatusChanged {
  let saleStatusChangedEvent = changetype<SaleStatusChanged>(newMockEvent())

  saleStatusChangedEvent.parameters = new Array()

  saleStatusChangedEvent.parameters.push(
    new ethereum.EventParam("isActive", ethereum.Value.fromBoolean(isActive))
  )

  return saleStatusChangedEvent
}

export function createSharesPurchasedEvent(
  buyer: Address,
  bought: BigInt,
  amountPaid: BigInt
): SharesPurchased {
  let sharesPurchasedEvent = changetype<SharesPurchased>(newMockEvent())

  sharesPurchasedEvent.parameters = new Array()

  sharesPurchasedEvent.parameters.push(
    new ethereum.EventParam("buyer", ethereum.Value.fromAddress(buyer))
  )
  sharesPurchasedEvent.parameters.push(
    new ethereum.EventParam("bought", ethereum.Value.fromUnsignedBigInt(bought))
  )
  sharesPurchasedEvent.parameters.push(
    new ethereum.EventParam(
      "amountPaid",
      ethereum.Value.fromUnsignedBigInt(amountPaid)
    )
  )

  return sharesPurchasedEvent
}

export function createTransferEvent(
  from: Address,
  to: Address,
  value: BigInt
): Transfer {
  let transferEvent = changetype<Transfer>(newMockEvent())

  transferEvent.parameters = new Array()

  transferEvent.parameters.push(
    new ethereum.EventParam("from", ethereum.Value.fromAddress(from))
  )
  transferEvent.parameters.push(
    new ethereum.EventParam("to", ethereum.Value.fromAddress(to))
  )
  transferEvent.parameters.push(
    new ethereum.EventParam("value", ethereum.Value.fromUnsignedBigInt(value))
  )

  return transferEvent
}
