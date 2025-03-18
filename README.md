
# Lead Calculator App

This application calculates potential lead values based on website traffic data.

## Project Structure

This is a full-stack application with:
- Frontend: React + Vite
- Backend: Express.js

## Deployment Instructions

### Important: This app requires both frontend and backend to run together

For Railway or any other hosting platform, make sure:

1. The build script creates the frontend files
2. The start script runs the Express server
3. The Express server serves both the API endpoints and the static frontend files

### Setup for Production

1. Install dependencies:
```
npm install
```

2. Build the frontend:
```
npm run build
```

3. Start the server:
```
npm start
```

The server will run on the PORT specified in your environment variables or default to 3001.

### Railway Configuration

Make sure your Railway service is configured to:

1. Run `npm run build` before starting
2. Use `npm start` (which should run `node server.js`) as the start command
3. Set the following environment variables:
   - PORT (optional, Railway sets this automatically)
   - SPYFU_API_USERNAME
   - SPYFU_API_KEY

## Development

For local development:

1. Start the Express server:
```
node server.js
```

2. In another terminal, start the Vite dev server:
```
npm run dev
```

The frontend will proxy API requests to the Express server.
