import { Keypair } from '@solana/web3.js';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { resolve } from 'path';

const KEYPAIRS_DIR = resolve(process.cwd(), '.solana', 'keypairs');
const FREELANCER_KEYPAIR_PATH = resolve(KEYPAIRS_DIR, 'freelancer.json');
const CLIENT_KEYPAIR_PATH = resolve(KEYPAIRS_DIR, 'client.json');

function saveKeypair(keypair: Keypair, filePath: string): void {
  const secretKey = Array.from(keypair.secretKey);
  writeFileSync(filePath, JSON.stringify(secretKey), { mode: 0o600 });
}

function generateKeypairs(): void {
  if (!existsSync(KEYPAIRS_DIR)) {
    mkdirSync(KEYPAIRS_DIR, { recursive: true });
  }

  if (existsSync(FREELANCER_KEYPAIR_PATH)) {
    console.log('⚠️  Freelancer keypair already exists, skipping generation');
  } else {
    const freelancerKeypair = Keypair.generate();
    saveKeypair(freelancerKeypair, FREELANCER_KEYPAIR_PATH);
    console.log(`✅ Generated freelancer keypair: ${freelancerKeypair.publicKey.toBase58()}`);
    console.log(`   Saved to: ${FREELANCER_KEYPAIR_PATH}`);
  }

  if (existsSync(CLIENT_KEYPAIR_PATH)) {
    console.log('⚠️  Client keypair already exists, skipping generation');
  } else {
    const clientKeypair = Keypair.generate();
    saveKeypair(clientKeypair, CLIENT_KEYPAIR_PATH);
    console.log(`✅ Generated client keypair: ${clientKeypair.publicKey.toBase58()}`);
    console.log(`   Saved to: ${CLIENT_KEYPAIR_PATH}`);
  }

  console.log('\n🔐 Keypairs generated successfully!');
  console.log('⚠️  Keep these files secure. They are gitignored and should never be committed.');
}

generateKeypairs();
