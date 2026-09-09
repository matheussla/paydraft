import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
} from '@solana/web3.js';
import {
  createMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { resolve } from 'path';

const KEYPAIRS_DIR = resolve(process.cwd(), '.solana', 'keypairs');
const FREELANCER_KEYPAIR_PATH = resolve(KEYPAIRS_DIR, 'freelancer.json');
const CLIENT_KEYPAIR_PATH = resolve(KEYPAIRS_DIR, 'client.json');
const CONFIG_PATH = resolve(process.cwd(), '.solana', 'config.json');

const DEMO_USDC_DECIMALS = 6;
const INITIAL_CLIENT_USDC = 1_000_000 * Math.pow(10, DEMO_USDC_DECIMALS);
const AIRDROP_AMOUNT = 2 * LAMPORTS_PER_SOL;

interface ISolanaConfig {
  demoUsdcMint: string;
  freelancerPublicKey: string;
  clientPublicKey: string;
  cluster: string;
  lastInitTimestamp: number;
}

function loadKeypair(filePath: string): Keypair {
  const secretKey = JSON.parse(readFileSync(filePath, 'utf-8'));
  return Keypair.fromSecretKey(Uint8Array.from(secretKey));
}

function saveConfig(config: ISolanaConfig): void {
  const configDir = resolve(process.cwd(), '.solana');
  if (!existsSync(configDir)) {
    mkdirSync(configDir, { recursive: true });
  }
  writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
}

async function initSolana(): Promise<void> {
  console.log('🚀 Initializing local Solana environment...\n');

  if (!existsSync(FREELANCER_KEYPAIR_PATH) || !existsSync(CLIENT_KEYPAIR_PATH)) {
    console.error('❌ Keypairs not found. Run: pnpm solana:keypairs first');
    process.exit(1);
  }

  const connection = new Connection('http://127.0.0.1:8899', 'confirmed');
  const freelancer = loadKeypair(FREELANCER_KEYPAIR_PATH);
  const client = loadKeypair(CLIENT_KEYPAIR_PATH);

  console.log(`👤 Freelancer: ${freelancer.publicKey.toBase58()}`);
  console.log(`👤 Client: ${client.publicKey.toBase58()}\n`);

  try {
    await connection.getVersion();
  } catch (error) {
    console.error('❌ Cannot connect to local Solana validator at http://127.0.0.1:8899');
    console.error('   Please start the validator first: solana-test-validator');
    process.exit(1);
  }

  console.log('💰 Airdropping SOL to accounts...');
  try {
    const freelancerAirdrop = await connection.requestAirdrop(
      freelancer.publicKey,
      AIRDROP_AMOUNT
    );
    await connection.confirmTransaction(freelancerAirdrop);
    console.log(`   ✅ Freelancer: ${AIRDROP_AMOUNT / LAMPORTS_PER_SOL} SOL`);

    const clientAirdrop = await connection.requestAirdrop(
      client.publicKey,
      AIRDROP_AMOUNT
    );
    await connection.confirmTransaction(clientAirdrop);
    console.log(`   ✅ Client: ${AIRDROP_AMOUNT / LAMPORTS_PER_SOL} SOL\n`);
  } catch (error) {
    console.error('❌ Failed to airdrop SOL:', error);
    process.exit(1);
  }

  console.log('🪙  Creating Demo USDC token...');
  let demoUsdcMint;
  try {
    demoUsdcMint = await createMint(
      connection,
      freelancer,
      freelancer.publicKey,
      null,
      DEMO_USDC_DECIMALS,
      undefined,
      undefined,
      TOKEN_PROGRAM_ID
    );
    console.log(`   ✅ Demo USDC Mint: ${demoUsdcMint.toBase58()}`);
    console.log(`   ✅ Decimals: ${DEMO_USDC_DECIMALS}\n`);
  } catch (error) {
    console.error('❌ Failed to create Demo USDC mint:', error);
    process.exit(1);
  }

  console.log('💳 Creating token accounts...');
  try {
    const freelancerTokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      freelancer,
      demoUsdcMint,
      freelancer.publicKey
    );
    console.log(`   ✅ Freelancer token account: ${freelancerTokenAccount.address.toBase58()}`);

    const clientTokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      client,
      demoUsdcMint,
      client.publicKey
    );
    console.log(`   ✅ Client token account: ${clientTokenAccount.address.toBase58()}\n`);

    console.log('💸 Minting Demo USDC to client...');
    await mintTo(
      connection,
      freelancer,
      demoUsdcMint,
      clientTokenAccount.address,
      freelancer.publicKey,
      INITIAL_CLIENT_USDC
    );
    console.log(`   ✅ Minted ${INITIAL_CLIENT_USDC / Math.pow(10, DEMO_USDC_DECIMALS)} Demo USDC to client\n`);
  } catch (error) {
    console.error('❌ Failed to setup token accounts:', error);
    process.exit(1);
  }

  const config: ISolanaConfig = {
    demoUsdcMint: demoUsdcMint.toBase58(),
    freelancerPublicKey: freelancer.publicKey.toBase58(),
    clientPublicKey: client.publicKey.toBase58(),
    cluster: 'http://127.0.0.1:8899',
    lastInitTimestamp: Date.now(),
  };

  saveConfig(config);
  console.log(`✅ Configuration saved to: ${CONFIG_PATH}\n`);

  console.log('🎉 Local Solana environment initialized successfully!');
  console.log('\n⚠️  IMPORTANT: This is a LOCAL DEMO ONLY');
  console.log('   Demo USDC tokens have NO MONETARY VALUE');
  console.log('   All operations run on your local validator\n');
}

initSolana().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
