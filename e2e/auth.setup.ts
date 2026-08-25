import {
  expect,
  test as setup,
} from '@playwright/test'

const authFile =
  'e2e/.auth/admin.json'

setup(
  'authenticate admin',
  async ({ page }) => {
    const email =
      process.env.E2E_EMAIL

    const password =
      process.env.E2E_PASSWORD

    if (!email || !password) {
      throw new Error(
        [
          'Faltan credenciales E2E.',
          '',
          'Revisa .env.e2e:',
          'E2E_EMAIL=...',
          'E2E_PASSWORD=...',
        ].join('\n')
      )
    }

    console.log(
      'E2E LOGIN: abriendo aplicación...'
    )

    await page.goto('/')

    const emailInput =
      page.locator(
        'input[type="email"]'
      )

    const passwordInput =
      page.locator(
        'input[type="password"]'
      )

    await expect(
      emailInput
    ).toBeVisible({
      timeout: 15_000,
    })

    await expect(
      passwordInput
    ).toBeVisible()

    await emailInput.fill(email)
    await passwordInput.fill(password)

    console.log(
      'E2E LOGIN: formulario completado.'
    )

    // Prioridad:
    // 1. botón submit
    // 2. botón por texto
    const submit =
      page.locator(
        'button[type="submit"]'
      )

    if (
      await submit.count()
    ) {
      console.log(
        'E2E LOGIN: usando button[type=submit].'
      )

      await submit.first().click()
    } else {
      console.log(
        'E2E LOGIN: buscando botón por texto.'
      )

      await page
        .getByRole('button')
        .filter({
          hasText:
            /iniciar|entrar|login|acceder/i,
        })
        .first()
        .click()
    }

    // Dar tiempo a Supabase + React para resolver sesión.
    await page.waitForTimeout(2500)

    console.log(
      'E2E LOGIN URL:',
      page.url()
    )

    const dashboard =
      page.getByText(
        /Panel ejecutivo/i
      )

    try {
      await expect(
        dashboard
      ).toBeVisible({
        timeout: 20_000,
      })
    } catch (error) {
      const bodyText =
        await page
          .locator('body')
          .innerText()

      console.error(
        '\n=============================='
      )

      console.error(
        'LOGIN NO LLEGÓ AL DASHBOARD'
      )

      console.error(
        '=============================='
      )

      console.error(
        bodyText.slice(
          0,
          4000
        )
      )

      console.error(
        '==============================\n'
      )

      throw error
    }

    console.log(
      'E2E LOGIN: autenticación correcta.'
    )

    await page
      .context()
      .storageState({
        path: authFile,
      })

    console.log(
      `E2E LOGIN: sesión guardada en ${authFile}`
    )
  }
)
