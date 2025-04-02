# enterN | Ghost Tamer Extension

## Overview
The Ghost Tamer extension helps job seekers track and visualize employer "ghosting" incidents across job platforms. It provides transparency into company hiring practices by collecting and displaying data about when companies stop communicating with candidates during the hiring process.

## Features
- Automatically detects job listings on major job boards (LinkedIn, Indeed, ZipRecruiter, Monster)
- Displays ghosting ratings and statistics when viewing job listings
- Allows users to report ghosting incidents they experience
- Provides detailed statistics on when ghosting typically occurs in the hiring process
- Settings to customize extension behavior

## Supported Job Boards
- LinkedIn
- Indeed
- ZipRecruiter
- Monster

## Installation for Development

### Chrome
1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" in the top-right corner
3. Click "Load unpacked" and select the `dist/extension` directory
4. The extension should now appear in your extensions list

### Firefox
1. Open Firefox and navigate to `about:debugging#/runtime/this-firefox`
2. Click "Load Temporary Add-on..." and select any file within the `dist/extension` directory
3. The extension should now appear in your extensions list

## Building the Extension
Run the build script to create the extension package:
```
./build-extension.sh
```

The built extension will be available in the `dist/extension` directory.

## Configuration
In development mode, the extension connects to the API at `http://localhost:5000`. For production, update the `API_BASE_URL` constant in both `background.js` and `extensionApi.ts` to point to your production API server.

## Technology Stack
- Pure JavaScript for content and background scripts
- TypeScript for the main application
- React for the popup UI
- Drizzle ORM with PostgreSQL for data storage
- Express for the backend API