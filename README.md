# Joobs Build Guides — No-Login Setup

Login has been removed entirely. There are no accounts, no emails, no
passwords for regular visitors. Comments just ask for a display name.
Adding/editing creatures and plushies is now controlled by a single
passcode, checked on the server — never in the browser.

## If you already have this site live (migrating from the login version)

**1. Run the migration SQL once.** In Supabase → SQL Editor, paste in and
run `supabase/migration-remove-accounts.sql`. This removes the accounts
and follows tables, and updates the security rules — your existing 473
creatures and 85 plushies are completely untouched by this.

**1b. Run the rate limiting migration too.** Also paste in and run
`supabase/migration-rate-limiting.sql`. This adds a small table that
blocks anyone who guesses the wrong passcode 5 times in a row for a
while, so the passcode can't just be brute-forced.

**1c. Run the traits migration.** Also paste in and run
`supabase/migration-traits.sql`. This moves the traits into the database
(with the 8 current ones already filled in) so you can edit them from the
site. Until you run it, the Traits tab still shows the built-in list but
editing it will say the table doesn't exist yet.

**1d. Run the tags migration.** Also paste in and run
`supabase/migration-tags.sql`. This adds the column that stores build tags
(META, UNDERRATED, or your own). Run it before saving tags on a build.

**2. Set your passcode.** In Vercel → Settings → Environment Variables,
add a new one:
```
OWNER_PASSCODE = something-only-you-know
```
Pick something you'll remember — this is the only thing standing between
a regular visitor and someone who can edit the site.

**3. Deploy this updated code** (see the usual git steps below), then
redeploy in Vercel so the new environment variable actually takes effect.

## How to use owner mode

1. On the live site, press **Ctrl+Shift+K** anywhere
2. Type in your passcode, press **Unlock**
3. That's it — "+ Add Creature" and "+ Add Plushie" buttons appear, an
   "Edit" button shows up on every creature's page, and a "Delete" button
   appears on every comment
4. Your browser remembers the passcode after that, so you won't need to
   re-enter it every visit — but every actual save still re-checks it on
   the server each time, so someone can't just fake being unlocked by
   editing your browser's local storage

To give someone else the same access, just share the passcode with them
directly (there's no separate "moderator" tier anymore — anyone with the
passcode has full access, so only share it with people you trust
completely).

## Deploying code changes (same as before)

```
git add .
git commit -m "your message"
git push
```
Vercel picks this up and redeploys automatically.

## Seeding (only needed once, already done if migrating)

```
npm install
npm run seed:creatures
npm run seed:plushies
```
