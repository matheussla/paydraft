import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { exec } from 'child_process';
import { promisify } from 'util';

dotenv.config();

const execAsync = promisify(exec);
const MONGODB_URL = process.env.MONGODB_URL || 'mongodb://paydraft:paydraft_dev_password@127.0.0.1:27017/paydraft?authSource=admin';

async function resetDatabase(): Promise<void> {
  console.log('🔄 Resetting database...\n');

  try {
    await mongoose.connect(MONGODB_URL);
    console.log('✅ Connected to MongoDB\n');
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:', error);
    console.error('   Make sure MongoDB is running: docker compose up -d\n');
    process.exit(1);
  }

  try {
    const collections = await mongoose.connection.db?.collections();
    
    if (!collections || collections.length === 0) {
      console.log('ℹ️  No collections to drop\n');
    } else {
      console.log(`🗑️  Dropping ${collections.length} collection(s)...`);
      for (const collection of collections) {
        await collection.drop();
        console.log(`   ✅ Dropped: ${collection.collectionName}`);
      }
      console.log('');
    }

    await mongoose.disconnect();
    console.log('✅ Database reset completed\n');

    console.log('🌱 Re-seeding database...\n');
    const { stdout, stderr } = await execAsync('pnpm --filter @paydraft/scripts tsx src/seed/seedDatabase.ts', {
      cwd: process.cwd(),
    });

    if (stdout) console.log(stdout);
    if (stderr) console.error(stderr);

  } catch (error) {
    console.error('❌ Failed to reset database:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

resetDatabase().catch((error) => {
  console.error('Fatal error during reset:', error);
  process.exit(1);
});
