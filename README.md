# LinkedIn Post Generator

## Overview

This project helps a user authenticate with LinkedIn, upload an image, provide a prompt, generate a LinkedIn-ready post with Gemini, and preview the result before publishing.

The app is split into:

- `client/`: React + Vite frontend
- `server/`: Node.js + Express backend

## Current flow

The current end-to-end flow is:

1. The user starts from the frontend and authenticates with LinkedIn.
2. The user uploads an image and writes the context or prompt for the post.
3. The frontend converts the selected image to base64 and sends it to the backend together with the prompt.
4. The backend validates the request in `postController`.
5. `postController` calls `generatePost` from `gemini.service.js`.
6. Gemini generates the post text using the prompt and the uploaded image.
7. The backend returns a generated post object to the frontend.
8. The frontend shows a loading overlay while generation is in progress.
9. Once the response arrives, the frontend shows a preview overlay with the generated text and image.

At this stage, the generation and preview flow is connected. The final publication to LinkedIn is still pending.

## Technologies used

- React 19
- Vite
- Node.js
- Express
- MongoDB / Mongoose
- Joi
- LinkedIn OAuth
- Google Gemini via `@google/genai`

## Project structure

### Root

- `package.json`: scripts and dependencies
- `package-lock.json`: npm lockfile
- `README.md`: project documentation

### `client/`

Frontend application built with React and Vite.

- `client/index.html`: app entry HTML
- `client/vite.config.js`: Vite configuration
- `client/public/favicon.ico`: favicon

#### `client/src/app/`

- `App.jsx`: main app state and flow orchestration
- `main.jsx`: React entry point
- `routes.jsx`: reserved routing file

#### `client/src/components/`

- `HomeView.jsx`: initial screen with the button to start the LinkedIn flow
- `CreateView.jsx`: screen to upload an image and write the prompt
- `LoadingOverlay.jsx`: fullscreen loading layer shown while Gemini is generating the post
- `PostPreviewOverlay.jsx`: fullscreen preview layer that shows the generated LinkedIn post with image and text

#### `client/src/`

- `styles.css`: global styles for the app, overlays, loading state, and preview modal

### `server/`

Backend application built with Express.

#### `server/src/`

- `server.js`: loads environment variables, configures Express, enables CORS, parses request bodies, mounts routes, and starts the server

#### `server/src/routes/`

- `auth.routes.js`: LinkedIn auth endpoints
- `post.routes.js`: post generation endpoint

#### `server/src/controllers/`

- `postController.js`: validates the incoming request, calls Gemini, builds the `Post` object, and returns it to the client

#### `server/src/services/`

- `services/gemini/gemini.service.js`: sends prompt + image to Gemini and returns generated post text
- `services/linkedin/auth/linkedinAuth.service.js`: handles LinkedIn OAuth login and callback flow
- `services/linkedin/post/createLinkedinPost.js`: reserved for future LinkedIn publishing logic

#### `server/src/models/`

- `models/Post.js`: domain representation of a generated post
- `models/User.js`: domain representation of a user

#### `server/src/mongoose/schemas/`

- `mongoose/schemas/post.schema.js`: MongoDB schema for posts
- `mongoose/schemas/user.schema.js`: MongoDB schema for users

#### `server/src/validators/`

- `createPostValidator.js`: validates prompt, author, optional image URL, base64 image, MIME type, and file name

#### `server/src/errors/`

- `errors/PostError.js`: post-related custom errors
- `errors/UserError.js`: user-related custom errors

## Backend behavior

### Post generation

The post generation endpoint is:

- `POST /api/posts/create`

Expected request payload:

```json
{
  "title": "Short title",
  "content": "Prompt or context written by the user",
  "authorUsername": "linkedin-user",
  "imageBase64": "base64-encoded-image",
  "imageMimeType": "image/png",
  "imageName": "logo.png"
}
```

What the backend does:

- validates the payload with Joi
- calls Gemini with the user prompt
- includes the uploaded image when available
- returns a `Post` object with the generated text in `content`
- builds `imageUrl` as a data URL when the image came from base64 input

### LinkedIn auth

The auth flow currently includes:

- `GET /api/auth/linkedin`
- `GET /api/auth/linkedin/callback`

The frontend redirects the user to the LinkedIn auth route and receives the result through query params after the callback.

## Frontend behavior

The frontend currently supports:

- LinkedIn login start
- prompt input
- image selection from local disk
- image conversion to base64 before sending the request
- request submission to the backend
- loading screen while Gemini is generating the post
- preview modal with generated text and image
- debug logs in the browser console for request and response flow

## Environment variables

The backend reads environment variables from `server/.env`.

Important variables used by the current code:

```env
MONGODB_URI=your_mongodb_connection_string
FRONTEND_URL=http://localhost:5173
LINKEDIN_CLIENT_ID=your_linkedin_client_id
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret
LINKEDIN_REDIRECT_URI=http://localhost:3000/api/auth/linkedin/callback
GEMINI_API_KEY=your_gemini_api_key
```

Notes:

- `GEMINI_API_KEY` is required for post generation.
- `FRONTEND_URL` is used by the backend CORS configuration.
- Avoid spaces around `=` in `.env` entries.

## Running the project

Install dependencies:

```bash
npm install
```

Start the backend:

```bash
npm run dev
```

Start the frontend:

```bash
npm run client:dev
```

Build the frontend:

```bash
npm run client:build
```

## Current status

Implemented:

- LinkedIn OAuth start and callback flow
- prompt + image submission from frontend to backend
- Gemini post generation
- debug logs for backend and frontend generation flow
- loading overlay while generating
- preview overlay showing the generated post

Pending:

- final publication of the generated post to LinkedIn
- persistence of generated posts in MongoDB as part of the main flow
- richer post management after preview

## Summary

The project already supports a working generation flow from frontend to Gemini and back to the UI. A user can authenticate with LinkedIn, provide context plus an image, generate a post with Gemini, and preview the final result on screen. The next major step is wiring the generated post into the actual LinkedIn publishing flow.
