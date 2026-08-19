# Sonaria Build Guide — Real Site Setup

This is the foundation for the real, deployed version of your site, with actual
accounts and a moderator role system — the artifact's fake display-name login
can't securely support real moderators, so this replaces it with proper
Supabase authentication.

## What's built so far

- Database schema with a `role` column (`user` / `moderator` / `admin`)
- Row-level security rules enforced *in the database*, not just the UI:
  - Anyone can view comments, plushies, and creature data
  - Only the comment's author OR a moderator/admin can delete a comment
  - Only moderators/admins can add, edit, or delete creatures
  - Only moderators/admins can add, edit, or delete plushies
- Real email/password sign in and sign up
- A `CommentSection` component with a working moderator delete button
- A `CreaturesBrowser` component with search, stats, and a working "+ Add Creature" button for moderators/admins
- A `BuildEditor` component, moderator-only, for editing an existing creature's traits/plushies/elder/notes
- A `PlushiesTab` component with a working "+ Add Plushie" form for moderators/admins

## Setup steps

### 1. Create your accounts (all free)
- [Supabase](https://supabase.com) — click "New Project", pick a name and password, wait ~2 minutes for it to provision
- [GitHub](https://github.com) — create a new empty repository
- [Vercel](https://vercel.com) — sign in with your GitHub account

### 2. Set up the database
1. In your Supabase project, go to the **SQL Editor**
2. Open `supabase/schema.sql` from this project, copy all of it, paste it in, and click **Run**
3. This creates all the tables, security rules, and the auto-profile-creation trigger

### 3. Get your API keys
In Supabase: **Project Settings > API**. You'll need:
- `Project URL`
- `anon public` key

### 4. Connect the project
Create a file called `.env.local` in this project's root folder:
```
NEXT_PUBLIC_SUPABASE_URL=your-project-url-here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```
The service role key (also under **Project Settings > API**, further down the
page) is only used by the seed script to bypass the "moderators only" rule
for the initial data load. Never put this key in anything that ships to the
browser, only `.env.local` and the seed script use it.

### 5. Seed the known creatures and plushies
```
npm install
npm run seed:creatures
npm run seed:plushies
```
Both are safe to re-run, they won't create duplicates. Seeding creatures takes
a little longer since there are 473 of them, seeded in batches of 100.

### 6. Push to GitHub and deploy
```
git init
git add .
git commit -m "Initial setup"
git remote add origin https://github.com/your-username/your-repo.git
git push -u origin main
```
Then in Vercel: **Add New Project**, pick your repo, add the same three
environment variables from step 4 in Vercel's project settings, and deploy.

### 7. Make yourself admin
1. Sign up on your live site with your real account
2. In Supabase, go to **SQL Editor** and run:
   ```sql
   update profiles set role = 'admin' where username = 'your-username';
   ```
3. Refresh the site — you now have full moderator + admin powers

### 8. Appoint a moderator
Same idea, once someone has signed up:
```sql
update profiles set role = 'moderator' where username = 'their-username';
```
They'll immediately be able to delete any comment, add or edit creatures, and
add or edit plushies — the same permissions you have now, minus the ability
to appoint other moderators (that stays admin-only).

## What's still to come

This covers real accounts, the moderator/admin role system, and full add/edit
control over creatures and plushies. Still to port over from the artifact:
followers/following, the legal pages, and the actual page layout/visual
design matching the artifact's look. Tell me when you're ready to continue.
