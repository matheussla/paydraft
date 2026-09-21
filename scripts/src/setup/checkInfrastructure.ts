import mongoose from 'mongoose';
import { Connection } from '@solana/web3.js';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

const MONGODB_URL = process.env.MONGODB_URL || 'mongodb://paydraft:paydraft_dev_password@127.0.0.1:27017/paydraft?authSource=admin';
const SOLANA_CLUSTER_URL = 'http://127.0.0.1:8899';
const SOLANA_CONFIG_PATH = resolve(process.cwd(), '.solana', 'config.json');

interface CheckResult {
  name: string;
  status: 'pass' | 'fail';
  message: string;
}

async function checkMongoDB(): Promise<CheckResult> {
  try {
    await mongoose.connect(MONGODB_URL, {
      serverSelectionTimeoutMS: 5000,
    });

    await mongoose.connection.db?.admin().ping();
    await mongoose.disconnect();

    return {
      name: 'MongoDB (loopback)',
      status: 'pass',
      message: 'Connected successfully to 127.0.0.1:27017',
    };
  } catch (error) {
    return {
      name: 'MongoDB (loopback)',
      status: 'fail',
      message: error instanceof Error ? error.message : 'Connection failed',
    };
  }
}

async function checkSolanaValidator(): Promise<CheckResult> {
  try {
    const connection = new Connection(SOLANA_CLUSTER_URL, 'confirmed');
    const version = await connection.getVersion();

    return {
      name: 'Local Solana Validator',
      status: 'pass',
      message: `Connected (version: ${version['solana-core']})`,
    };
  } catch (error) {
    return {
      name: 'Local Solana Validator',
      status: 'fail',
      message: 'Cannot connect to http://127.0.0.1:8899',
    };
  }
}

function checkSolanaConfig(): CheckResult {
  if (!existsSync(SOLANA_CONFIG_PATH)) {
    return {
      name: 'Solana Configuration',
      status: 'fail',
      message: 'Config file not found. Run: pnpm solana:init',
    };
  }

  try {
    const config = JSON.parse(readFileSync(SOLANA_CONFIG_PATH, 'utf-8'));
    
    if (!config.demoUsdcMint || !config.freelancerPublicKey || !config.clientPublicKey) {
      return {
        name: 'Solana Configuration',
        status: 'fail',
        message: 'Config incomplete. Run: pnpm solana:init',
      };
    }

    return {
      name: 'Solana Configuration',
      status: 'pass',
      message: `Demo USDC mint configured: ${config.demoUsdcMint.substring(0, 8)}...`,
    };
  } catch (error) {
    return {
      name: 'Solana Configuration',
      status: 'fail',
      message: 'Config file corrupted. Run: pnpm solana:init',
    };
  }
}

async function runChecks(): Promise<void> {
  console.log('🔍 Running infrastructure readiness checks...\n');

  const checks = await Promise.all([
    checkMongoDB(),
    checkSolanaValidator(),
    Promise.resolve(checkSolanaConfig()),
  ]);

  let allPassed = true;

  for (const check of checks) {
    const icon = check.status === 'pass' ? '✅' : '❌';
    const status = check.status === 'pass' ? 'PASS' : 'FAIL';
    
    console.log(`${icon} ${check.name}: ${status}`);
    console.log(`   ${check.message}\n`);

    if (check.status === 'fail') {
      allPassed = false;
    }
  }

  if (allPassed) {
    console.log('🎉 All infrastructure checks passed!\n');
    console.log('Ready to run:');
    console.log('  - pnpm setup    (run infrastructure checks)');
    console.log('  - pnpm seed     (seed database with sample data)');
    console.log('  - pnpm reset    (reset database and re-seed)');
    console.log('  - pnpm dev:api  (start API server)');
    console.log('  - pnpm dev:web  (start web frontend)\n');
    process.exit(0);
  } else {
    console.log('❌ Some checks failed. Please fix the issues above before continuing.\n');
    console.log('Setup instructions:');
    console.log('  1. Start MongoDB: docker compose up -d');
    console.log('  2. Start Solana validator: solana-test-validator (in separate terminal)');
    console.log('  3. Initialize Solana: pnpm solana:init\n');
    process.exit(1);
  }
}

runChecks().catch((error) => {
  console.error('Fatal error during checks:', error);
  process.exit(1);
});
