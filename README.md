
# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/2325c5e1-efcc-41cb-8acf-106e31180562

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/2325c5e1-efcc-41cb-8acf-106e31180562) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Set up the dev script (IMPORTANT - do this before starting the server)
node package-updater.js

# Step 5: Start the development server with auto-reloading and an instant preview.
npm run dev

# If you still encounter "missing script: dev" error, use one of these alternatives:
npm start        # Alternative 1
npx vite         # Alternative 2 (runs Vite directly)
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/2325c5e1-efcc-41cb-8acf-106e31180562) and click on Share -> Publish.

## I want to use a custom domain - is that possible?

We don't support custom domains (yet). If you want to deploy your project under your own domain then we recommend using Netlify. Visit our docs for more details: [Custom domains](https://docs.lovable.dev/tips-tricks/custom-domain/)

## Troubleshooting

### "Missing script: dev" error

If you see this error, it means the development script hasn't been added to your package.json. To fix it:

1. Run `node package-updater.js` to automatically add the script
2. Then run `npm run dev` again

Alternatively, you can directly use `npx vite` to start the dev server without modifying package.json.
