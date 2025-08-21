import puppeteer from 'puppeteer';

const TEST_BASE_URL = 'http://localhost:8989';
const TEST_TIMEOUT = 15000; // 15 seconds

const TEST_VIBES = [
  {
    slug: 'quick-cello-8104',
    name: 'Harp Notes',
    expectedText: 'Write brief notes',
    description: 'Notes/poetry app with text input',
  },
  {
    slug: 'satie-trumpet-8293',
    name: 'BlueskyFeed',
    expectedText: 'Bluesky',
    description: 'Bluesky social media feed component',
  },
  {
    slug: 'elegant-pedal-6233',
    name: 'PickathonPlanner',
    expectedText: 'Event',
    description: 'Music festival planning app',
  },
  {
    slug: 'visiting-moose-1323',
    name: 'Art Institute Explorer',
    expectedText: 'Art Institute',
    description: 'Art exploration app with search and collections',
  },
  {
    slug: 'resonant-artemis-3821',
    name: 'LodashChalkboard',
    expectedText: 'Lodash',
    description: 'Interactive Lodash utility functions demo',
  },
];

async function testFireproofVersion(browser) {
  const page = await browser.newPage();

  try {
    console.log(`\n🧪 Testing Fireproof Version Parameter`);

    // Helper to extract semver from the use-fireproof import URL via regex
    const getFireproofVersion = async () => {
      return await page.evaluate(() => {
        const importMap = document.querySelector('script[type="importmap"]');
        if (!importMap) return null;
        const imports = JSON.parse(importMap.textContent).imports;
        const fireproofUrl = imports && imports['use-fireproof'];
        if (!fireproofUrl) return null;
        // Capture the semver immediately following '@', allowing optional prerelease/build, and
        // tolerate trailing path segments, query params, or fragments.
        const match = fireproofUrl.match(
          /@([0-9]+\.[0-9]+\.[0-9]+(?:-[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?(?:\+[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?)(?:\b|\/|\?|#|$)/
        );
        return match ? match[1] : null;
      });
    };

    // Test 1: Default version (0.23.0)
    await page.goto(`${TEST_BASE_URL}/`, { waitUntil: 'networkidle2', timeout: TEST_TIMEOUT });
    const defaultVersion = await getFireproofVersion();

    // Test 2: Custom version (0.22.0)
    await page.goto(`${TEST_BASE_URL}/?v_fp=0.22.0`, {
      waitUntil: 'networkidle2',
      timeout: TEST_TIMEOUT,
    });
    const customVersion = await getFireproofVersion();

    // Test 3: Prerelease version (0.24.0-beta)
    await page.goto(`${TEST_BASE_URL}/?v_fp=0.24.0-beta`, {
      waitUntil: 'networkidle2',
      timeout: TEST_TIMEOUT,
    });
    const prereleaseVersion = await getFireproofVersion();

    // Test 4: Invalid version falls back to default
    await page.goto(`${TEST_BASE_URL}/?v_fp=invalid`, {
      waitUntil: 'networkidle2',
      timeout: TEST_TIMEOUT,
    });
    const fallbackVersion = await getFireproofVersion();

    // Test 5: Wrapper route forwards version parameter
    await page.goto(`${TEST_BASE_URL}/vibe/test?v_fp=0.21.0`, {
      waitUntil: 'networkidle2',
      timeout: TEST_TIMEOUT,
    });
    const iframeSrc = await page.evaluate(() => {
      const iframe = document.querySelector('iframe#vibeFrame');
      return iframe ? iframe.src : null;
    });

    // Accept any valid semver as the default to keep the test resilient to bumps
    const semverRe =
      /^(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)(?:-[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?(?:\+[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?$/;

    const success =
      semverRe.test(defaultVersion || '') &&
      customVersion === '0.22.0' &&
      prereleaseVersion === '0.24.0-beta' &&
      fallbackVersion === defaultVersion &&
      iframeSrc &&
      iframeSrc.endsWith('/?v_fp=0.21.0');

    return {
      success,
      tests: {
        defaultVersion: { expected: 'semver', actual: defaultVersion },
        customVersion: { expected: '0.22.0', actual: customVersion },
        prereleaseVersion: { expected: '0.24.0-beta', actual: prereleaseVersion },
        fallbackVersion: { expected: defaultVersion, actual: fallbackVersion },
        iframeSrc: { expected: '/?v_fp=0.21.0', actual: iframeSrc },
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  } finally {
    await page.close();
  }
}

async function testVibe(browser, vibe) {
  const page = await browser.newPage();

  try {
    console.log(`\n🧪 Testing ${vibe.slug}`);

    const consoleErrors = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    const vibeUrl = `${TEST_BASE_URL}/vibe/${vibe.slug}`;
    await page.goto(vibeUrl, { waitUntil: 'networkidle2', timeout: TEST_TIMEOUT });

    // Wait for iframe to load
    await page.waitForSelector('iframe#vibeFrame', { timeout: TEST_TIMEOUT });

    // Wait for loading to disappear
    await page.waitForFunction(
      () => {
        const loading = document.getElementById('loading');
        return loading && loading.style.display === 'none';
      },
      { timeout: TEST_TIMEOUT }
    );

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
      vibe,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      vibe,
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

    // Test fireproof version parameter first
    const versionTest = await testFireproofVersion(browser);
    results.push(versionTest);

    if (versionTest.success) {
      console.log(`✅ Fireproof Version Parameter - SUCCESS`);
    } else if (versionTest.error) {
      console.log(`❌ Fireproof Version Parameter - FAILED: ${versionTest.error}`);
    } else {
      console.log(`❌ Fireproof Version Parameter - FAILED:`);
      Object.entries(versionTest.tests).forEach(([test, result]) => {
        console.log(`   ${test}: expected "${result.expected}", got "${result.actual}"`);
      });
    }

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

    const successful = results.filter((r) => r.success).length;
    console.log(`\n📊 Results: ${successful}/${results.length} passed`);

    return results;
  } finally {
    await browser.close();
  }
}

// Run tests
runTests().catch(console.error);
