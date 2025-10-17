This folder is the new location for the frontend portion of the repository.

What this contains
- The mover script will move the following frontend-related top-level items into this folder:
  - `src/`, `public/`, `index.html`, Vite/TypeScript/Tailwind configs, `package.json`, `bun.lockb`, and other frontend tooling files.

How to move files (Windows PowerShell)
1. From the repository root run:

   powershell -ExecutionPolicy Bypass -File scripts/move-frontend.ps1

2. The script is idempotent: running it again will skip items already moved.

After the move
- Verify the frontend builds by running the usual frontend commands from the new `frontend/` folder, for example:

  cd frontend
  npm install
  npm run dev

- Update CI/CD, Dockerfile or deployment manifests if they referenced top-level frontend paths.

Notes
- The script only moves files; it does not update imports or other code that reference absolute paths. If your build expects `package.json` at repo root, update scripts or CI accordingly.
