# Artem Belyavsky — portfolio

An English portfolio built with Next.js and React. Page content, styles, navigation and the screenshot viewer live in `src/app/page.tsx`.

## Local development

Use Node.js **22.23.3** (see `.nvmrc`) and npm **10.9.9** (`packageManager` in `package.json`). GitHub Actions pins the same versions. With nvm, run `nvm install` and `nvm use` before installing dependencies.

```sh
npm ci
npm run dev
```

Open http://localhost:3000.

## Production build and preview

```sh
npm run lint
npm run build
npm run typecheck
npm start
```

The build exports the complete static website to `out/`. The local preview uses Python 3 to serve that directory on http://localhost:3000. There is no Next.js server to run in production: deploy the contents of `out/` to a static host.

## Publish to GitHub Pages

The repository is configured for https://artembell.github.io/.

1. In the repository's **Settings → Pages**, select **GitHub Actions** as the source.
2. Push the reviewed changes to `master`, or run **Deploy Next.js site to Pages** manually from the Actions tab.
3. The workflow installs the locked dependencies, runs lint, builds and typechecks, then deploys only `out/`.

No deployment is triggered by a local commit. If the site moves to a custom domain, update `siteUrl` in `src/app/page.tsx`, `public/robots.txt` and `public/sitemap.xml` before building.

## Project repositories and screenshots

Set a project's `repository` in `personalProjects` to `owner/repository`. Leave it `null` while the source should not be linked. Browser agent harness is configured as `artembell/oh-my-tabs`; video analysis intentionally has no repository configured yet.

During the build, the site checks GitHub's public API without credentials. It displays repository links only for publicly accessible repositories, and reads screenshots from their `demo/images` directory on the default branch. Supported formats: PNG, JPG, JPEG, WebP, AVIF and GIF. Files are ordered by name; use prefixes such as `01-` and `02-` to control the order. Filenames become captions.

A missing/empty image directory, private repository or unavailable GitHub API produces no gallery or placeholder. There are no bundled test screenshots. GitHub API failures do not stop the portfolio build, so check the built page if expected images are missing.

Each card shows up to three small, uncropped thumbnails in its bottom-right corner. `+ N more` reveals the rest, and `Show less` collapses them. Clicking a thumbnail opens all available images in the full-size viewer. Keep uploaded screenshots small because static hosting serves the original images without an image optimization server.

GitHub Pages cannot refresh screenshots at runtime. After adding images or making a repository public, run the deployment workflow again. No token is required, and the portfolio does not modify any project repository.

## Dependency checks

Run `npm audit --omit=dev` for production packages. The release preparation check found no production vulnerabilities. The full development audit still reports three moderate findings in Tailwind 3's selector-parser dependency chain; resolving them through npm's suggested fix requires a Tailwind 4 migration. These affect the CSS build tooling, which processes this repository's checked-in styles. That separate migration is not included here.


## Updating the lock file

Use the pinned Node.js/npm versions. If a lock-file repair is needed, copy `package.json` and `package-lock.json` into a clean temporary directory without `node_modules`, then run `npm install --package-lock-only --ignore-scripts` there. Copy the resulting lock file back and verify `npm ci`, lint, build and typecheck. A successful install with an existing local dependency tree is not sufficient to validate a cross-platform CI lock file.
