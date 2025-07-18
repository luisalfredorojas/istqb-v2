# CertifyMe

This repository contains the source for the CertifyMe application. Development takes place inside the `certifyme` folder which is a [Vite](https://vitejs.dev/) project.

## Installation

From the repository root install dependencies inside the `certifyme` directory:

```bash
cd certifyme
npm install
```

## Development server

Run the development server with:

```bash
npm run dev
```

Vite will start a local web server and watch the files in `src` and `public` for changes.

## Building for production

Create a production build using:

```bash
npm run build
```

The optimized output is written to the `dist/` directory. Static assets and compiled JavaScript/CSS will appear there, mirroring the structure in `public`.

## Directory structure

- `src/` – application source code (JavaScript modules and CSS)
- `public/` – static assets served during development, including exam data files in `public/data/exams`
- `dist/` – generated after running the build command and contains the production-ready site
- Exam data – JSON files describing available exams located under `public/data/exams` (and copied to `dist/data/exams` after a build)
