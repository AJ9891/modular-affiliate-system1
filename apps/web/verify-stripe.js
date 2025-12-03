#!/usr/bin/env node

/**
 * Stripe Configuration Verification Script
 * Run this to check if your Stripe environment variables are properly configured
 */

require('dotenv').config({ path: '.env.local' });

const chalk = {
  green: (msg) => `\x1b[32m${msg}\x1b[0m`,
  red: (msg) => `\x1b[31m${msg}\x1b[0m`,
  yellow: (msg) => `\x1b[33m${msg}\x1b[0m`,
  blue: (msg) => `\x1b[34m${msg}\x1b[0m`,
  bold: (msg) => `\x1b[1m${msg}\x1b[0m`,
};

const checkmark = '✓';
const crossmark = '✗';

console.log('\n' + chalk.bold('🔍 Stripe Configuration Check\n'));

const requiredVars = [
  'STRIPE_SECRET_KEY',
  'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'STRIPE_STARTER_PRICE_ID',
  'STRIPE_PRO_PRICE_ID',
  'STRIPE_AGENCY_PRICE_ID',
];

let allConfigured = true;
let hasPlaceholders = false;

requiredVars.forEach((varName) => {
  const value = process.env[varName];
  const isConfigured = value && value !== '' && !value.includes('your_');
  
  if (value && value.includes('your_')) {
    hasPlaceholders = true;
  }

  if (isConfigured) {
    console.log(chalk.green(`${checkmark} ${varName}`));
    
    // Show partial value for verification
    if (varName === 'STRIPE_SECRET_KEY') {
      const preview = value.substring(0, 12) + '...';
      console.log(chalk.blue(`   → ${preview}`));
    } else if (varName === 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY') {
      const preview = value.substring(0, 12) + '...';
      console.log(chalk.blue(`   → ${preview}`));
    } else if (varName.includes('PRICE_ID')) {
      const preview = value.substring(0, 15) + '...';
      console.log(chalk.blue(`   → ${preview}`));
    }
  } else {
    console.log(chalk.red(`${crossmark} ${varName} - NOT CONFIGURED`));
    allConfigured = false;
  }
});

console.log('');

if (allConfigured) {
  console.log(chalk.green(chalk.bold('✅ All Stripe environment variables are configured!')));
  console.log(chalk.blue('\nNext steps:'));
  console.log('1. Restart your development server: npm run dev');
  console.log('2. Test checkout at: http://localhost:3001/pricing');
  console.log('3. Use test card: 4242 4242 4242 4242\n');
} else if (hasPlaceholders) {
  console.log(chalk.yellow(chalk.bold('⚠️  Stripe is configured with placeholder values')));
  console.log(chalk.yellow('\nPlease update .env.local with your actual Stripe keys:'));
  console.log(chalk.blue('\n1. Get your keys from: https://dashboard.stripe.com/apikeys'));
  console.log(chalk.blue('2. Create products at: https://dashboard.stripe.com/products'));
  console.log(chalk.blue('3. Update .env.local with real values'));
  console.log(chalk.blue('4. Run this script again to verify\n'));
  console.log(chalk.yellow('See STRIPE_SETUP_GUIDE.md for detailed instructions.\n'));
} else {
  console.log(chalk.red(chalk.bold('❌ Stripe configuration is incomplete')));
  console.log(chalk.yellow('\nPlease follow the setup guide:'));
  console.log(chalk.blue('1. Open STRIPE_SETUP_GUIDE.md'));
  console.log(chalk.blue('2. Follow all steps to configure Stripe'));
  console.log(chalk.blue('3. Run this script again to verify\n'));
}

// Check if Stripe package is installed
try {
  require('stripe');
  console.log(chalk.green(`${checkmark} Stripe package installed\n`));
} catch (err) {
  console.log(chalk.red(`${crossmark} Stripe package not found. Run: npm install stripe\n`));
  allConfigured = false;
}

process.exit(allConfigured ? 0 : 1);
