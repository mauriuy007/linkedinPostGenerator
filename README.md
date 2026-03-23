# LinkedIn Post Generator

## Project idea

This project is meant to help users generate LinkedIn posts starting from an initial idea.

The general application flow is designed as follows:

1. The user interacts with the frontend and provides context for the post.
2. The backend receives that information and orchestrates the external integrations.
3. It first connects to the LinkedIn API to authenticate the user and obtain publishing permissions.
4. It then uses the OpenAI API to transform the user's idea into a more polished post.
5. Finally, the backend can store the generated content and leave it ready for publication or publish it to LinkedIn.

In other words, the backend acts as the middle layer between the user interface, LinkedIn authentication and publishing, and OpenAI content generation.

## Conceptual flow between backend, LinkedIn, and OpenAI

The expected system flow is:

- The frontend collects the prompt, the context, and optionally a reference image.
- The backend validates the user's data and session.
- The backend starts LinkedIn authentication through OAuth.
- Once the user is authenticated, LinkedIn returns authorization to operate on that account.
- Using the user's context, the backend builds the request to OpenAI to generate the post content.
- The result can be stored in MongoDB as a draft or as a generated post.
- If the user confirms publication, the backend interacts with LinkedIn again to publish the final content.

## Project structure

The repository is divided into two main parts:

- `client/`: frontend application built with React and Vite.
- `server/`: backend built with Node.js and Express, including business logic and MongoDB persistence.

## File structure

### Project root

- `package.json`: general project configuration, scripts, and shared dependencies.
- `package-lock.json`: npm lockfile.
- `README.md`: general project documentation.

### `client/`

Contains the frontend application.

- `client/index.html`: base HTML file that loads the app.
- `client/vite.config.js`: Vite configuration.
- `client/public/favicon.ico`: project icon.

#### `client/src/app/`

- `App.jsx`: main component; controls the switch between the home view and the post creation view.
- `main.jsx`: React entry point.
- `routes.jsx`: reserved file for routing; currently empty.

#### `client/src/components/`

- `HomeView.jsx`: initial screen with the button that starts the flow.
- `CreateView.jsx`: view where the user uploads an image, writes context, and prepares the post generation request.

#### `client/src/`

- `styles.css`: global interface styles.

### `server/`

Contains the API, authentication logic, database connection, and the layer intended for external integrations.

#### `server/src/`

- `server.js`: backend entry point. It configures Express, loads environment variables, connects to MongoDB, and mounts the routes.

#### `server/src/routes/`

- `auth.routes.js`: defines authentication endpoints, currently `login` and `register`.

#### `server/src/controllers/`

- `auth.controller.js`: handles authentication HTTP requests, performs basic validation, and returns responses to the client.

#### `server/src/services/`

This is where the integration logic with external services lives.

- `services/linkedin/auth/linkedinAuth.service.js`: builds the OAuth redirect to LinkedIn to start login and authorization.
- `services/openAi/openAi.service.js`: reserved for the OpenAI integration; currently empty.

#### `server/src/models/`

Domain models of the application, separated from MongoDB-specific logic.

- `models/User.js`: represents the user and contains username, password, and email validations.
- `models/Post.js`: represents a post and its data validation rules.

#### `server/src/mongoose/schemas/`

MongoDB schemas and persistent models.

- `mongoose/schemas/user.schema.js`: user schema and logic for creating users with hashed passwords.
- `mongoose/schemas/post.schema.js`: schema for generated or stored posts.

#### `server/src/utils/`

- `utils/jwtGenerator.js`: generates JWT tokens for sessions and authentication.

#### `server/src/errors/`

- `errors/UserError.js`: custom error for user validation and business rules.
- `errors/PostError.js`: custom error for post-related validations.

## Responsibility split

### Frontend

The frontend is responsible for:

- displaying the interface;
- collecting the user's text and context;
- allowing the user to select a reference image;
- triggering actions against the backend.

### Backend

The backend is responsible for:

- validating input data;
- handling local authentication;
- connecting to MongoDB;
- starting the LinkedIn authentication flow;
- centralizing the future OpenAI request for post generation;
- persisting users and posts.

### LinkedIn API

LinkedIn is used to:

- authenticate the user with OAuth;
- authorize permissions on the user's account;
- eventually publish the generated post.

### OpenAI API

OpenAI is used to:

- receive the user's prompt and context;
- generate a LinkedIn post draft;
- return a more polished version ready for review or publication.

## Current code state

The project structure already reflects the general architecture, but the full integration is still in progress.

At the moment:

- the frontend already provides the base UI for starting the post creation flow;
- the backend already includes the server, authentication routes, and MongoDB connection;
- there is an initial LinkedIn authentication service;
- the OpenAI layer already has a dedicated file, but its logic has not been implemented yet;
- the complete end-to-end flow from the interface to generation and final publication is not fully connected yet.

## Summary

The idea of this project is to build an application where the user prepares a content idea, the backend processes it, LinkedIn is used for authentication and publishing, and OpenAI is used to generate the post text. The current structure already separates frontend, backend, domain models, persistence, and external integrations clearly, which provides a solid base for completing the full flow.
