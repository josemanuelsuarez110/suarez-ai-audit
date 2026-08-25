import {
  expect,
  test,
} from '@playwright/test'

import {
  captureConsoleErrors,
} from './helpers'

test.describe(
  'Dashboard ejecutivo',
  () => {
    test(
      'carga sin errores críticos',
      async ({ page }) => {
        const errors =
          captureConsoleErrors(
            page
          )

        await page.goto('/')

        await expect(
          page.getByText(
            /Panel ejecutivo/i
          )
        ).toBeVisible()

        await expect(
          page.getByText(
            /Inteligencia transaccional/i
          )
        ).toBeVisible()

        await expect(
          page.getByText(
            /Centro operativo/i
          )
        ).toBeVisible()

        await expect(
          page.getByText(
            'Governance Suite',
            { exact: true }
          ).first()
        ).toBeVisible()

        await expect(
          page.getByText(
            'Enterprise Risk Suite',
            { exact: true }
          ).first()
        ).toBeVisible()

        await expect(
          page.getByRole(
            'heading',
            {
              name:
                'Centro de consolidación',
              exact: true,
            }
          )
        ).toBeVisible()

        expect(
          errors
        ).toEqual([])
      }
    )

    test(
      'muestra rol administrador',
      async ({ page }) => {
        await page.goto('/')

        await expect(
          page.getByText(
            /Administrador/i
          ).first()
        ).toBeVisible()
      }
    )
  }
)
