import fs from 'node:fs'
import path from 'node:path'

const roots = [
  'src',
  'e2e',
  '.github',
]

const forbidden = [
  'sb_secret_',
  'service_role',
]

let failed = false

function walk(dir) {
  if (!fs.existsSync(dir)) {
    return
  }

  for (
    const entry of
    fs.readdirSync(
      dir,
      {
        withFileTypes: true,
      }
    )
  ) {
    const full =
      path.join(
        dir,
        entry.name
      )

    if (
      entry.isDirectory()
    ) {
      walk(full)
      continue
    }

    if (
      !/\.(ts|tsx|js|mjs|yml|yaml|json)$/.test(
        entry.name
      )
    ) {
      continue
    }

    const content =
      fs.readFileSync(
        full,
        'utf8'
      )

    for (
      const token of
      forbidden
    ) {
      if (
        content.includes(
          token
        )
      ) {
        console.error(
          `FAIL: patrón sensible "${token}" encontrado en ${full}`
        )

        failed = true
      }
    }
  }
}

for (
  const root of roots
) {
  walk(root)
}

if (failed) {
  process.exit(1)
}

console.log(
  'SECRET CHECK: OK'
)
