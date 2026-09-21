import { Connection, Keypair, PublicKey, Transaction, TransactionInstruction, sendAndConfirmTransaction } from '@solana/web3.js';
import { getAssociatedTokenAddress, createTransferInstruction, TOKEN_PROGRAM_ID } from '@solana/spl-token';

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

export interface IPaymentVerification {
  valid: boolean;
  details?: {
    mint: string;
    recipient: string;
    amount: string;
    from: string;
  };
  mismatch?: {
    mint?: boolean;
    recipient?: boolean;
    amount?: boolean;
  };
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
    
    const memoInstruction = new TransactionInstruction({
      keys: [],
      programId: new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr'),
      data: Buffer.from(request.reference, 'utf-8'),
    });

    const transferInstruction = createTransferInstruction(
      clientTokenAccount,
      recipientTokenAccount,
      clientKeypair.publicKey,
      BigInt(request.amount)
    );

    transaction.add(memoInstruction);
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

  async verifyPayment(
    signature: string,
    expectedRecipient: string,
    expectedAmount: string,
    expectedMint: string
  ): Promise<IPaymentVerification> {
    try {
      const tx = await this.connection.getTransaction(signature, {
        commitment: 'confirmed',
        maxSupportedTransactionVersion: 0
      });

      if (!tx || !tx.meta) {
        return { valid: false };
      }

      if (tx.meta.err) {
        return { valid: false };
      }

      const message = tx.transaction.message;
      const accountKeys = message.getAccountKeys();
      const instructions = message.compiledInstructions;
      
      for (const instruction of instructions) {
        const programId = accountKeys.get(instruction.programIdIndex);
        
        if (programId && programId.equals(TOKEN_PROGRAM_ID)) {
          const accounts = instruction.accountKeyIndexes.map((idx) => 
            accountKeys.get(idx)
          );

          if (accounts.length >= 3 && accounts[0] && accounts[1] && accounts[2]) {
            const fromTokenAccount = accounts[0];
            const toTokenAccount = accounts[1];

            const expectedRecipientPubkey = new PublicKey(expectedRecipient);
            const expectedMintPubkey = new PublicKey(expectedMint);

            const expectedToTokenAccount = await getAssociatedTokenAddress(
              expectedMintPubkey,
              expectedRecipientPubkey
            );

            const clientKeypair = await this.loadClientKeypair();
            const expectedFromTokenAccount = await getAssociatedTokenAddress(
              expectedMintPubkey,
              clientKeypair.publicKey
            );

            const mismatch: { mint?: boolean; recipient?: boolean; amount?: boolean } = {};
            
            const recipientMatch = toTokenAccount.equals(expectedToTokenAccount);
            const fromMatch = fromTokenAccount.equals(expectedFromTokenAccount);

            if (!recipientMatch) {
              mismatch.recipient = true;
            }
            
            if (!fromMatch) {
              mismatch.mint = true;
            }

            const instructionData = Buffer.from(instruction.data);
            if (instructionData.length >= 9) {
              const instructionType = instructionData[0];
              
              if (instructionType === 3) {
                const amount = instructionData.readBigUInt64LE(1);
                const amountStr = amount.toString();
                
                if (amountStr !== expectedAmount) {
                  mismatch.amount = true;
                }

                const details = {
                  mint: expectedMint,
                  recipient: toTokenAccount.toBase58(),
                  amount: amountStr,
                  from: fromTokenAccount.toBase58(),
                };

                if (Object.keys(mismatch).length > 0) {
                  return { valid: false, details, mismatch };
                }

                return { valid: true, details };
              }
            }
          }
        }
      }

      return { valid: false };
    } catch (error) {
      console.error('Payment verification error:', error);
      return { valid: false };
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
