# Ashay Strength

A sports-aware four-day upper/lower planner and training dashboard. It includes flexible scheduling, exercise substitutions, set logging, estimated 1RM trends, and body measurements.

## Local development

```bash
npm install
npm run dev
```

## Exercise video links

The editable catalog is available in `public/exercise-video-links.xlsx` and `public/exercise-video-links.csv`. The dashboard reads `public/exercise-video-links.json` when it loads and uses the matching YouTube link on each exercise's Instructions tab. Fill in `youtube_url` and, optionally, `video_label` in Excel; after the completed file is returned to the project, sync those rows into the JSON catalog before deploying.

## Supabase setup

Run `supabase/schema.sql` in the Supabase SQL Editor. The app uses magic-link authentication and Row Level Security so each account can only access its own records.

In Authentication > URL Configuration, set the site URL to the GitHub Pages URL and add the local development URL to the redirect allow list.

The browser only uses the Supabase project URL and publishable key. Never add a database password or service-role key to this repository.

## Medical note

The program is general fitness guidance based on stated goals, schedule, and historical measurements. It is not medical advice or a diagnosis.
