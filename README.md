![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![Jest](https://img.shields.io/badge/-jest-%23C21325?style=for-the-badge&logo=jest&logoColor=white)
![ESLint](https://img.shields.io/badge/ESLint-4B3263?style=for-the-badge&logo=eslint&logoColor=white)
![Yarn](https://img.shields.io/badge/yarn-%232C8EBB.svg?style=for-the-badge&logo=yarn&logoColor=white)

# @ironblocks/venn-dapp-sdk
SDK for easy DApp integrations with Venn Security Network. This SDK is framework agnostic and will be compatible with any modern web application.

[What is Venn?](https://docs.venn.build/)

## Table of Contents
- [Introduction](#ironblocksvenn-dapp-sdk)
- [Installation](#installation)
- [Usage:](#usage)
    - [Venn Network Signature](#venn-network-signature)
        - [Background](#background)
        - [Getting started](#getting-started)
        - [Example - How to use the SDK](#example---how-to-use-the-sdk)
    - [Error handling](#errors)



## Installation

```bash
npm install @vennbuild/venn-dapp-sdk
yarn add @vennbuild/venn-dapp-sdk
pnpm add @vennbuild/venn-dapp-sdk
```

## Usage

Use this SDK to easily interact with protocols protected by the Venn Network Approved Calls Policy.
**For using this SDK you'll need a Venn Node URL.**  


### Venn Network Signature

#### Background

Protocols on the Venn Network protected by the Approved Calls Policy, are expecting certain calls to be signed by Venn Network. This SDK allows you to easily sign your transaction data. Once the transaction is approved and signed, you can proceed with executing it on-chain. Unsigned calls to protected protocols will revert. 


If you're a protocol owner, and you want to allow your users to interact with your protocol using this SDK, you'll need to set up your contracts:
- Target contract should inherit from `FirewallConsumerBase`
- Target contract firewall should be activated (should have active firewall address set either during deployment or via `setFirewall` method)
- Target contract should have `ApprovedCallsPolicy` deployed and activated (via `firewall.addGlobalPolicy`)

For more information about setting up your contracts, please refer to [Venn Documentation](https://docs.venn.build/)

### Getting started

1. Create a new Venn Client instance with your Venn Node URL. Pass the following parameters:
- `vennURL`: String. URL of your Venn Node.
- `approvingPolicyAddress`: String. Address of the `ApprovedCallsPolicy` contract.
- `chainId`: Number. Chain ID of the network you're interacting with.
- `strict`: Boolean. If set to `true`, the SDK will throw an error in case of an error while signing the transaction or if the transaction is not approved by Venn Network. If set to `false`, the SDK will return a request data in case of an error. Default value is `true`.


2. Create a transaction request object.
- `from`: String. Address of the sender
- `to`: String. Address of the recipient
- `data`: String. Encoded data of the transaction
- `value`: String. Value of the transaction

3. Call `approve` method with the transaction request object.

4. Returned value is a signed transaction request object:
- `from`: String. Address of the sender. Same as the original transaction.
- `to`: String. Address of the recipient. Same as the original transaction.
- `data`: String. Signed data of the transaction. 
- `value`: String. Value of the transaction. Same as the original transaction.

5. Submit the signed transaction request object instead of the original one.

### Example - How to use the SDK
```ts
import { VennClient, InspectTxResponse } from '@ironblocks/venn-dapp-sdk'
import { TransactionRequest } from 'ethers'

const url = process.env.VENN_NODE_URL
const policyAddress = process.env.APPROVED_CALLS_POLICY_ADDRESS
const chainId = process.env.CHAIN_ID

const vennClient = new VennClient({ vennURL: url , approvingPolicyAddress: policyAddress, chainId: chainId})

const transaction: TransactionRequest = {
    from: '0xfdD055Cf3EaD343AD51f4C7d1F12558c52BaDFA5',
    to: '0x10A88C7001900CE4299f62dA80D1c76121DcbAF6',
    data: '0x88C70010' // encoded data of your transaction
    value: 0
}

const signedTransaction: TransactionRequest = await vennClient.approve(transaction)

console.log(signedTransaction)
// {
//     from: '0xfdD055Cf3EaD343AD51f4C7d1F12558c52BaDFA5',
//     to: '0x10A88C7001900CE4299f62dA80D1c76121DcbAF6',
//     data: '0xCB45Cf3EaD343AD51f0CE4299f62dA80D1c76121DcbAF6A7', // signed data of the transaction
//     value: 0
// }

/* submit signed transaction instead of original one */
```

#### What happens under the hood?

Original transaction data is substituted with the same data, but signed by Venn Network.

1. Transaction is inspected by Venn Network.
2. If approved, the transaction is signed by Venn Network, and returned to the user.
3. User can now submit the signed transaction **as is** to the network instead of the original one.
4. If the transaction is not approved, the SDK will throw an error indicating that the transaction was rejected.


### Errors 

Coming soon.

**This SDK demonstrates how to integrate the Ironblocks Firewall with Venn Network**
