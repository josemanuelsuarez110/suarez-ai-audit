import fs from 'node:fs'

const checks = [
  [
    'src/App.tsx',
    'Historial de decisiones',
  ],

  [
    'src/App.tsx',
    'ConsolidationCenter',
  ],

  [
    'src/components/GovernanceSuite.tsx',
    'Governance Suite',
  ],

  [
    'src/components/EnterpriseRiskSuite.tsx',
    'Enterprise Risk',
  ],

  [
    'src/components/OperationsSuite.tsx',
    'Operations Suite',
  ],

  [
    'src/services/transaction.service.ts',
    'finalize_transaction_review',
  ],

  [
    'playwright.config.ts',
    'webServer',
  ],
]

let failed = false

for (
  const [
    file,
    expected,
  ] of checks
) {
  if (
    !fs.existsSync(file)
  ) {
    console.error(
      `FAIL: ${file}`
    )

    failed = true
    continue
  }

  const content =
    fs.readFileSync(
      file,
      'utf8'
    )

  if (
    !content.includes(
      expected
    )
  ) {
    console.error(
      `FAIL: ${expected} no está en ${file}`
    )

    failed = true
  } else {
    console.log(
      `OK: ${file}`
    )
  }
}

if (failed) {
  process.exit(1)
}

console.log(
  '\nE2E STATIC CHECK: OK'
)
