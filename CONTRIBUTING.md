# Contributing to Seditor

Thanks for your interest in contributing! 🎉

## Setup

```bash
git clone <repo>
cd seditor
pnpm install
pnpm build
pnpm test
```

## Development workflow

- `pnpm dev` — start playground in watch mode
- `pnpm test` — run all tests
- `pnpm typecheck` — type-check all packages
- `pnpm lint` — lint all packages
- `pnpm build` — build all packages

## Architecture rules (do not break)

1. `packages/core` must **never** import `react` or `@lexical/react`. The CI
   guardrail checks this on every PR.
2. Config and toolbar are defined as plain objects/JSON — no JSX children to
   describe configuration.
3. All theming uses CSS variables (`--se-*`) — no hard-coded colors/spacing
   in JS.

## Committing changes

This repo uses [changesets](https://github.com/changesets/changesets) for
versioning. Before opening a PR:

```bash
pnpm changeset
```

Follow the prompts to describe the change. Commit the `.changeset/` file with
your code changes.

## Branching

- `main` — stable, publishable
- feature branches — `feat/<name>`
- bugfix branches — `fix/<name>`
