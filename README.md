# Backend Crypto App

This is the backend component of the Crypto App project. It provides the necessary APIs and services for managing cryptocurrency data.

## Technologies Used

- NestJS: A progressive Node.js framework for building efficient, scalable, and maintainable server-side applications.
- MongoDB: A popular NoSQL database for storing and managing data.
- Docker: A containerization platform for creating and managing containerized applications.

## Prerequisites

Before running the backend application, ensure you have the following installed on your system:

- Node.js (version 14 or later)
- Docker

## Getting Started

To get started with the backend app, follow these steps:

1. Clone this repository to your local machine:

```bash
   git clone <repository-url
```

2. Navigate to the project directory:

```bash
   cd btc_blockchain_explorer_backend
```

3. Install the dependencies:

```bash
   npm install
```

4. Configure the environment variables:

Create a new .env file based on the provided .env.example.
Update the environment variables in the .env file according to your configuration.

5. Start the MongoDB containers using Docker:

```bash
   docker-compose up -d
```

6. Start the backend application:

```bash
   npm run start:dev
```

7. The backend app should now be running on http://localhost:3000.

## Running Tests

To run the end-to-end (e2e) tests for the backend app, follow these steps:

- Ensure that the backend app and MongoDB containers are running.

- Open a new terminal window and navigate to the project directory.

- Run the following command to execute the tests:

```bash
   npm run test:e2e
```

This will run the e2e tests and display the test results.

## Available Scripts

In the project directory, you can run the following scripts:

- `npm run start:dev`: Starts the backend app in development mode.
- `npm run start:prod`: Starts the backend app in production mode.
- `npm run test`: Runs the tests for the backend app.
- `npm run test:e2e`: Runs the end-to-end (e2e) tests for the backend app.
