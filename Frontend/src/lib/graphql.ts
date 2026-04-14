import { GraphQLClient, gql } from 'graphql-request'

export const graphClient = new GraphQLClient(
  'https://api.studio.thegraph.com/query/1747987/tcc-project/v0.0.2'
)

export const GET_ALL_PROPERTIES = gql`
  query GetAllProperties {
    properties(orderBy: createdAt, orderDirection: desc) {
      id
      address
      name
      symbol
      owner
      totalShares
      pricePerShare
      propertyAddress
      propertyImageIPFS
      propertyDescription
      saleActive
      createdAt
    }
  }
`

export const GET_PROPERTIES_BY_OWNER = gql`
  query GetPropertiesByOwner($owner: String!) {
    properties(where: { owner: $owner }, orderBy: createdAt, orderDirection: desc) {
      id
      address
      name
      symbol
      owner
      totalShares
      pricePerShare
      propertyAddress
      propertyImageIPFS
      propertyDescription
      saleActive
      createdAt
    }
  }
`

export const GET_PURCHASES_BY_BUYER = gql`
  query GetPurchasesByBuyer($buyer: String!) {
    sharePurchases(where: { buyer: $buyer }, orderBy: createdAt, orderDirection: desc) {
      id
      buyer
      amount
      totalPaid
      createdAt
      property {
        id
        address
        name
        propertyAddress
        propertyImageIPFS
        pricePerShare
        totalShares
      }
    }
  }
`