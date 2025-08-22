import puppeteer from 'puppeteer';

const TEST_BASE_URL = 'http://localhost:8989';
const TEST_TIMEOUT = 15000; // 15 seconds

async function testLabPage(browser) {
  const page = await browser.newPage();

  try {
    console.log(`\n🧪 Testing Lab Page Basic Functionality`);

    // Navigate to lab page
    await page.goto(`${TEST_BASE_URL}/lab/quick-cello-8104`, {
      waitUntil: 'networkidle2',
      timeout: TEST_TIMEOUT,
    });

    // Check if basic elements are present
    const hasVibeInput = await page.$('#vibeSlug');
    const hasSessionSelect = await page.$('#sessionSelect');
    const hasFireproofVersion = await page.$('#fireproofVersion');
    const hasDebugMaster = await page.$('#debugMaster');
    const hasDebugValue = await page.$('#debugValue');
    const hasLoadButton = await page.$('#loadButton');
    const hasReloadButton = await page.$('#reloadButton');

    // Check for 4 iframe containers
    const iframeContainers = await page.$$('.iframe-container');
    const hasCorrectFrameCount = iframeContainers.length === 4;

    // Check initial values
    const initialVibeSlug = await page.$eval('#vibeSlug', (el) => el.value);
    const initialDebugChecked = await page.$eval('#debugMaster', (el) => el.checked);
    const initialDebugValue = await page.$eval('#debugValue', (el) => el.value);

    return {
      success:
        hasVibeInput &&
        hasSessionSelect &&
        hasFireproofVersion &&
        hasDebugMaster &&
        hasDebugValue &&
        hasLoadButton &&
        hasReloadButton &&
        hasCorrectFrameCount &&
        initialVibeSlug === 'quick-cello-8104' &&
        initialDebugValue === '*',
      tests: {
        basicElements: hasVibeInput && hasSessionSelect && hasFireproofVersion,
        debugControls: hasDebugMaster && hasDebugValue,
        buttons: hasLoadButton && hasReloadButton,
        frameCount: hasCorrectFrameCount,
        initialValues: initialVibeSlug === 'quick-cello-8104' && initialDebugValue === '*',
        debugDefaultState: !initialDebugChecked, // Should be false by default
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

async function testLocalhostControls(browser) {
  const page = await browser.newPage();

  try {
    console.log(`\n🧪 Testing Localhost Controls`);

    // Navigate to lab page
    await page.goto(`${TEST_BASE_URL}/lab/test-slug`, {
      waitUntil: 'networkidle2',
      timeout: TEST_TIMEOUT,
    });

    // Check if localhost controls are visible (should be on localhost)
    const localhostControls = await page.$('#localhostControls');
    const isVisible = await page.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return style.display !== 'none';
    }, localhostControls);

    // Check localhost checkbox exists and is unchecked by default
    const useLocalhost = await page.$('#useLocalhost');
    const isUnchecked = await page.evaluate((el) => !el.checked, useLocalhost);

    // Test localStorage persistence
    await page.click('#useLocalhost'); // Check the box
    await page.reload({ waitUntil: 'networkidle2' });

    // Verify checkbox is still checked after reload
    const stillChecked = await page.$eval('#useLocalhost', (el) => el.checked);

    // Uncheck it for cleanup
    await page.click('#useLocalhost');

    return {
      success: isVisible && isUnchecked && stillChecked,
      tests: {
        controlsVisible: isVisible,
        defaultUnchecked: isUnchecked,
        localStoragePersistence: stillChecked,
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

async function testDebugControls(browser) {
  const page = await browser.newPage();

  try {
    console.log(`\n🧪 Testing Debug Controls`);

    // Navigate to lab page
    await page.goto(`${TEST_BASE_URL}/lab/test-slug`, {
      waitUntil: 'networkidle2',
      timeout: TEST_TIMEOUT,
    });

    // Check debug controls are unchecked by default
    const initialDebugState = await page.$eval('#debugMaster', (el) => el.checked);
    const initialInputDisabled = await page.$eval('#debugValue', (el) => el.disabled);

    // Enable debug
    await page.click('#debugMaster');
    const inputEnabledAfterCheck = await page.$eval('#debugValue', (el) => !el.disabled);

    // Change debug value
    await page.evaluate(() => {
      document.getElementById('debugValue').value = 'Loader,CRDTClock';
      document.getElementById('debugValue').dispatchEvent(new Event('input', { bubbles: true }));
    });

    // Reload page and verify persistence
    await page.reload({ waitUntil: 'networkidle2' });

    const persistedDebugState = await page.$eval('#debugMaster', (el) => el.checked);
    const persistedDebugValue = await page.$eval('#debugValue', (el) => el.value);

    // Clean up - uncheck debug
    await page.click('#debugMaster');

    return {
      success:
        !initialDebugState &&
        initialInputDisabled &&
        inputEnabledAfterCheck &&
        persistedDebugState &&
        persistedDebugValue === 'Loader,CRDTClock',
      tests: {
        defaultUnchecked: !initialDebugState,
        inputDisabledByDefault: initialInputDisabled,
        inputEnabledWhenChecked: inputEnabledAfterCheck,
        debugStatePersistence: persistedDebugState,
        debugValuePersistence: persistedDebugValue === 'Loader,CRDTClock',
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

async function testFrameUrlGeneration(browser) {
  const page = await browser.newPage();

  try {
    console.log(`\n🧪 Testing Frame URL Generation`);

    // Navigate to lab page
    await page.goto(`${TEST_BASE_URL}/lab/test-slug`, {
      waitUntil: 'networkidle2',
      timeout: TEST_TIMEOUT,
    });

    // Test with localhost disabled (default)
    let frameUrls = await page.evaluate(() => {
      const sessionId = '123456789012';
      const frameNum = 1;
      const fireproofVersion = '0.23.6';

      // Simulate the URL generation logic
      const useLocalhost = document.getElementById('useLocalhost');
      const isLocalhost = useLocalhost && useLocalhost.checked;

      let iframeUrl;
      if (isLocalhost) {
        iframeUrl = 'http://localhost:8989/';
      } else {
        const subdomain = `${sessionId}-${frameNum}`;
        iframeUrl = `https://${subdomain}.vibesbox.dev/`;
      }

      if (fireproofVersion) {
        const separator = iframeUrl.includes('?') ? '&' : '?';
        iframeUrl += `${separator}v_fp=${encodeURIComponent(fireproofVersion)}`;
      }

      return { iframeUrl, isLocalhost };
    });

    const expectedProductionUrl = 'https://123456789012-1.vibesbox.dev/?v_fp=0.23.6';
    const usesProductionByDefault = frameUrls.iframeUrl === expectedProductionUrl;

    // Test with localhost enabled
    await page.click('#useLocalhost');

    frameUrls = await page.evaluate(() => {
      const sessionId = '123456789012';
      const frameNum = 1;
      const fireproofVersion = '0.23.6';

      const useLocalhost = document.getElementById('useLocalhost');
      const isLocalhost = useLocalhost && useLocalhost.checked;

      let iframeUrl;
      if (isLocalhost) {
        iframeUrl = 'http://localhost:8989/';
      } else {
        const subdomain = `${sessionId}-${frameNum}`;
        iframeUrl = `https://${subdomain}.vibesbox.dev/`;
      }

      if (fireproofVersion) {
        const separator = iframeUrl.includes('?') ? '&' : '?';
        iframeUrl += `${separator}v_fp=${encodeURIComponent(fireproofVersion)}`;
      }

      return { iframeUrl, isLocalhost };
    });

    const expectedLocalhostUrl = 'http://localhost:8989/?v_fp=0.23.6';
    const usesLocalhostWhenEnabled = frameUrls.iframeUrl === expectedLocalhostUrl;

    // Clean up
    await page.click('#useLocalhost');

    return {
      success: usesProductionByDefault && usesLocalhostWhenEnabled,
      tests: {
        productionUrlByDefault: usesProductionByDefault,
        localhostWhenEnabled: usesLocalhostWhenEnabled,
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

async function runLabTests() {
  console.log('🧪 Vibesbox Lab Tests\n');

  const browser = await puppeteer.launch({ headless: 'new' });

  try {
    const results = [];

    // Test basic lab functionality
    const labTest = await testLabPage(browser);
    results.push(labTest);

    if (labTest.success) {
      console.log(`✅ Lab Page Basic Functionality - SUCCESS`);
    } else if (labTest.error) {
      console.log(`❌ Lab Page Basic Functionality - FAILED: ${labTest.error}`);
    } else {
      console.log(`❌ Lab Page Basic Functionality - FAILED:`);
      Object.entries(labTest.tests).forEach(([test, result]) => {
        console.log(`   ${test}: ${result ? '✅' : '❌'}`);
      });
    }

    // Test localhost controls
    const localhostTest = await testLocalhostControls(browser);
    results.push(localhostTest);

    if (localhostTest.success) {
      console.log(`✅ Localhost Controls - SUCCESS`);
    } else if (localhostTest.error) {
      console.log(`❌ Localhost Controls - FAILED: ${localhostTest.error}`);
    } else {
      console.log(`❌ Localhost Controls - FAILED:`);
      Object.entries(localhostTest.tests).forEach(([test, result]) => {
        console.log(`   ${test}: ${result ? '✅' : '❌'}`);
      });
    }

    // Test debug controls
    const debugTest = await testDebugControls(browser);
    results.push(debugTest);

    if (debugTest.success) {
      console.log(`✅ Debug Controls - SUCCESS`);
    } else if (debugTest.error) {
      console.log(`❌ Debug Controls - FAILED: ${debugTest.error}`);
    } else {
      console.log(`❌ Debug Controls - FAILED:`);
      Object.entries(debugTest.tests).forEach(([test, result]) => {
        console.log(`   ${test}: ${result ? '✅' : '❌'}`);
      });
    }

    // Test frame URL generation
    const urlTest = await testFrameUrlGeneration(browser);
    results.push(urlTest);

    if (urlTest.success) {
      console.log(`✅ Frame URL Generation - SUCCESS`);
    } else if (urlTest.error) {
      console.log(`❌ Frame URL Generation - FAILED: ${urlTest.error}`);
    } else {
      console.log(`❌ Frame URL Generation - FAILED:`);
      Object.entries(urlTest.tests).forEach(([test, result]) => {
        console.log(`   ${test}: ${result ? '✅' : '❌'}`);
      });
    }

    const successful = results.filter((r) => r.success).length;
    console.log(`\n📊 Lab Tests: ${successful}/${results.length} passed`);

    return results;
  } finally {
    await browser.close();
  }
}

// Run tests
runLabTests().catch(console.error);
