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

### Testing & Quality Assurance

The project includes comprehensive testing with automatic quality gates:

- **Unit Tests**: 60 tests covering components, logic, and API layers
- **E2E Tests**: 22 tests covering user workflows and integration
- **Precommit Hooks**: Automatic formatting, linting, and unit tests
- **Pre-push Hooks**: Automatic E2E testing before pushing
- **CI/CD**: GitHub Actions with parallel test execution

**Quality Tools**:

- **Formatting**: Prettier for consistent code style
- **Linting**: ESLint for code quality and consistency
- **Testing**: Vitest for unit tests, Playwright for E2E tests

**Development Workflow**:

1. **Commit**: Fast checks (format, lint, unit tests) in ~5 seconds
2. **Push**: Integration tests (E2E) in ~15 seconds
3. **CI**: Full validation pipeline in ~3-5 minutes

See [Testing Workflow Documentation](docs/testing-workflow.md) for detailed information.

### Troubleshooting

**Auto-formatting enabled**: Precommit automatically formats and stages changes
**E2E tests timeout**: Ensure ports 3001, 5173-5175 are available
**Need to bypass hooks**: Use `--no-verify` flag (sparingly)

### Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Ensure all tests pass and code is properly formatted
5. Submit a pull request

## License

MIT License. See LICENSE file.
