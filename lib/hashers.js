const crypto = require('crypto');
const crc = require('crc');
const adler32 = require('adler-32');
const ripemd160 = require('ripemd160');

/**
 * Pure JavaScript MD4 implementation for NTLM compatibility
 */
function md4(data) {
  // Convert string to buffer if needed
  const buffer = Buffer.isBuffer(data) ? data : Buffer.from(data, 'utf8');
  
  // MD4 constants
  const h = [0x67452301, 0xefcdab89, 0x98badcfe, 0x10325476];
  
  // Helper functions
  function f(x, y, z) { return (x & y) | (~x & z); }
  function g(x, y, z) { return (x & y) | (x & z) | (y & z); }
  function h_func(x, y, z) { return x ^ y ^ z; }
  
  function rotateLeft(value, amount) {
    return (value << amount) | (value >>> (32 - amount));
  }
  
  // Padding
  const msgLength = buffer.length;
  const paddedLength = Math.ceil((msgLength + 9) / 64) * 64;
  const padded = Buffer.alloc(paddedLength);
  buffer.copy(padded);
  padded[msgLength] = 0x80;
  
  // Write length in bits as 64-bit little-endian
  const lengthInBits = msgLength * 8;
  padded.writeUInt32LE(lengthInBits & 0xffffffff, paddedLength - 8);
  padded.writeUInt32LE((lengthInBits >>> 32) & 0xffffffff, paddedLength - 4);
  
  // Process 512-bit chunks
  for (let chunk = 0; chunk < paddedLength; chunk += 64) {
    const w = [];
    for (let i = 0; i < 16; i++) {
      w[i] = padded.readUInt32LE(chunk + i * 4);
    }
    
    let [a, b, c, d] = h;
    
    // Round 1
    const round1 = (a, b, c, d, x, s) => {
      return rotateLeft((a + f(b, c, d) + x) >>> 0, s);
    };
    
    a = round1(a, b, c, d, w[0], 3); d = round1(d, a, b, c, w[1], 7);
    c = round1(c, d, a, b, w[2], 11); b = round1(b, c, d, a, w[3], 19);
    a = round1(a, b, c, d, w[4], 3); d = round1(d, a, b, c, w[5], 7);
    c = round1(c, d, a, b, w[6], 11); b = round1(b, c, d, a, w[7], 19);
    a = round1(a, b, c, d, w[8], 3); d = round1(d, a, b, c, w[9], 7);
    c = round1(c, d, a, b, w[10], 11); b = round1(b, c, d, a, w[11], 19);
    a = round1(a, b, c, d, w[12], 3); d = round1(d, a, b, c, w[13], 7);
    c = round1(c, d, a, b, w[14], 11); b = round1(b, c, d, a, w[15], 19);
    
    // Round 2
    const round2 = (a, b, c, d, x, s) => {
      return rotateLeft((a + g(b, c, d) + x + 0x5a827999) >>> 0, s);
    };
    
    a = round2(a, b, c, d, w[0], 3); d = round2(d, a, b, c, w[4], 5);
    c = round2(c, d, a, b, w[8], 9); b = round2(b, c, d, a, w[12], 13);
    a = round2(a, b, c, d, w[1], 3); d = round2(d, a, b, c, w[5], 5);
    c = round2(c, d, a, b, w[9], 9); b = round2(b, c, d, a, w[13], 13);
    a = round2(a, b, c, d, w[2], 3); d = round2(d, a, b, c, w[6], 5);
    c = round2(c, d, a, b, w[10], 9); b = round2(b, c, d, a, w[14], 13);
    a = round2(a, b, c, d, w[3], 3); d = round2(d, a, b, c, w[7], 5);
    c = round2(c, d, a, b, w[11], 9); b = round2(b, c, d, a, w[15], 13);
    
    // Round 3
    const round3 = (a, b, c, d, x, s) => {
      return rotateLeft((a + h_func(b, c, d) + x + 0x6ed9eba1) >>> 0, s);
    };
    
    a = round3(a, b, c, d, w[0], 3); d = round3(d, a, b, c, w[8], 9);
    c = round3(c, d, a, b, w[4], 11); b = round3(b, c, d, a, w[12], 15);
    a = round3(a, b, c, d, w[2], 3); d = round3(d, a, b, c, w[10], 9);
    c = round3(c, d, a, b, w[6], 11); b = round3(b, c, d, a, w[14], 15);
    a = round3(a, b, c, d, w[1], 3); d = round3(d, a, b, c, w[9], 9);
    c = round3(c, d, a, b, w[5], 11); b = round3(b, c, d, a, w[13], 15);
    a = round3(a, b, c, d, w[3], 3); d = round3(d, a, b, c, w[11], 9);
    c = round3(c, d, a, b, w[7], 11); b = round3(b, c, d, a, w[15], 15);
    
    h[0] = (h[0] + a) >>> 0;
    h[1] = (h[1] + b) >>> 0;
    h[2] = (h[2] + c) >>> 0;
    h[3] = (h[3] + d) >>> 0;
  }
  
  // Convert to hex string (little-endian)
  const result = Buffer.alloc(16);
  result.writeUInt32LE(h[0], 0);
  result.writeUInt32LE(h[1], 4);
  result.writeUInt32LE(h[2], 8);
  result.writeUInt32LE(h[3], 12);
  
  return result.toString('hex');
}

