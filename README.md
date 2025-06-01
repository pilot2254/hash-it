# Hash-It

A comprehensive command-line tool for generating multiple hash types from text input. Supports a wide variety of hash algorithms including MD5, SHA variants, CRC checksums, and more.

## Features

- Support for 15+ hash algorithms
- Multiple output formats (table, JSON, plain text)
- File output capability
- Stdin input support
- Configurable output formatting
- Cross-platform compatibility
- Zero configuration required

## Supported Hash Algorithms

- **MD Family**: MD4, MD5
- **SHA Family**: SHA1, SHA-224, SHA-256, SHA-384, SHA-512
- **SHA-3 Family**: SHA3-224, SHA3-256, SHA3-384, SHA3-512
- **RIPE Family**: RIPEMD160
- **Checksums**: CRC16, CRC32, Adler32
- **Authentication**: NTLM

## Installation

### Global Installation (currently not supported)
```bash
npm install -g hash-it
```

### Local Development

```shellscript
git clone https://github.com/pilot2254/hash-it.git
cd hash-it
npm install
npm link
```

## Usage

### Basic Usage

```shellscript
# Hash a simple string
hash-it "Hello, World!"

# Hash from stdin
echo "Hello, World!" | hash-it

# Interactive mode
hash-it
```

### Advanced Usage

```shellscript
# Use specific algorithm
hash-it "password123" --algorithm sha256

# Output as JSON
hash-it "data" --format json

# Save to file
hash-it "important data" --output hashes.txt

# Uppercase output
hash-it "data" --uppercase

# Quiet mode (no headers)
hash-it "data" --quiet

# List all supported algorithms
hash-it --list
```

### Output Formats

#### Table Format (Default)

```plaintext
Hash Generation Results
┌─────────────┬──────────────────────────────────────────────────────────────────────┐
│ Algorithm   │ Hash Value                                                           │
├─────────────┼──────────────────────────────────────────────────────────────────────┤
│ MD5         │ 65a8e27d8879283831b664bd8b7f0ad4                                     │
│ SHA1        │ 0a4d55a8d778e5022fab701977c5d840bbc486d0                             │
│ SHA256      │ 185f8db32271fe25f561a6fc938b2e264306ec304eda518007d1764826381969     │
└─────────────┴──────────────────────────────────────────────────────────────────────┘
```

#### JSON Format

```json
{
  "MD5": "65a8e27d8879283831b664bd8b7f0ad4",
  "SHA1": "0a4d55a8d778e5022fab701977c5d840bbc486d0",
  "SHA256": "185f8db32271fe25f561a6fc938b2e264306ec304eda518007d1764826381969"
}
```

#### Plain Format

```plaintext
MD5          65a8e27d8879283831b664bd8b7f0ad4
SHA1         0a4d55a8d778e5022fab701977c5d840bbc486d0
SHA256       185f8db32271fe25f561a6fc938b2e264306ec304eda518007d1764826381969
```

## Command Line Options

| Option | Description | Default
|-----|-----|-----
| `-a, --algorithm <type>` | Specific algorithm to use | all
| `-f, --format <type>` | Output format: table, json, plain | table
| `-o, --output <file>` | Output to file instead of console | -
| `-l, --list` | List all supported algorithms | -
| `-u, --uppercase` | Output hash in uppercase | false
| `-q, --quiet` | Suppress headers and formatting | false
| `--no-color` | Disable colored output | false
| `-h, --help` | Display help information | -
| `-V, --version` | Display version number | -


## Examples

### Password Hashing

```shellscript
# Generate multiple hashes for password verification
hash-it "mySecurePassword123" --format json --output password-hashes.json
```

### File Integrity Checking

```shellscript
# Generate checksums for file verification
cat important-file.txt | hash-it --algorithm sha256 --quiet
```

### Batch Processing

```shellscript
# Process multiple inputs
echo -e "data1\ndata2\ndata3" | while read line; do
  echo "Input: $line"
  hash-it "$line" --format plain --quiet
  echo "---"
done
```

## Development

### Running Tests

```shellscript
npm test
```

### Code Formatting

```shellscript
npm run format
```

### Linting

```shellscript
npm run lint
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request


## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Security Considerations

- This tool is designed for general-purpose hashing and checksums
- For password storage, consider using bcrypt, scrypt, or Argon2
- MD5 and SHA1 are included for compatibility but are not recommended for security-critical applications
- Always use appropriate salt and key stretching for password hashing