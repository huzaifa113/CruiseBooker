import { createRequire } from 'module';
const require = createRequire(import.meta.url);

// Load environment variables
import { config } from 'dotenv';
config();

console.log('Starting database seeding...');

// Check if we have database connection
if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL environment variable is required');
  process.exit(1);
}

// Import and run the seed function
async function runSeed() {
  try {
    const { enhancedSeedDatabase } = await import('../server/enhanced-seed.ts');
    await enhancedSeedDatabase();
    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Database seeding failed:', error);
    process.exit(1);
  }
}

runSeed();
