import {
  expect,
  test,
} from '@playwright/test'

test.describe(
  'Portfolio screenshots',
  () => {
    test.setTimeout(90_000)
    test.use({
      viewport: {
        width: 1440,
        height: 1200,
      },
    })

    test(
      'generate portfolio screenshots',
      async ({ page }) => {
        await page.goto('/')

        await expect(
          page.getByText(
            /Panel ejecutivo/i
          )
        ).toBeVisible()

        // 01 Executive Dashboard
        await page.screenshot({
          path:
            'docs/screenshots/01-executive-dashboard.png',
          fullPage: true,
        })

        // 02 Transaction Intelligence
        const transactionSection =
          page.getByText(
            /Inteligencia transaccional/i
          )

        await transactionSection
          .scrollIntoViewIfNeeded()

        await page.screenshot({
          path:
            'docs/screenshots/02-transaction-intelligence.png',
          fullPage: false,
        })

        // 03 Transaction Audit Trail
        await page
          .getByText(
            /^Transacciones$/i
          )
          .first()
          .click()

        const center =
          page.locator(
            'div.fixed.inset-0.z-\\[167\\]'
          )

        await expect(
          center
        ).toBeVisible()

        const transactionCode =
          center
            .getByText(
              /TRX-2026-/i
            )
            .first()

        await expect(
          transactionCode
        ).toBeVisible()

        const transactionButton =
          transactionCode.locator(
            'xpath=ancestor::button[1]'
          )

        await transactionButton.click()

        const detailModal =
          page.locator(
            'div.fixed.inset-0.z-\\[180\\]'
          )

        await expect(
          detailModal
        ).toBeVisible()

        await expect(
          detailModal.getByText(
            'Historial de decisiones',
            {
              exact: true,
            }
          )
        ).toBeVisible()

        await detailModal.screenshot({
          path:
            'docs/screenshots/03-transaction-audit-trail.png',
        })

        /*
         * Las capturas son escenarios independientes.
         * Volvemos al dashboard para eliminar cualquier
         * modal abierto sin depender de su implementación.
         */
        await page.goto('/')

        await expect(
          page.getByText(
            /Panel ejecutivo/i
          )
        ).toBeVisible({
          timeout: 15_000,
        })

        // 04 Governance Suite
        await page
          .getByRole(
            'button',
            {
              name:
                /Abrir Governance Suite/i,
            }
          )
          .click()

        const governance =
          page.getByText(
            /Gobierno de auditoría/i
          )

        await expect(
          governance
        ).toBeVisible()

        await page.screenshot({
          path:
            'docs/screenshots/04-governance-suite.png',
          fullPage: false,
        })

        await page
          .getByRole(
            'button',
            {
              name:
                /^Cerrar$/i,
            }
          )
          .first()
          .click()

        // 05 Enterprise Risk
        await page
          .getByRole(
            'button',
            {
              name:
                /Abrir Enterprise Risk/i,
            }
          )
          .click()

        await expect(
          page.getByRole(
            'heading',
            {
              name:
                'Riesgo corporativo',
              exact: true,
            }
          )
        ).toBeVisible()

        await page.screenshot({
          path:
            'docs/screenshots/05-enterprise-risk.png',
          fullPage: false,
        })

        await page
          .getByRole(
            'button',
            {
              name:
                /^Cerrar$/i,
            }
          )
          .first()
          .click()

        // 06 Consolidation Center
        await page
          .getByRole(
            'button',
            {
              name:
                /Abrir consolidación/i,
            }
          )
          .click()

        await expect(
          page.getByRole(
            'heading',
            {
              name:
                'Gestión transversal',
              exact: true,
            }
          )
        ).toBeVisible()

        await page.screenshot({
          path:
            'docs/screenshots/06-consolidation-center.png',
          fullPage: false,
        })
      }
    )
  }
)
