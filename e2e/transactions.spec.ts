import {
  expect,
  test,
} from '@playwright/test'

test.describe(
  'Transacciones',
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
      'abre centro de transacciones',
      async ({ page }) => {

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

        await expect(
          center.getByRole(
            'heading',
            {
              name:
                'Centro de transacciones',
              exact: true,
            }
          )
        ).toBeVisible()

        await expect(
          center.getByText(
            /Nueva transacción/i
          )
        ).toBeVisible()
      }
    )


    test(
      'puede abrir detalle de una transacción existente',
      async ({ page }) => {

        /*
         * Abrir Centro de Transacciones.
         */
        await page
          .getByText(
            /^Transacciones$/i
          )
          .first()
          .click()

        /*
         * IMPORTANTE:
         * limitamos todas las búsquedas
         * al modal z-[167].
         *
         * Así evitamos seleccionar una
         * transacción del dashboard que
         * está detrás del modal.
         */
        const center =
          page.locator(
            'div.fixed.inset-0.z-\\[167\\]'
          )

        await expect(
          center
        ).toBeVisible()

        await expect(
          center.getByRole(
            'heading',
            {
              name:
                'Centro de transacciones',
              exact: true,
            }
          )
        ).toBeVisible()

        /*
         * Buscar una transacción solamente
         * dentro del Centro.
         */
        const transactionCode =
          center
            .getByText(
              /TRX-2026-/i
            )
            .first()

        await expect(
          transactionCode
        ).toBeVisible()

        /*
         * Según App.tsx, cada registro
         * interactivo está contenido
         * dentro de un button.
         */
        const transactionButton =
          transactionCode.locator(
            'xpath=ancestor::button[1]'
          )

        await expect(
          transactionButton
        ).toBeVisible()

        await transactionButton.click()

        /*
         * El formulario de detalle usa
         * z-[180], por encima del Centro.
         */
        const detailModal =
          page.locator(
            'div.fixed.inset-0.z-\\[180\\]'
          )

        await expect(
          detailModal
        ).toBeVisible({
          timeout: 10_000,
        })

        /*
         * Confirmar que abrimos una
         * transacción existente y no
         * "Nueva transacción".
         */
        await expect(
          detailModal.getByRole(
            'heading',
            {
              name:
                /TRX-2026-/i,
            }
          )
        ).toBeVisible()

        /*
         * Validar Audit Trail.
         */
        await expect(
          detailModal.getByText(
            'Audit Trail',
            {
              exact: true,
            }
          )
        ).toBeVisible()

        await expect(
          detailModal.getByText(
            'Historial de decisiones',
            {
              exact: true,
            }
          )
        ).toBeVisible()
      }
    )
  }
)
