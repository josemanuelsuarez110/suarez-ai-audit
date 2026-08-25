import {
  expect,
  test,
} from '@playwright/test'

test.describe(
  'Módulos principales',
  () => {
    test.beforeEach(
      async ({ page }) => {
        await page.goto('/')

        await expect(
          page.getByText(
            /Panel ejecutivo/i
          )
        ).toBeVisible()
      }
    )

    test(
      'abre Centro operativo',
      async ({ page }) => {
        await page
          .getByRole(
            'button',
            {
              name:
                /Buscar/i,
            }
          )
          .first()
          .click()

        await expect(
          page.getByText(
            /Buscador global/i
          )
        ).toBeVisible()
      }
    )

    test(
      'abre Governance Suite',
      async ({ page }) => {
        await page
          .getByRole(
            'button',
            {
              name:
                /Abrir Governance Suite/i,
            }
          )
          .click()

        await expect(
          page.getByText(
            /Gobierno de auditoría/i
          )
        ).toBeVisible()

        await expect(
          page.getByRole(
            'button',
            {
              name:
                /Evidencias/i,
            }
          )
        ).toBeVisible()

        await expect(
          page.getByRole(
            'button',
            {
              name:
                /Remediación/i,
            }
          )
        ).toBeVisible()

        await expect(
          page.getByRole(
            'button',
            {
              name:
                /Tareas/i,
            }
          )
        ).toBeVisible()

        await expect(
          page.getByRole(
            'button',
            {
              name:
                /Compliance/i,
            }
          )
        ).toBeVisible()
      }
    )

    test(
      'abre Enterprise Risk',
      async ({ page }) => {
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

        await expect(
          page.getByRole(
            'button',
            {
              name:
                /Risk Register/i,
            }
          )
        ).toBeVisible()

        await expect(
          page.getByRole(
            'button',
            {
              name:
                /Third Parties/i,
            }
          )
        ).toBeVisible()

        await expect(
          page.getByRole(
            'button',
            {
              name:
                /Incidentes/i,
            }
          )
        ).toBeVisible()

        await expect(
          page.getByRole(
            'button',
            {
              name:
                /Executive KPIs/i,
            }
          )
        ).toBeVisible()
      }
    )

    test(
      'abre Centro de consolidación',
      async ({ page }) => {
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

        await expect(
          page.getByPlaceholder(
            /Buscar código/i
          )
        ).toBeVisible()
      }
    )
  }
)
