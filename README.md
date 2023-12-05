# CourseWave

CourseWave is a dynamic course-selling website developed with comprehensive course management functionalities.

## Overview

CourseWave provides a platform for managing and selling courses. It leverages technologies like Next.js, Tailwind CSS, GraphQL, and PostgreSQL through Hasura. The frontend is powered by Next.js and Tailwind CSS, while the backend utilizes GraphQL and PostgreSQL for efficient data handling. Authentication is implemented using NextAuth, and state management is achieved with Recoil.

## Modules

The project is organized into the following modules:

- apps/client: This module contains the frontend of the application, built with Next.js
- apps/backend: This module handles GraphQL queries, Hasura integration, and database management.
- apps/backend/server: This sub-module is dedicated to Hasura that exposes a GraphQL server over a PostgreSQL database in a Docker Container.
- apps/backend/client: This hub-module contains GraphQL clients that allow the frontend to interact with the backend.
- packages/ui/components: This module contains UI components that are used in frontend of the application. 
- packages/configs/tailwind: This module contains the configuration of Tailwind CSS, so that it can be used throughout the monorepo.  


## Components

Key components include:

- **Next.js**: Frontend framework for building React applications.
- **Tailwind CSS**: Utility-first CSS framework for styling.
- **GraphQL**: Query language and runtime for APIs.
- **PostgreSQL**: Relational database for data storage.
- **Hasura**: GraphQL engine for PostgreSQL, facilitating real-time updates.

## Contributing

We welcome contributions to enhance CourseWave! To contribute:

1. Fork the repository.
2. Create a new branch for your feature or bug fix.
3. Commit your changes and push to your branch.
4. Submit a pull request detailing your changes.

## Getting Started

To set up the project locally, follow these steps:

1. Clone the repository: `git clone https://github.com/your-username/CourseWave.git`
2. Navigate to the project directory: `cd CourseWave`
3. Configure environment variables.
4. Install dependencies: `yarn install`
5. Follow instructions in individual subdirectories (`apps/client`, `apps/backend/`, etc.) for specific setup and deployment steps.
