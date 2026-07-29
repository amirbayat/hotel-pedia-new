// scripts/process-icons.mjs
//
// Pipeline: raw Figma-exported SVGs  →  cleaned, recolorable SVGs  →  index.ts barrel
//
// Usage:
//   1. Export icons from Figma as SVG.
//   2. Drop the files into src/assets/hotel-pedia-icons/ (or src/assets/icons-raw/),
//      any file name (e.g. "Choice icon=Search.svg", "Arrow Left.svg").
//   3. Run: node scripts/process-icons.mjs
//
// What it does:
//   - Cleans each SVG with SVGO (strips fixed width/height, ids, comments, etc.)
//   - Replaces hardcoded fill/stroke colors with "currentColor" so the icon can be
//     recolored from React via the `color` prop / CSS `color`.
//   - Writes the cleaned file to src/assets/icons/<kebab-case-name>.svg
//   - Regenerates src/components/icons/index.ts, which re-exports every icon as a
//     React component named IconXxx (via vite-plugin-svgr's `?react` import).

import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { optimize } from 'svgo'

const ROOT = path.resolve(import.meta.dirname, '..')
// Any of these folders may hold raw Figma exports; all are scanned.
const RAW_DIRS = [
  path.join(ROOT, 'src/assets/hotel-pedia-icons'),
  path.join(ROOT, 'src/assets/icons-raw'),
]
const OUT_DIR = path.join(ROOT, 'src/assets/icons')
const INDEX_DIR = path.join(ROOT, 'src/components/icons')
const INDEX_FILE = path.join(INDEX_DIR, 'index.ts')

function toKebabCase(rawName) {
  const name = rawName
    .replace(/\.svg$/i, '')
    // Figma component-instance labels look like "Choice icon=Search" — drop the prefix.
    .replace(/^choice\s*icon\s*=\s*/i, '')
    .replace(/&/g, ' and ')

  return name
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

function toPascalCase(kebab) {
  return kebab
    .split('-')
    .filter(Boolean)
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join('')
}

// Replace hardcoded colors on fill/stroke with currentColor so consumers can
// recolor the icon via CSS `color` (SVG's `color` presentation attribute is
// what `currentColor` resolves to). "none" / "transparent" are left alone.
function forceCurrentColor(svg) {
  return svg.replace(
    /(fill|stroke)=(["'])(?!none|transparent|currentColor)([^"']*)\2/gi,
    '$1=$2currentColor$2',
  )
}

const svgoConfig = {
  multipass: true,
  plugins: [
    'preset-default',
    // Keep width/height="24" (all source icons are on Figma's 24px grid) so the
    // React component defaults to 24px when no size prop is passed. vite-plugin-svgr's
    // `expandProps: 'end'` spreads consumer props after these, so passing width/height
    // (or a Tailwind/CSS size) still overrides the default.
    'removeXMLNS',
  ],
}

async function main() {
  const existingDirs = RAW_DIRS.filter((d) => existsSync(d))

  if (existingDirs.length === 0) {
    await mkdir(RAW_DIRS[0], { recursive: true })
    console.log(`ساخته شد: ${path.relative(ROOT, RAW_DIRS[0])} — فایل‌های svg خام Figma رو اینجا بذار و دوباره اسکریپت رو اجرا کن.`)
    return
  }

  const filesByDir = []
  for (const dir of existingDirs) {
    const files = (await readdir(dir)).filter((f) => f.toLowerCase().endsWith('.svg'))
    for (const file of files) filesByDir.push({ dir, file })
  }

  if (filesByDir.length === 0) {
    console.log(`هیچ svg ای توی ${existingDirs.map((d) => path.relative(ROOT, d)).join(', ')} پیدا نشد.`)
    return
  }

  await mkdir(OUT_DIR, { recursive: true })
  await mkdir(INDEX_DIR, { recursive: true })

  const entries = []
  const seen = new Map() // kebab -> source file, to warn on collisions

  for (const { dir, file } of filesByDir) {
    const raw = await readFile(path.join(dir, file), 'utf-8')
    const optimized = optimize(raw, svgoConfig).data
    const recolored = forceCurrentColor(optimized)

    const kebab = toKebabCase(file)
    if (!kebab) {
      console.warn(`رد شد (اسم نامعتبر): ${file}`)
      continue
    }
    if (seen.has(kebab)) {
      console.warn(`تکراری: "${file}" همون اسم "${seen.get(kebab)}" رو تولید کرد — نادیده گرفته شد.`)
      continue
    }
    seen.set(kebab, file)

    const pascal = 'Icon' + toPascalCase(kebab)
    const outFile = path.join(OUT_DIR, `${kebab}.svg`)

    await writeFile(outFile, recolored, 'utf-8')
    entries.push({ kebab, pascal })
  }

  entries.sort((a, b) => a.pascal.localeCompare(b.pascal))

  const body = entries
    .map(
      ({ kebab, pascal }) =>
        `export { default as ${pascal} } from '../../assets/icons/${kebab}.svg?react'`,
    )
    .join('\n')

  const header = `// این فایل خودکار تولید شده — دستی ویرایشش نکن.
// برای اضافه کردن آیکون جدید: فایل svg رو بذار توی src/assets/icons-raw و
// دوباره اجرا کن: node scripts/process-icons.mjs
`

  await writeFile(INDEX_FILE, `${header}\n${body}\n`, 'utf-8')

  console.log(`${entries.length} آیکون پردازش شد:`)
  for (const { pascal } of entries) console.log(`  - ${pascal}`)
}

main()
