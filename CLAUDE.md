# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

GKO 2026 Hackathon Showcase — a Next.js application for browsing hackathon project submissions stored in a Google Drive folder. Users authenticate via Google OAuth, and the app fetches and displays files from a configured Drive folder.

## Commands

- `npm run dev` — Start development server on localhost:3000
- `npm run build` — Production build
- `npm run start` — Start production server
- `npm run lint` — Run ESLint

## Tech Stack

- Next.js 14 (App Router), React 18, TypeScript 5 (strict mode)
- NextAuth v5 (beta) for Google OAuth
- googleapis for Google Drive API
- Tailwind CSS 3 for styling
- Deployed to GCP Cloud Run via Docker (port 8080, standalone output)

## Architecture

### Authentication Flow

`auth.ts` (root) configures NextAuth with Google OAuth, requesting Drive read-only scope. Access tokens are stored in the JWT via callbacks and exposed on the session. `src/middleware.ts` protects all routes except `/login`, `/api/auth`, and static assets.

The `next-auth` types are augmented in `src/types/next-auth.d.ts` to add `accessToken` to Session and JWT.

### Data Flow

The home page (`src/app/page.tsx`) is a server component that calls `getDriveFiles()` from `src/lib/drive.ts`, which uses the user's access token to query the Google Drive API for files in the configured folder. Results render as a grid of `FileCard` components that link to Google Drive.

### Path Aliases

- `@/*` → `./src/*`
- `@auth` → `./auth` (root-level auth config)

### Key Files

- `auth.ts` — NextAuth configuration (providers, callbacks, JWT handling)
- `src/lib/drive.ts` — Google Drive API client (`getDriveFiles()`, `getMimeTypeLabel()`)
- `src/middleware.ts` — Route protection via NextAuth middleware
- `src/app/page.tsx` — Main dashboard (server component, fetches Drive files)
- `src/app/login/page.tsx` — Login page with Google OAuth button
- `src/app/components/FileCard.tsx` — File/folder display card

## Environment Variables

See `.env.example`. Required: `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_DRIVE_FOLDER_ID`, `GOOGLE_DRIVE_FOLDER_NAME`.

## Conventions

- Server components by default; sign-in/sign-out use server actions
- `@next/next/no-img-element` is disabled where external Drive thumbnail URLs are used
- Next.js config is `next.config.js` (not `.ts`) — this version of Next.js doesn't support TypeScript config
