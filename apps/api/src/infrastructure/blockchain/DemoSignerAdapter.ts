import { Keypair } from '@solana/web3.js';
import { readFileSync } from 'fs';
import { resolve } from 'path';

export interface IDemoSignerConfig {
  freelancerKeypairPath: string;
  clientKeypairPath: string;
}

export class DemoSignerAdapter {
  private freelancerKeypair: Keypair | null = null;
  private clientKeypair: Keypair | null = null;

  constructor(private config: IDemoSignerConfig) {}

  loadKeypair(filePath: string): Keypair {
    const secretKey = JSON.parse(readFileSync(filePath, 'utf-8'));
    return Keypair.fromSecretKey(Uint8Array.from(secretKey));
  }

  getFreelancerKeypair(): Keypair {
    if (!this.freelancerKeypair) {
      this.freelancerKeypair = this.loadKeypair(this.config.freelancerKeypairPath);
    }
    return this.freelancerKeypair;
  }

  getClientKeypair(): Keypair {
    if (!this.clientKeypair) {
      this.clientKeypair = this.loadKeypair(this.config.clientKeypairPath);
    }
    return this.clientKeypair;
  }

  getFreelancerPublicKey(): string {
    return this.getFreelancerKeypair().publicKey.toBase58();
  }

  getClientPublicKey(): string {
    return this.getClientKeypair().publicKey.toBase58();
  }
}

export const createDemoSigner = (): DemoSignerAdapter => {
  const keypairsDir = resolve(process.cwd(), '.solana', 'keypairs');

  return new DemoSignerAdapter({
    freelancerKeypairPath: resolve(keypairsDir, 'freelancer.json'),
    clientKeypairPath: resolve(keypairsDir, 'client.json'),
  });
};
