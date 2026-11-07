import fs from 'fs';
import path from 'path';

const rootDir = process.cwd();
const distDir = path.join(rootDir, 'dist');
const assetsDir = path.join(distDir, 'assets');
const ghPagesDistDir = path.join(rootDir, 'gh-pages-dist');
const docsDir = path.join(rootDir, 'docs');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function run() {
  if (!fs.existsSync(distDir)) {
    console.warn('[prepare-github-pages] dist/ directory not found, skipping.');
    return;
  }

  // 1. Ensure dist/404.html and dist/.nojekyll exist for GitHub Actions Pages
  const distIndex = path.join(distDir, 'index.html');
  if (fs.existsSync(distIndex)) {
    fs.copyFileSync(distIndex, path.join(distDir, '404.html'));
  }
  fs.writeFileSync(path.join(distDir, '.nojekyll'), '');

  // 2. Copy compiled JS and CSS into gh-pages-dist/app.js and gh-pages-dist/app.css
  // so branch-based GitHub Pages (main / root) works out of the box without blank screen
  ensureDir(ghPagesDistDir);
  if (fs.existsSync(assetsDir)) {
    const files = fs.readdirSync(assetsDir);
    const jsFile = files.find((f) => f.startsWith('index-') && f.endsWith('.js'));
    const cssFile = files.find((f) => f.startsWith('index-') && f.endsWith('.css'));

    if (jsFile) {
      fs.copyFileSync(path.join(assetsDir, jsFile), path.join(ghPagesDistDir, 'app.js'));
    }
    if (cssFile) {
      fs.copyFileSync(path.join(assetsDir, cssFile), path.join(ghPagesDistDir, 'app.css'));
    }
  }

  // 3. Create root .nojekyll and root 404.html for 'main / (root)' GitHub Pages mode
  fs.writeFileSync(path.join(rootDir, '.nojekyll'), '');
  const rootIndex = path.join(rootDir, 'index.html');
  if (fs.existsSync(rootIndex)) {
    fs.copyFileSync(rootIndex, path.join(rootDir, '404.html'));
  }

  // 4. Populate docs/ folder for 'main /docs' GitHub Pages mode
  ensureDir(docsDir);
  fs.writeFileSync(path.join(docsDir, '.nojekyll'), '');
  if (fs.existsSync(path.join(ghPagesDistDir, 'app.js'))) {
    fs.copyFileSync(path.join(ghPagesDistDir, 'app.js'), path.join(docsDir, 'app.js'));
  }
  if (fs.existsSync(path.join(ghPagesDistDir, 'app.css'))) {
    fs.copyFileSync(path.join(ghPagesDistDir, 'app.css'), path.join(docsDir, 'app.css'));
  }
  const docsHtml = `<!doctype html>
<html lang="vi">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>CloudPlay Learning OS - Tin Học THPT &amp; THCS</title>
    <meta name="description" content="Hệ thống phiếu học tập điện tử và Web App tương tác phát triển năng lực tự học môn Tin học với kho bài tập đa phương tiện, chấm điểm tự động AI, đồng bộ Cloud thời gian thực và chế độ ngoại tuyến." />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@500;600;700;800&family=Nunito:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
    <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" rel="stylesheet" />
    <link rel="stylesheet" href="./app.css" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="./app.js"></script>
  </body>
</html>
`;
  fs.writeFileSync(path.join(docsDir, 'index.html'), docsHtml);
  fs.writeFileSync(path.join(docsDir, '404.html'), docsHtml);

  console.log('[prepare-github-pages] Successfully prepared dist/, gh-pages-dist/, and docs/ for GitHub Pages.');
}

run();
