import { ethers } from 'ethers';

export type TxStatus = 'Approved' | 'Rejected' | 'Error';

export type SignedTxResponse = {
    requestId: string;
    status: TxStatus;
    data: ethers.TransactionRequest;
    message?: string;
};

export type SignTxServerRequest = ethers.TransactionRequest & {
    approvingPolicyAddress: string;
};
