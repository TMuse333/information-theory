/**
 * One-time script to add/update custom domains for existing Vercel project
 *
 * Run with: node scripts/add-domains.js
 */

require('dotenv').config();

const VERCEL_API_TOKEN = process.env.VERCEL_API_TOKEN;
const PROJECT_NAME = 'information-theory';
const DOMAIN_NAME = 'focusflowsoftware.com';

async function updateDomainBranch(projectId, domain, gitBranch) {
  console.log(`   🔧 Updating domain to point to ${gitBranch || 'production'} branch...`);

  const body = {};
  if (gitBranch) {
    body.gitBranch = gitBranch;
  } else {
    body.gitBranch = null; // Remove branch link = production
  }

  const response = await fetch(
    `https://api.vercel.com/v9/projects/${projectId}/domains/${domain}`,
    {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${VERCEL_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(`Failed to update domain: ${error.error?.message || response.statusText}`);
  }

  console.log(`   ✅ Domain updated successfully`);
  return await response.json();
}

async function addDomain(projectId, domain, gitBranch) {
  console.log(`\n🌐 Adding domain: ${domain}${gitBranch ? ` → ${gitBranch} branch` : ' → production'}`);

  const body = { name: domain };
  if (gitBranch) {
    body.gitBranch = gitBranch;
  }

  const response = await fetch(
    `https://api.vercel.com/v10/projects/${projectId}/domains`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${VERCEL_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    const errorCode = error.error?.code;
    const errorMessage = error.error?.message || '';

    console.log(`   Debug - Error code: ${errorCode}`);
    console.log(`   Debug - Error message: ${errorMessage}`);

    // Domain already exists - try to update it
    if (errorCode === 'domain_already_exists' ||
        errorCode === 'DOMAIN_ALREADY_EXISTS' ||
        errorMessage.includes('already in use')) {
      console.log(`   ⚠️  Domain already exists, updating branch configuration...`);
      return await updateDomainBranch(projectId, domain, gitBranch);
    }

    throw new Error(`Failed to add domain: ${errorMessage || response.statusText}`);
  }

  const result = await response.json();
  console.log(`   ✅ Domain added successfully`);
  return result;
}

async function main() {
  if (!VERCEL_API_TOKEN) {
    console.error('❌ VERCEL_API_TOKEN not found in .env');
    process.exit(1);
  }

  console.log('='.repeat(50));
  console.log(`Setting up domains for: ${PROJECT_NAME}`);
  console.log('='.repeat(50));

  const devDomain = `${PROJECT_NAME}.dev.${DOMAIN_NAME}`;
  const prodDomain = `${PROJECT_NAME}.${DOMAIN_NAME}`;

  try {
    // Add/update development domain linked to development branch
    await addDomain(PROJECT_NAME, devDomain, 'development');

    // Add/update production domain (no branch = production/main)
    await addDomain(PROJECT_NAME, prodDomain, null);

    console.log('\n' + '='.repeat(50));
    console.log('✅ Domain setup complete!');
    console.log('='.repeat(50));
    console.log(`\nYour URLs:`);
    console.log(`   Editor:     https://${devDomain}`);
    console.log(`   Production: https://${prodDomain}`);
    console.log(`\nMake sure your DNS has these CNAME records:`);
    console.log(`   *.dev.${DOMAIN_NAME} → cname.vercel-dns.com`);
    console.log(`   *.${DOMAIN_NAME} → cname.vercel-dns.com`);

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

main();
