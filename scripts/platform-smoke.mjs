import fs from 'node:fs'

const required = [
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
    'src/services/consolidation.service.ts',
    'enterprise_risks',
  ],
]

let failed = false

for (
  const [
    file,
    expected,
  ] of required
) {
  if (
    !fs.existsSync(file)
  ) {
    console.error(
      `FAIL: falta ${file}`
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
      `FAIL: ${expected} no encontrado en ${file}`
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
  '\nPLATFORM SMOKE CHECK: OK'
)
