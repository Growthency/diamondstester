# assets-src

Drop original images (`.jpg`, `.png`, `.heic`, …) here, then run:

```bash
npm run images:webp
```

Each image is converted to an optimized **`.webp`** and written into `public/`
(subfolders are preserved). The site only ships WebP — never commit raw
JPG/PNG into `public/`.
