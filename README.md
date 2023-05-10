<div align="center">
  <h1 align="center">Marketplace</h1>
  <p align="center">
    <a href="https://discord.gg/onlydust">
        <img src="https://img.shields.io/badge/Discord-6666FF?style=for-the-badge&logo=discord&logoColor=white">
    </a>
    <a href="https://twitter.com/intent/follow?screen_name=onlydust_xyz">
        <img src="https://img.shields.io/badge/Twitter-1DA1F2?style=for-the-badge&logo=twitter&logoColor=white">
    </a>
    <a href="https://contributions.onlydust.xyz/">
        <img src="https://img.shields.io/badge/Contribute-6A1B9A?style=for-the-badge&logo=notion&logoColor=white">
    </a>
    <a href="https://codecov.io/gh/onlydustxyz/marketplace" > 
        <img src="https://img.shields.io/codecov/c/gh/onlydustxyz/marketplace?style=for-the-badge&token=BCU5QG0IFJ"/>
    </a>
    <img src="https://github.com/onlydustxyz/marketplace/actions/workflows/install.yml/badge.svg" />
  </p>
  
  <h3 align="center">Marketplace monorepo</h3>

</h3>
</div>

> ## ⚠️ WARNING! ⚠️
>
> This repo contains highly experimental code.
> Expect rapid iteration.

# Global architecture

![Global architecture](doc/architecture.excalidraw.png)

# Github indexing

![Github indexing](doc/github_indexing.excalidraw.png)

# Data Diagram

[Data Diagram](./doc/data_diagram.md)

# Development

## 🎗️ Prerequisites

- [rust](https://www.rust-lang.org/tools/install)
- [yarn](https://classic.yarnpkg.com/lang/en/docs/install/#mac-stable)
- [docker](https://docs.docker.com/get-docker/)

## 📦 Installation

```
cp .env.example .env
```

Then modify the values tagged with `REPLACE_AT_INSTALLATION` according to your personal accounts.

You can now run the project installation script:

```
make install
```

## 🔬 Usage

List all available commands:

```
make
```

Below are some examples of usage.

### Load latest staging dump

Start by cleaning your local env:

```
make docker/clean
```

Then, load the dump:

```
make db/load-fixtures
```

If the dump is out of date, you can update it with:

```
make db/update-staging-dump
```

### Using Hasura

See [Hasura documentation](./hasura).

For convenience, some commands are available from the root of the repo:

```
make hasura/start # Apply metadata and start the console
```

### 🔬 Frontend

To run in development mode

```bash
yarn dev
```

To run in development mode with a the staging backend

```bash
yarn dev --mode staging
```

#### 🛠 Build

```bash
yarn build
```

To run build locally :

```bash
yarn preview
```

### 📚 Storybook

To view components in isolation using [Storybook](https://storybook.js.org/)

```bash
yarn storybook
```

### 🕸 GraphQL codegen

To generate types from the Hasura GraphQL schema during development

```bash
yarn generate --watch
```

Use the `HASURA_URL` and `HASURA_SECRET_KEY` environment variables to connect to a custom Hasura environment

## 🌡️ Testing

### Backend

Make sure the docker is up and running.
Then run the following command:

```
cargo test
```

### Frontend unit/integration

```bash
yarn test
```

### End-to-end testing

```
make app/background-start
make playwright/test
```

## Migrate database

- To create a new migration, start running

```
diesel migration generate <your-migration-name>
```

- Edit the generated files with your SQL code for `up.sql` and `down.sql`
- Test your migration up and down by running

```
diesel migration run
diesel migration revert
diesel migration run
```

- The file `schema.rs` should be then automatically updated

## Monitoring

We use Datadog as a monitoring solution.

```json
$~ heroku drains --json --app onlydust-backend-staging

[
  {
    "id": "459e4e77-bbaa-4be2-8237-98fafe856d19",
    "url": "https://http-intake.logs.datadoghq.eu/api/v2/logs/?dd-api-key=$API_KEY&ddsource=heroku&env=staging&service=marketplace-backend&host=staging.api.onlydust.xyz",
    ...
  }
]
```

```json
$~ heroku drains --json --app onlydust-backend-production

[
  {
    "id": "c0b077bf-f0cc-4049-80e9-5b55e18d701a",
    "url": "https://http-intake.logs.datadoghq.eu/api/v2/logs/?dd-api-key=$API_KEY&ddsource=heroku&env=production&service=marketplace-backend&host=api.onlydust.xyz",
    ...
  }
]
```

# 📄 License

**marketplace** is released under [MIT](LICENSE).

# Acknowledgements

This project is tested with BrowserStack.
