# คู่มือต่อ Firebase สำหรับ MASS DUEL ONLINE

The public website is deployed separately from the multiplayer backend. The GitHub Pages workflow builds the frontend; it does NOT create a Firebase project or deploy Cloud Functions.

## Project setup (requires authorized Firebase project owner)

1. Create/select a Firebase project.
2. Register a Web App and enable Authentication > Anonymous sign-in.
3. Create a Realtime Database and record its exact database URL.
4. Confirm Cloud Functions billing requirements and get approval before enabling a paid plan.
5. Deploy backend from the repository root with Firebase CLI:
   ```bash
   npm install
   cd functions && npm install && npm run build && npm test
   cd ..
   firebase login
   firebase use --add
   firebase deploy --only database,functions
   ```
6. Open repository Settings > Secrets and variables > Actions > Variables and add:
   - VITE_FIREBASE_API_KEY
   - VITE_FIREBASE_AUTH_DOMAIN
   - VITE_FIREBASE_DATABASE_URL
   - VITE_FIREBASE_PROJECT_ID
   - VITE_FIREBASE_APP_ID

   These are Web SDK initialization identifiers, not a service-account key. Never publish service-account JSON/private keys.
7. Run the GitHub Actions workflow named **Build and Deploy GitHub Pages** or push to main.
8. In Settings > Pages, set Source to **GitHub Actions**.
9. Verify host creation, QR join and answer sync across two devices, teacher pause/skip, results and server-side scoring.

## Limits before classroom use

- Cloud Functions must be deployed; the frontend alone cannot start rooms.
- Teacher identity currently relies on the anonymous Firebase UID of the creating browser. Do not clear browser data during a game.
- Add App Check and per-user rate limits before public/high-volume usage.
- There is no automatic expiry of stale rooms and no teacher email sign-in.
- Scheduled round expiry may occur up to about a minute after the visible timer.
- Do not add real student names, school identification numbers, or other personal data to team names.

## Troubleshooting

If the site says "ต้องเชื่อมต่อ Firebase", the GitHub Action built without one or more required `VITE_FIREBASE_*` variables. Re-run the workflow after adding them.

If the page loads but create-room fails, verify Anonymous Auth, deployed callable Functions in `asia-southeast1`, Realtime Database URL, and rules.

If browser console reports permission-denied, check database.rules.json was deployed and the Firebase project IDs match.
