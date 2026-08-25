import {
  expect,
  test,
} from '@playwright/test'

test.describe(
  'RBAC administrador',
  () => {
    test(
      'muestra acceso a Usuarios',
      async ({ page }) => {
        await page.goto('/')

        await expect(
          page.getByText(
            /^Usuarios$/i
          )
        ).toBeVisible()
      }
    )

    test(
      'admin dispone de acciones de escritura',
      async ({ page }) => {
        await page.goto('/')

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
          page.getByRole(
            'button',
            {
              name:
                /Nuevo registro/i,
            }
          )
        ).toBeVisible()
      }
    )
  }
)
