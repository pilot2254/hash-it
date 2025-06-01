#!/usr/bin/env node

const { program } = require('commander');
const chalk = require('chalk');
const { generateHashes, getSupportedAlgorithms } = require('./lib/hashers');
const { displayResults, validateInput } = require('./lib/utils');
const packageJson = require('./package.json');

program
  .name('hash-it')
  .description('Generate multiple hash types from text input')
  .version(packageJson.version);

program
  .argument('[text]', 'Text to hash (if not provided, will read from stdin)')
  .option('-a, --algorithm <type>', 'Specific algorithm to use (default: all)')
  .option('-f, --format <type>', 'Output format: table, json, plain', 'table')
  .option('-o, --output <file>', 'Output to file instead of console')
  .option('-l, --list', 'List all supported algorithms')
  .option('-u, --uppercase', 'Output hash in uppercase')
  .option('-q, --quiet', 'Suppress headers and formatting')
  .option('--no-color', 'Disable colored output')
  .action(async (text, options) => {
    try {
      // Handle list algorithms option
      if (options.list) {
        console.log(chalk.cyan('Supported Hash Algorithms:'));
        const algorithms = getSupportedAlgorithms();
        algorithms.forEach(algo => {
          console.log(chalk.white(`  - ${algo}`));
        });
        return;
      }

      // Get input text
      let inputText = text;
      if (!inputText) {
        inputText = await readFromStdin();
      }

      // Validate input
      const validation = validateInput(inputText, options);
      if (!validation.valid) {
        console.error(chalk.red(`Error: ${validation.error}`));
        process.exit(1);
      }

      // Generate hashes
      const results = await generateHashes(inputText, options);
      
      // Display results
      await displayResults(results, options);

    } catch (error) {
      console.error(chalk.red(`Error: ${error.message}`));
      process.exit(1);
    }
  });

// Handle stdin input
function readFromStdin() {
  return new Promise((resolve, reject) => {
    let input = '';
    
    if (process.stdin.isTTY) {
      console.log(chalk.yellow('Enter text to hash (press Ctrl+D when finished):'));
    }

    process.stdin.setEncoding('utf8');
    
    process.stdin.on('readable', () => {
      const chunk = process.stdin.read();
      if (chunk !== null) {
        input += chunk;
      }
    });

    process.stdin.on('end', () => {
      resolve(input.trim());
    });

    process.stdin.on('error', (error) => {
      reject(error);
    });
  });
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error(chalk.red('Uncaught Exception:'), error.message);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error(chalk.red('Unhandled Rejection at:'), promise, 'reason:', reason);
  process.exit(1);
});

program.parse();