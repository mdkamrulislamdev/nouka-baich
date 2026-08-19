# Deploy & GitHub — Nouka Baich 3D

## Push to GitHub (fix auth)

The remote is `https://github.com/mdkamrulislamdev/nouka-baich.git`.

If push fails with **Permission denied to mkamrul9**, Git is using the wrong GitHub account.

### Option A — Windows Credential Manager (HTTPS)

1. Open **Control Panel → Credential Manager → Windows Credentials**.
2. Remove entries for `git:https://github.com`.
3. In PowerShell:

```powershell
git push origin main
```

4. Sign in as **mdkamrulislamdev** when prompted.

### Option B — SSH

```powershell
git remote set-url origin git@github.com:mdkamrulislamdev/nouka-baich.git
git push origin main
```

Ensure your SSH key is added to the **mdkamrulislamdev** GitHub account.

### Option C — Personal access token

1. GitHub → Settings → Developer settings → Personal access tokens.
2. Create a token with `repo` scope for **mdkamrulislamdev**.
3. Use the token as the password when `git push` prompts.

---

## Deploy to Vercel

### One-time setup

1. Install Vercel CLI: `npm i -g vercel`
2. Log in: `vercel login`
3. From the project root:

```powershell
npm run build
vercel
```

Follow prompts: link to your Vercel account, confirm Next.js, deploy.

### Production deploy

```powershell
vercel --prod
```

The game is a static-friendly Next.js app (`/` prerendered). No server secrets required.

### Environment variables

None required for the current build. Optional future vars:

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_BOAT_MODEL_PATH` | Override player boat GLTF path |

---

## CI (optional)

A GitHub Actions workflow at `.github/workflows/ci.yml` runs lint and production build on push/PR.
