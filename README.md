# CodeStride API

Welcome to the CodeStride API repository! This is where the magic happens for the official CodeStride API.

## Getting Started

If you'd like to contribute, we'd love your input! Before you start, check out our [contribution guidelines](CONTRIBUTING.md). Here are a few things to keep in mind:

-   This project is built with TypeScript. If you're new to TypeScript, you can quickly get up to speed [here](https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes.html).
-   Install dev dependencies with `pnpm install --save-dev` before making changes.
-   Follow the [conventional commit](https://www.conventionalcommits.org/en/v1.0.0/) guidelines for meaningful commit messages.
-   Ensure your code is properly formatted using our provided prettier setup.
-   **Test your code before submitting a pull request.**

## Running Locally

### Prerequisites

Make sure you have the following installed:

-   Node.js (v14 or higher)
-   Supabase project

### Getting your API Key and URL

1. Create a project on the [Supabase website](https://supabase.com).
2. Go to Project Settings > API and copy the URL and anon public key (API KEY).

### Starting the API Server

1. Rename `.env.example` to `.env` and fill in the necessary information.
2. Run `pnpm run build` followed by `pnpm run start`.

## Questions or Need Help?

Join our Discord community if you have any questions or just want to connect. You can find us [here](https://discord.gg/czbnhrWYHP).
