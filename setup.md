# Setup guide: Neon + Next.js on Vercel

Follow these in order. Total time: about 20 minutes.

## 0. Before you start
- Accounts: [Neon](https://neon.tech), [Vercel](https://vercel.com), [GitHub](https://github.com).
- Installed locally: Node 20+ and git.
- Pick a long admin password and note it down. You'll use it in step 4.

---

## 1. Create the Neon database
1. Neon Console → **New Project**. Name it `fun-friday` and choose a region near your team.
2. Open the project → **SQL Editor**.
3. Open `db/setup-and-seed.sql` from this repo, copy **all** of it, paste it into the editor and click **Run**.
   - It creates the tables and inserts all 17 participants with their secret characters.
   - The last query should list **17 rows**. If not, stop and fix that before continuing.
4. Get the connection string: project **Dashboard → Connect** → turn **Connection pooling ON** → copy the string. It looks like:
   ```
   postgresql://user:pass@ep-xxxx-pooler.region.aws.neon.tech/neondb?sslmode=require
   ```
   Keep it private. It is `DATABASE_URL`.

> `db/setup-and-seed.sql` contains the secret characters, so it is git-ignored. Never commit it or put it in a public repo.

## 2. Run it locally (recommended sanity check)
```bash
npm install
cp .env.example .env.local
```
Edit `.env.local`:
```
DATABASE_URL=<the Neon string from step 1>
ADMIN_PASSWORD=<your long admin password>
ADMIN_SESSION_SECRET=<output of: openssl rand -hex 32>
```
Then:
```bash
npm test        # should show 21 passed
npm run dev     # open http://localhost:3000
```
Use **Chrome or Firefox** locally. Safari drops `Secure` cookies on plain http.

If you test with a real email, that device becomes the locked device. Afterwards go to `/admin` → **Reset access** for that person so they can claim it themselves.

## 3. Push the code to GitHub
```bash
git init
git add .
git commit -m "Fun Friday portal"
git branch -M main
```
Create a **private** repo on GitHub, then:
```bash
git remote add origin https://github.com/<you>/fun-friday.git
git push -u origin main
```
Check that `.env.local` and `db/setup-and-seed.sql` are **not** in the repo on GitHub.

## 4. Deploy on Vercel
1. Vercel → **Add New → Project** → import the `fun-friday` repo.
2. Framework preset: **Next.js** (auto-detected). Leave build settings as default.
3. Open **Environment Variables** and add these three for **Production** (and Preview if you want previews):

   | Name | Value |
   |---|---|
   | `DATABASE_URL` | Neon pooled connection string |
   | `ADMIN_PASSWORD` | your admin password |
   | `ADMIN_SESSION_SECRET` | `openssl rand -hex 32` output (a different value from the password) |

4. Click **Deploy**. You'll get a URL like `https://fun-friday-xxxx.vercel.app`.

> Alternative: the Vercel **Neon integration** (Project → Storage → Neon) injects `DATABASE_URL` for you. You still add the two admin variables yourself.

## 5. Verify the deployment
1. Open `https://<your-app>.vercel.app/admin` → sign in with `ADMIN_PASSWORD`. You should see 17 participants, all **unclaimed**.
2. Open the main URL in a normal window → enter your own email → you should see the **Tap to reveal** card with your character.
3. Open a **private/incognito window** → enter the same email → you should see *"This assignment has already been opened on another device…"*. This confirms the lock works.
4. Back in `/admin`: your row shows **active**. Click **Reset access** and confirm. Now your device is revoked and the next device to enter your email claims it.
5. Reload the main page in the first window. It should now show the email form (old token revoked).

If all five work, you're live.

## 6. Run the game day
1. Share the URL with the 17 participants (e.g. in your team chat). Tell them:
   - Use their own **work email** (`name@sharepointdesigns.com`).
   - Open it on **one device** (the phone or laptop they'll use). It can't be opened on a second one.
   - Don't clear cookies, and don't use a private window.
2. Watch `/admin`: **Participants** shows who has opened theirs, **Access logs** shows attempts.
3. If someone is locked out (new phone, cleared cookies, wrong browser): `/admin` → **Reset access** on their row → tell them to open the link again on the device they want.
4. If someone claims the wrong person's email (anyone who knows an email can do this): **Reset access** on that person, then tell the real person to open the link first.

## 7. Custom domain (optional)
Vercel → Project → **Settings → Domains** → add your domain and follow the DNS instructions. Cookies work on any HTTPS domain with no changes.

## 8. After the event
- Delete the data: Neon SQL Editor → `TRUNCATE participants CASCADE;` (this also clears assignments, device access and logs, and the `ON DELETE SET NULL` log rows keep nothing sensitive).
- Or delete the Neon project and the Vercel project entirely.

---

## Changing characters later
Edit the third column in `db/setup-and-seed.sql` and re-run it in the Neon SQL Editor. It updates names and characters and never touches device locks, so people who already opened theirs will see the new text on their next visit.

## Troubleshooting
| Symptom | Fix |
|---|---|
| `/admin` says "Admin is not configured on the server." | `ADMIN_PASSWORD` or `ADMIN_SESSION_SECRET` is missing in Vercel. Add it and **redeploy** (env var changes need a new deploy). |
| API returns 500, logs say `DATABASE_URL is not set` | Add `DATABASE_URL` in Vercel and redeploy. |
| 500 with `relation "participants" does not exist` | Step 1 SQL was not run on this Neon database/branch. Check you're using the right project. |
| "Access not available." for a valid person | Email typo, or not in the `participants` table. Check in Neon: `SELECT email FROM participants;` |
| "Too many attempts" | Rate limit (10 tries per email / 30 per IP per 10 min). Wait 10 minutes. Everyone on one office network shares the IP limit, so ask people to stagger if it triggers. |
| Admin login keeps failing | Passwords are case-sensitive. 10 attempts per 10 min per IP are allowed. |
| Works on laptop but not locally on Safari | Safari rejects `Secure` cookies over http://localhost. Use Chrome/Firefox, or test on the Vercel URL. |
| Someone says "opened on another device" but it was them | They cleared cookies, used incognito, or changed browser. Reset their access. |

## Security reminder
There's no email verification by design. Anyone who knows a participant's email and gets there first can claim that person's character. Fine for a casual game. See `README.md` for the full trade-off.
