import {
  expect,
  test,
} from '@playwright/test'

test(
  'buscador global responde',
  async ({ page }) => {
    await page.goto('/')

    await page
      .getByRole(
        'button',
        {
          name:
            /^Buscar$/i,
        }
      )
      .click()

    const search =
      page.getByPlaceholder(
        /Buscar código, auditoría/i
      )

    await search.fill(
      'TRX'
    )

    await expect(
      page.getByText(
        /Transacción/i
      ).first()
    ).toBeVisible()
  }
)

test(
  'Centro de consolidación permite búsqueda',
  async ({ page }) => {
    await page.goto('/')

    await page
      .getByRole(
        'button',
        {
          name:
            /Abrir consolidación/i,
        }
      )
      .click()

    const search =
      page.getByPlaceholder(
        /Buscar código, título/i
      )

    await search.fill(
      'risk'
    )

    await expect(
      search
    ).toHaveValue(
      'risk'
    )
  }
)