/**
 * Hash algorithm implementations
 */
class HashGenerator {
  constructor() {
    this.algorithms = new Map();
    this.initializeAlgorithms();
  }

  /**
   * Initialize all supported hash algorithms
   */
  initializeAlgorithms() {
    // Standard crypto module algorithms
    const cryptoAlgorithms = [
      'md5', 'sha1', 'sha224', 'sha256', 'sha384', 'sha512',
      'sha3-224', 'sha3-256', 'sha3-384', 'sha3-512'
    ];

    cryptoAlgorithms.forEach(algo => {
      this.algorithms.set(algo.toUpperCase(), (data) => {
        return crypto.createHash(algo).update(data, 'utf8').digest('hex');
      });
    });

    // Custom implementations
    this.algorithms.set('MD4', (data) => {
      return md4(data);
    });

    this.algorithms.set('RIPEMD160', (data) => {
      return new ripemd160().update(Buffer.from(data, 'utf8')).digest('hex');
    });

    this.algorithms.set('CRC16', (data) => {
      return crc.crc16(data).toString(16).padStart(4, '0');
    });

    this.algorithms.set('CRC32', (data) => {
      return crc.crc32(data).toString(16).padStart(8, '0');
    });

    this.algorithms.set('ADLER32', (data) => {
      return adler32.str(data).toString(16).padStart(8, '0');
    });

    this.algorithms.set('NTLM', (data) => {
      // NTLM is MD4 of UTF-16LE encoded password
      const utf16leBuffer = Buffer.from(data, 'utf16le');
      return md4(utf16leBuffer);
    });
  }

  /**
   * Get all supported algorithm names
   */
  getSupportedAlgorithms() {
    return Array.from(this.algorithms.keys()).sort();
  }

  /**
   * Generate hash for specific algorithm
   */
  generateHash(algorithm, data) {
    const upperAlgo = algorithm.toUpperCase();
    
    if (!this.algorithms.has(upperAlgo)) {
      throw new Error(`Unsupported algorithm: ${algorithm}`);
    }

    try {
      return this.algorithms.get(upperAlgo)(data);
    } catch (error) {
      throw new Error(`Failed to generate ${algorithm} hash: ${error.message}`);
    }
  }

  /**
   * Generate all hashes for given data
   */
  generateAllHashes(data) {
    const results = new Map();
    
    for (const [algorithm, hashFunction] of this.algorithms) {
      try {
        const hash = hashFunction(data);
        results.set(algorithm, hash);
      } catch (error) {
        results.set(algorithm, `Error: ${error.message}`);
      }
    }

    return results;
  }
}

// Create singleton instance
const hashGenerator = new HashGenerator();

/**
 * Generate hashes based on options
 */
async function generateHashes(text, options = {}) {
  const results = new Map();
  
  if (options.algorithm) {
    // Generate specific algorithm
    const algorithm = options.algorithm.toUpperCase();
    try {
      const hash = hashGenerator.generateHash(algorithm, text);
      results.set(algorithm, hash);
    } catch (error) {
      throw new Error(`Failed to generate ${algorithm} hash: ${error.message}`);
    }
  } else {
    // Generate all hashes
    const allHashes = hashGenerator.generateAllHashes(text);
    for (const [algo, hash] of allHashes) {
      results.set(algo, hash);
    }
  }

  // Apply uppercase option
  if (options.uppercase) {
    for (const [algo, hash] of results) {
      if (!hash.startsWith('Error:')) {
        results.set(algo, hash.toUpperCase());
      }
    }
  }

  return results;
}

/**
 * Get list of supported algorithms
 */
function getSupportedAlgorithms() {
  return hashGenerator.getSupportedAlgorithms();
}

module.exports = {
  generateHashes,
  getSupportedAlgorithms,
  HashGenerator
};