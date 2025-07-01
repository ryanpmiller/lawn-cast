# LawnCast

Smart watering advice for your lawn based on weather data and lawn conditions.

## Development

### Prerequisites

- Node.js (v18 or later)
- npm

### Getting Started

1. Install dependencies:

    ```bash
    npm install
    ```

2. Start the development server:

    ```bash
    npm run dev
    ```

3. Start the proxy server (for NOAA data):
    ```bash
    npm run proxy
    ```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run test` - Run tests
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting
- `npm run e2e` - Run end-to-end tests
- `npm run proxy` - Start NOAA data proxy server

### Code Quality

This project uses automated code quality checks:

- **Formatting**: Prettier is used for code formatting
- **Linting**: ESLint for code quality and consistency
- **Testing**: Vitest for unit tests, Playwright for e2e tests

### Pre-commit Hooks

The project has pre-commit hooks that will:

1. **Check formatting** - Fails if code is not properly formatted
2. **Run linting** - Fails if there are linting errors
3. **Run tests** - Fails if any tests fail

If the formatting check fails, run `npm run format` to fix formatting issues, then commit again.

### Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Ensure all tests pass and code is properly formatted
5. Submit a pull request

## License

MIT License. See LICENSE file.
