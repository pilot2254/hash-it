const fs = require('fs').promises;
const path = require('path');
const chalk = require('chalk');
const Table = require('cli-table3');

/**
 * Validate input parameters
 */
function validateInput(text, options = {}) {
  if (!text || text.trim().length === 0) {
    return {
      valid: false,
      error: 'Input text cannot be empty'
    };
  }

  if (options.algorithm) {
    const { getSupportedAlgorithms } = require('./hashers');
    const supportedAlgorithms = getSupportedAlgorithms();
    const upperAlgo = options.algorithm.toUpperCase();
    
    if (!supportedAlgorithms.includes(upperAlgo)) {
      return {
        valid: false,
        error: `Unsupported algorithm: ${options.algorithm}. Use --list to see supported algorithms.`
      };
    }
  }

  const validFormats = ['table', 'json', 'plain'];
  if (options.format && !validFormats.includes(options.format)) {
    return {
      valid: false,
      error: `Invalid format: ${options.format}. Supported formats: ${validFormats.join(', ')}`
    };
  }

  return { valid: true };
}

/**
 * Display results in specified format
 */
async function displayResults(results, options = {}) {
  const format = options.format || 'table';
  const output = formatOutput(results, format, options);

  if (options.output) {
    await writeToFile(output, options.output);
    if (!options.quiet) {
      console.log(chalk.green(`Results written to: ${options.output}`));
    }
  } else {
    console.log(output);
  }
}

/**
 * Format output based on specified format
 */
function formatOutput(results, format, options = {}) {
  const useColor = !options.noColor;
  
  switch (format) {
    case 'json':
      return formatAsJson(results);
    
    case 'plain':
      return formatAsPlain(results, useColor);
    
    case 'table':
    default:
      return formatAsTable(results, options, useColor);
  }
}

/**
 * Format results as JSON
 */
function formatAsJson(results) {
  const jsonObject = {};
  for (const [algorithm, hash] of results) {
    jsonObject[algorithm] = hash;
  }
  return JSON.stringify(jsonObject, null, 2);
}

/**
 * Format results as plain text
 */
function formatAsPlain(results, useColor = true) {
  const lines = [];
  
  for (const [algorithm, hash] of results) {
    if (useColor) {
      const coloredAlgo = chalk.cyan(algorithm.padEnd(12));
      const coloredHash = hash.startsWith('Error:') 
        ? chalk.red(hash) 
        : chalk.white(hash);
      lines.push(`${coloredAlgo} ${coloredHash}`);
    } else {
      lines.push(`${algorithm.padEnd(12)} ${hash}`);
    }
  }
  
  return lines.join('\n');
}

/**
 * Format results as table
 */
function formatAsTable(results, options = {}, useColor = true) {
  const table = new Table({
    head: useColor 
      ? [chalk.cyan('Algorithm'), chalk.cyan('Hash Value')]
      : ['Algorithm', 'Hash Value'],
    colWidths: [15, 70],
    wordWrap: true,
    style: {
      head: [],
      border: useColor ? ['grey'] : []
    }
  });

  for (const [algorithm, hash] of results) {
    const displayHash = hash.startsWith('Error:') && useColor
      ? chalk.red(hash)
      : hash;
    
    table.push([algorithm, displayHash]);
  }

  let output = '';
  
  if (!options.quiet) {
    const title = useColor 
      ? chalk.bold.blue('Hash Generation Results')
      : 'Hash Generation Results';
    output += `\n${title}\n`;
  }
  
  output += table.toString();
  
  return output;
}

/**
 * Write output to file
 */
async function writeToFile(content, filePath) {
  try {
    const directory = path.dirname(filePath);
    await fs.mkdir(directory, { recursive: true });
    await fs.writeFile(filePath, content, 'utf8');
  } catch (error) {
    throw new Error(`Failed to write to file ${filePath}: ${error.message}`);
  }
}

/**
 * Get file stats for validation
 */
async function getFileStats(filePath) {
  try {
    return await fs.stat(filePath);
  } catch (error) {
    return null;
  }
}

/**
 * Sanitize filename for cross-platform compatibility
 */
function sanitizeFilename(filename) {
  return filename.replace(/[<>:"/\\|?*]/g, '_');
}

/**
 * Format bytes to human readable format
 */
function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

module.exports = {
  validateInput,
  displayResults,
  formatOutput,
  writeToFile,
  getFileStats,
  sanitizeFilename,
  formatBytes
};