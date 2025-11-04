# Contributing

Thanks for your interest in contributing to UiSelector! Below are a few guidelines to help you get started.

Reporting issues
- Open an issue and include a short description, steps to reproduce, and any relevant screenshots.

Development workflow

1. Fork the repository and create a feature branch.
2. Run locally:

```powershell
npm install
npm run dev
```

3. Make changes, run `npm run typecheck` to ensure TypeScript passes, and open a PR.

CI
- This repo includes a GitHub Actions workflow that runs `npm ci` and `npm run typecheck` on push and pull requests.

Style and tests
- Keep changes small and focused. If you add public behavior, include tests where appropriate.

License
- By contributing, you agree that your contributions will be licensed under the project's MIT license.
