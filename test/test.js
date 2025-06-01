const assert = require('assert');
const { generateHashes, getSupportedAlgorithms } = require('../lib/hashers');
const { validateInput, formatOutput } = require('../lib/utils');

/**
 * Simple test runner
 */
class TestRunner {
  constructor() {
    this.tests = [];
    this.passed = 0;
    this.failed = 0;
  }

  test(name, fn) {
    this.tests.push({ name, fn });
  }

  async run() {
    console.log('Running Hash-It Tests...\n');

    for (const test of this.tests) {
      try {
        await test.fn();
        console.log(`✓ ${test.name}`);
        this.passed++;
      } catch (error) {
        console.log(`✗ ${test.name}`);
        console.log(`  Error: ${error.message}`);
        this.failed++;
      }
    }

    console.log(`\nTest Results: ${this.passed} passed, ${this.failed} failed`);
    
    if (this.failed > 0) {
      process.exit(1);
    }
  }
}

const runner = new TestRunner();

// Test hash generation
runner.test('Should generate MD5 hash correctly', async () => {
  const results = await generateHashes('Hello, World!', { algorithm: 'md5' });
  const md5Hash = results.get('MD5');
  assert.strictEqual(md5Hash, '65a8e27d8879283831b664bd8b7f0ad4');
});

runner.test('Should generate SHA256 hash correctly', async () => {
  const results = await generateHashes('Hello, World!', { algorithm: 'sha256' });
  const sha256Hash = results.get('SHA256');
  // Updated expected hash value for "Hello, World!"
  assert.strictEqual(sha256Hash, 'dffd6021bb2bd5b0af676290809ec3a53191dd81c7f70a4b28688a362182986f');
});

runner.test('Should generate all hashes', async () => {
  const results = await generateHashes('test');
  const algorithms = getSupportedAlgorithms();
  
  assert.strictEqual(results.size, algorithms.length);
  
  for (const algo of algorithms) {
    assert(results.has(algo), `Missing algorithm: ${algo}`);
  }
});

runner.test('Should handle uppercase option', async () => {
  const results = await generateHashes('test', { algorithm: 'md5', uppercase: true });
  const hash = results.get('MD5');
  assert.strictEqual(hash, hash.toUpperCase());
});

runner.test('Should validate input correctly', () => {
  // Valid input
  let validation = validateInput('test');
  assert.strictEqual(validation.valid, true);

  // Empty input
  validation = validateInput('');
  assert.strictEqual(validation.valid, false);

  // Valid algorithm
  validation = validateInput('test', { algorithm: 'md5' });
  assert.strictEqual(validation.valid, true);

  // Invalid algorithm
  validation = validateInput('test', { algorithm: 'invalid' });
  assert.strictEqual(validation.valid, false);
});

runner.test('Should format output as JSON', () => {
  const results = new Map([
    ['MD5', 'abc123'],
    ['SHA1', 'def456']
  ]);
  
  const output = formatOutput(results, 'json');
  const parsed = JSON.parse(output);
  
  assert.strictEqual(parsed.MD5, 'abc123');
  assert.strictEqual(parsed.SHA1, 'def456');
});

runner.test('Should format output as plain text', () => {
  const results = new Map([
    ['MD5', 'abc123']
  ]);
  
  const output = formatOutput(results, 'plain', { noColor: true });
  assert(output.includes('MD5'));
  assert(output.includes('abc123'));
});

runner.test('Should handle CRC32 algorithm', async () => {
  const results = await generateHashes('test', { algorithm: 'crc32' });
  const crc32Hash = results.get('CRC32');
  assert(typeof crc32Hash === 'string');
  assert(crc32Hash.length > 0);
});

runner.test('Should handle NTLM algorithm', async () => {
  const results = await generateHashes('password', { algorithm: 'ntlm' });
  const ntlmHash = results.get('NTLM');
  assert(typeof ntlmHash === 'string');
  assert.strictEqual(ntlmHash.length, 32); // NTLM hashes are 32 characters
});

runner.test('Should get supported algorithms list', () => {
  const algorithms = getSupportedAlgorithms();
  assert(Array.isArray(algorithms));
  assert(algorithms.length > 0);
  assert(algorithms.includes('MD5'));
  assert(algorithms.includes('SHA256'));
});

runner.test('Should handle error for unsupported algorithm', async () => {
  try {
    await generateHashes('test', { algorithm: 'unsupported' });
    assert.fail('Should have thrown an error');
  } catch (error) {
    assert(error.message.includes('Unsupported algorithm'));
  }
});

// Run all tests
runner.run().catch(console.error);