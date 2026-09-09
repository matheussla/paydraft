import { Connection, PublicKey } from '@solana/web3.js';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

const CONFIG_PATH = resolve(process.cwd(), '.solana', 'config.json');

interface ISolanaConfig {
  demoUsdcMint: string;
  freelancerPublicKey: string;
  clientPublicKey: string;
  cluster: string;
  lastInitTimestamp: number;
}

async function checkSolanaHealth(): Promise<void> {
  console.log('🔍 Checking Solana environment health...\n');

  if (!existsSync(CONFIG_PATH)) {
    console.log('⚠️  No configuration found');
    console.log('   Run: pnpm solana:init to initialize the environment\n');
    return;
  }

  const config: ISolanaConfig = JSON.parse(readFileSync(CONFIG_PATH, 'utf-8'));
  const connection = new Connection(config.cluster, 'confirmed');

  console.log(`📋 Configuration from: ${new Date(config.lastInitTimestamp).toLocaleString()}`);
  console.log(`🌐 Cluster: ${config.cluster}`);
  console.log(`🪙  Demo USDC Mint: ${config.demoUsdcMint}`);
  console.log(`👤 Freelancer: ${config.freelancerPublicKey}`);
  console.log(`👤 Client: ${config.clientPublicKey}\n`);

  try {
    await connection.getVersion();
    console.log('✅ Validator is running\n');
  } catch (error) {
    console.error('❌ Cannot connect to validator');
    console.error('   Please start the validator: solana-test-validator\n');
    return;
  }

  try {
    const mintPubkey = new PublicKey(config.demoUsdcMint);
    const mintInfo = await connection.getAccountInfo(mintPubkey);

    if (!mintInfo) {
      console.warn('⚠️  STALE CONFIG DETECTED');
      console.warn('   Demo USDC mint not found on chain');
      console.warn('   The validator was likely reset');
      console.warn('   Run: pnpm solana:init to re-initialize\n');
      return;
    }

    console.log('✅ Demo USDC mint exists on chain');
    console.log('✅ Configuration is valid\n');
    console.log('🎉 Solana environment is healthy!');
  } catch (error) {
    console.error('❌ Error checking mint:', error);
  }
}

checkSolanaHealth().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
