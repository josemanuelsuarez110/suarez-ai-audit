import fs from 'node:fs'
import path from 'node:path'

const assetsDir =
  path.resolve(
    'dist/assets'
  )

if (
  !fs.existsSync(assetsDir)
) {
  console.error(
    'FAIL: dist/assets no existe. Ejecuta npm run build primero.'
  )

  process.exit(1)
}

const files =
  fs.readdirSync(
    assetsDir
  )
  .filter(
    (file) =>
      file.endsWith('.js')
  )
  .map((file) => {
    const full =
      path.join(
        assetsDir,
        file
      )

    return {
      file,
      bytes:
        fs.statSync(full).size,
    }
  })
  .sort(
    (a, b) =>
      b.bytes - a.bytes
  )

const largest =
  files[0]

const total =
  files.reduce(
    (sum, item) =>
      sum + item.bytes,
    0
  )

const mb = (bytes) =>
  (
    bytes /
    1024 /
    1024
  ).toFixed(2)

console.log(
  '\n=== BUNDLE SIZE ==='
)

for (
  const item of
  files.slice(0, 8)
) {
  console.log(
    `${item.file}: ${mb(item.bytes)} MB`
  )
}

console.log(
  `Total JS: ${mb(total)} MB`
)

if (!largest) {
  console.error(
    'FAIL: no se encontraron archivos JS.'
  )

  process.exit(1)
}

/*
 * El bundle principal actual ronda 600 KB.
 * Ponemos margen hasta 800 KB para detectar
 * regresiones reales sin bloquear por pequeños cambios.
 */
const largestLimit =
  800 * 1024

if (
  largest.bytes >
  largestLimit
) {
  console.error(
    `FAIL: chunk principal demasiado grande: ${mb(largest.bytes)} MB`
  )

  process.exit(1)
}

console.log(
  'BUNDLE SIZE CHECK: OK'
)
