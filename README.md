![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![Jest](https://img.shields.io/badge/-jest-%23C21325?style=for-the-badge&logo=jest&logoColor=white)
![ESLint](https://img.shields.io/badge/ESLint-4B3263?style=for-the-badge&logo=eslint&logoColor=white)
![Yarn](https://img.shields.io/badge/yarn-%232C8EBB.svg?style=for-the-badge&logo=yarn&logoColor=white)

# @ironblocks/venn-dapp-sdk
SDK for easy DApp integrations with Venn Security Network. SDK is framework agnostic and will be compatible with any modern web application.

[What is Venn?](https://docs.venn.build/)

## Table of Contents
- [Introduction](#ironblocksvenn-dapp-sdk)
- [Installation](#installation)
- [Usage:](#usage)
    - [Transaction Inspection](#transaction-inspection)
    - [Venn Network Signature](#venn-network-signature)
    - [Errors handling](#errors-handling)



## Installation

```bash
npm install @ironblocks/venn-dapp-sdk
yarn add @ironblocks/venn-dapp-sdk
pnpm add @ironblocks/venn-dapp-sdk
```

## Usage

In order to use SDK you need to have **url of operating Venn Node**.  
Main use cases go down to sending your transaction to Venn Network before submitting it to the destination chain.

### Transaction Inspection

Any transaction can be inspected via Venn Network
```ts
import { VennClient, InspectTxResponse } from '@ironblocks/venn-dapp-sdk'
import { TransactionRequest } from 'ethers'

const vennClient = new VennClient({ url: VENN_NODE_URL })

const targetChainId = 1
const transaction: TransactionRequest = {
    from: '0xfdD055Cf3EaD343AD51f4C7d1F12558c52BaDFA5',
    to: '0x10A88C7001900CE4299f62dA80D1c76121DcbAF6',
    data: '0x' // encoded data of your transaction
    value: 0
}

const inspectionResult: InspectTxResponse = await vennClient.inspectTx({
    ...transaction,
    chainId: targetChainId
})

if (inspectionResult.approved) {
    /* submit original transaction */
} else {
    /* handle rejection */
}
```

### Venn Network Signature
Venn Network supports integration with **@ironblocks web3 firewall** and allows to get signature
for **Approved Calls Policy**

In order to **use** this **signature** you need to **meet following conditions**:
- Target contract should be inherited from `FirewallConsumerBase`
- Target contract firewall should be activated (should have active firewall address set either during deployment or via `setFirewall` method)
- Target contract should have `ApprovedCallsPolicy` activated (via `firewall.addGlobalPolicy`)

```ts
import { VennClient, InspectTxResponse } from '@ironblocks/venn-dapp-sdk'
import { TransactionRequest } from 'ethers'

const vennClient = new VennClient({ url: VENN_NODE_URL })

const targetChainId = 1
const approvedCallsPolicyAddr = '*your-policy-addr-on-targetChainId*'

const transaction: TransactionRequest = {
    from: '0xfdD055Cf3EaD343AD51f4C7d1F12558c52BaDFA5',
    to: '0x10A88C7001900CE4299f62dA80D1c76121DcbAF6',
    data: '0x' // encoded data of your transaction
    value: 0
}

const signedTransaction: TransactionRequest = await vennClient.signTx({
    ...transaction,
    chainId: targetChainId,
    approvingPolicyAddress: approvedCallsPolicyAddr
})

/* submit signed transaction instead of original one */
```

#### What happens under the hood?

Original transaction data is substituted with the data that incorporates signature from Venn Network.

1. Transaction is inspected by Venn Network
2. Signature is retrieved from Venn Network response
3. `ApprovedPolicy` data is encoded for `approveCallsViaSignature` method.
4. Payload from previous step along with initial tx data is encoded for `safeFunctionCall` from `FirewallConsumerBase`
5. Initial transaction is returned with substituted `data` and can be safely submitted to the blockchain

### Errors handling

Package exports `errors` object that contains every `Error` class that can be possibly thrown by SDK

```ts
import { VennClient, errors } from '@ironblocks/venn-dapp-sdk'
import { TransactionRequest } from 'ethers'

const vennClient = new VennClient({ url: VENN_NODE_URL })

const targetChainId = 1
const approvedCallsPolicyAddr = '*your-policy-addr-on-targetChainId*'

const transaction: TransactionRequest = {
    from: '0xfdD055Cf3EaD343AD51f4C7d1F12558c52BaDFA5',
    to: '0x10A88C7001900CE4299f62dA80D1c76121DcbAF6',
    data: '0x' // encoded data of your transaction
    value: 0
}

/* you can implement any handling that will suit your app needs */
const handleSdkError = (error: unknown) => {
    // if it isn't instance of Error it is probably isn't thrown by SDK
    if (!(error instanceof Error)) return

    switch(error.constructor) {
        case errors.ConnectionRefusedError:
            alert('Connection refused')
            break
        case errors.NetworkError:
            alert('Connection lost')
            break
        case errors.LEGACY__TxRejectedError:
            alert('Tx Rejected by Venn Network')
            break
        case errors.FailedToEncodeApprovedCallsError:
            alert('Encoding process failed')
            break
        default:
            break
    }
}

try {
    const signedTransaction: TransactionRequest = await vennClient.signTx({
        ...transaction,
        chainId: targetChainId,
        approvingPolicyAddress: approvedCallsPolicyAddr
    })
    /* submit signed transaction instead of original one */
} catch(error) {
    handleSdkError(error)
}
```