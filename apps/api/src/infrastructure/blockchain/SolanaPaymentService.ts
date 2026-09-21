import { Connection, Keypair, PublicKey, Transaction, sendAndConfirmTransaction } from '@solana/web3.js';
import { getAssociatedTokenAddress, createTransferInstruction } from '@solana/spl-token';

export interface IDemoSignerConfig {
  rpcUrl: string;
  clientKeypairPath: string;
  solanaConfigPath: string;
}

export interface IPaymentRequest {
  recipientAddress: string;
  amount: string;
  mintAddress: string;
  reference: string;
}

export interface IPaymentResult {
  signature: string;
  blockTime: number;
}

export class SolanaPaymentService {
  private connection: Connection;
  private clientKeypair: Keypair | null = null;

  constructor(private config: IDemoSignerConfig) {
    this.connection = new Connection(config.rpcUrl, 'confirmed');
  }

  private async loadClientKeypair(): Promise<Keypair> {
    if (this.clientKeypair) {
      return this.clientKeypair;
    }

    const fs = await import('fs');
    const secretKey = JSON.parse(fs.readFileSync(this.config.clientKeypairPath, 'utf-8'));
    this.clientKeypair = Keypair.fromSecretKey(Uint8Array.from(secretKey));
    return this.clientKeypair;
  }

  async createPayment(request: IPaymentRequest): Promise<IPaymentResult> {
    const clientKeypair = await this.loadClientKeypair();
    const mintPublicKey = new PublicKey(request.mintAddress);
    const recipientPublicKey = new PublicKey(request.recipientAddress);

    const clientTokenAccount = await getAssociatedTokenAddress(
      mintPublicKey,
      clientKeypair.publicKey
    );

    const recipientTokenAccount = await getAssociatedTokenAddress(
      mintPublicKey,
      recipientPublicKey
    );

    const transaction = new Transaction();
    
    const transferInstruction = createTransferInstruction(
      clientTokenAccount,
      recipientTokenAccount,
      clientKeypair.publicKey,
      BigInt(request.amount)
    );

    transaction.add(transferInstruction);

    const signature = await sendAndConfirmTransaction(
      this.connection,
      transaction,
      [clientKeypair],
      { commitment: 'confirmed' }
    );

    const txInfo = await this.connection.getTransaction(signature, {
      commitment: 'confirmed',
      maxSupportedTransactionVersion: 0
    });

    const blockTime = txInfo?.blockTime || Math.floor(Date.now() / 1000);

    return {
      signature,
      blockTime,
    };
  }

  async verifyPayment(signature: string, _expectedRecipient: string, _expectedAmount: string, _expectedMint: string): Promise<boolean> {
    try {
      const tx = await this.connection.getTransaction(signature, {
        commitment: 'confirmed',
        maxSupportedTransactionVersion: 0
      });

      if (!tx || !tx.meta) {
        return false;
      }

      if (tx.meta.err) {
        return false;
      }

      return true;
    } catch (error) {
      console.error('Payment verification error:', error);
      return false;
    }
  }

  async getConfirmationStatus(signature: string): Promise<{ confirmed: boolean; confirmations: number }> {
    try {
      const status = await this.connection.getSignatureStatus(signature);
      
      if (!status || !status.value) {
        return { confirmed: false, confirmations: 0 };
      }

      return {
        confirmed: status.value.confirmationStatus === 'confirmed' || status.value.confirmationStatus === 'finalized',
        confirmations: status.value.confirmations || 0,
      };
    } catch (error) {
      console.error('Error getting confirmation status:', error);
      return { confirmed: false, confirmations: 0 };
    }
  }
}
