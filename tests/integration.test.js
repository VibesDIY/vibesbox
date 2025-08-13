import puppeteer from 'puppeteer';

const TEST_BASE_URL = 'http://localhost:8989';
const TEST_TIMEOUT = 15000; // 15 seconds

const TEST_VIBES = [
  {
    slug: 'quick-cello-8104',
    name: 'Harp Notes',
    expectedText: 'Write brief notes',
    description: 'Notes/poetry app with text input'
  },
  {
    slug: 'satie-trumpet-8293', 
    name: 'BlueskyFeed',
    expectedText: 'Bluesky',
    description: 'Bluesky social media feed component'
  },
  {
    slug: 'elegant-pedal-6233',
    name: 'PickathonPlanner', 
    expectedText: 'Event',
    description: 'Music festival planning app'
  },
  {
    slug: 'visiting-moose-1323',
    name: 'Art Institute Explorer', 
    expectedText: 'Art Institute',
    description: 'Art exploration app with search and collections'
  }
];

async function testVibe(browser, vibe) {
  const page = await browser.newPage();
  
  try {
    console.log(`\n🧪 Testing ${vibe.slug}`);
    
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    const vibeUrl = `${TEST_BASE_URL}/vibe/${vibe.slug}`;
    await page.goto(vibeUrl, { waitUntil: 'networkidle2', timeout: TEST_TIMEOUT });
    
    // Wait for iframe to load
    await page.waitForSelector('iframe#vibeFrame', { timeout: TEST_TIMEOUT });
    
    // Wait for loading to disappear
    await page.waitForFunction(() => {
      const loading = document.getElementById('loading');
      return loading && loading.style.display === 'none';
    }, { timeout: TEST_TIMEOUT });
    
    // Get iframe content
    const iframe = await page.$('iframe#vibeFrame');
    const iframeContent = await iframe.contentFrame();
    
    // Check if content loaded (not default state)
    const containerContent = await iframeContent.evaluate(() => {
      const container = document.getElementById('container');
      return container ? container.innerHTML : 'No container found';
    });
    
    const hasDefaultContent = containerContent.includes('Ready to create');
    const hasExpectedText = containerContent.includes(vibe.expectedText);
    const hasErrors = consoleErrors.length > 0;
    
    return {
      success: !hasDefaultContent && !hasErrors,
      hasDefaultContent,
      hasExpectedText,
      hasErrors,
      consoleErrors: consoleErrors.slice(0, 3), // First 3 errors
      containerPreview: containerContent.substring(0, 200),
      vibe
    };
    
  } catch (error) {
    return {
      success: false,
      error: error.message,
      vibe
    };
  } finally {
    await page.close();
  }
}

async function runTests() {
  console.log('🧪 Vibesbox Integration Tests\n');
  
  const browser = await puppeteer.launch({ headless: 'new' });
  
  try {
    const results = [];
    
    for (const vibe of TEST_VIBES) {
      const result = await testVibe(browser, vibe);
      results.push(result);
      
      if (result.success) {
        console.log(`✅ ${result.vibe.slug} - SUCCESS`);
      } else if (result.error) {
        console.log(`❌ ${result.vibe.slug} - FAILED: ${result.error}`);
      } else {
        console.log(`❌ ${result.vibe.slug} - FAILED:`);
        console.log(`   Default content: ${result.hasDefaultContent}`);
        console.log(`   Expected text: ${result.hasExpectedText}`);
        console.log(`   Console errors: ${result.hasErrors}`);
        if (result.hasErrors) {
          console.log(`   Errors: ${result.consoleErrors.join(', ')}`);
        }
        console.log(`   Content: ${result.containerPreview}`);
      }
    }
    
    const successful = results.filter(r => r.success).length;
    console.log(`\n📊 Results: ${successful}/${TEST_VIBES.length} passed`);
    
    return results;
    
  } finally {
    await browser.close();
  }
}

// Run tests
runTests().catch(console.error);