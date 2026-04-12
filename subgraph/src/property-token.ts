import {
  Approval as ApprovalEvent,
  OwnershipTransferred as OwnershipTransferredEvent,
  PropertyMetadataUpdated as PropertyMetadataUpdatedEvent,
  SaleStatusChanged as SaleStatusChangedEvent,
  SharesPurchased as SharesPurchasedEvent,
  Transfer as TransferEvent
} from "../generated/PropertyToken/PropertyToken"
import {
  Approval,
  OwnershipTransferred,
  PropertyMetadataUpdated,
  SaleStatusChanged,
  SharesPurchased,
  Transfer
} from "../generated/schema"

export function handleApproval(event: ApprovalEvent): void {
  let entity = new Approval(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.owner = event.params.owner
  entity.spender = event.params.spender
  entity.value = event.params.value

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleOwnershipTransferred(
  event: OwnershipTransferredEvent
): void {
  let entity = new OwnershipTransferred(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.previousOwner = event.params.previousOwner
  entity.newOwner = event.params.newOwner

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handlePropertyMetadataUpdated(
  event: PropertyMetadataUpdatedEvent
): void {
  let entity = new PropertyMetadataUpdated(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.newImageIPFS = event.params.newImageIPFS

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleSaleStatusChanged(event: SaleStatusChangedEvent): void {
  let entity = new SaleStatusChanged(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.isActive = event.params.isActive

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleSharesPurchased(event: SharesPurchasedEvent): void {
  let entity = new SharesPurchased(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.buyer = event.params.buyer
  entity.bought = event.params.bought
  entity.amountPaid = event.params.amountPaid

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleTransfer(event: TransferEvent): void {
  let entity = new Transfer(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.from = event.params.from
  entity.to = event.params.to
  entity.value = event.params.value

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}
