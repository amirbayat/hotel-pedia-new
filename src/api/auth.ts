const PANEL_BASE_URL = 'https://panel.hotelpedia.ir'

const JSON_HEADERS = {
  Accept: 'application/json',
  'Content-Type': 'application/json',
}

async function parseJsonResponse(response: Response) {
  const data = await response.json().catch(() => null)

  if (!response.ok) {
    const message = data?.message ?? `Request failed with status ${response.status}`
    throw new Error(message)
  }

  return data
}

function extractToken(data: unknown): string {
  const token =
    (data as any)?.access_token ??
    (data as any)?.token ??
    (data as any)?.data?.access_token ??
    (data as any)?.data?.token

  if (!token) {
    throw new Error('پاسخ سرور توکن ورود را شامل نمی‌شود.')
  }

  return token
}

/**
 * POST /api/v1/auth/otp/send
 *
 * ⚠️ Mocked (docs/hotel-mock-flow-plan.md) — no real SMS gateway is wired up,
 * so any phone number is accepted and no code is actually sent (the OTP step
 * accepts any 6-digit input). See `sendPassengerOtpFromApi` for the real
 * implementation, kept live (type-checked, unused) to swap back in later.
 */
export async function sendPassengerOtp(phone: string) {
  void phone
  await new Promise((resolve) => setTimeout(resolve, 300))
  return { message: 'کد تایید ارسال شد.' }
}

/** Real implementation of `sendPassengerOtp`, unused while auth is mocked. */
export async function sendPassengerOtpFromApi(phone: string) {
  const response = await fetch(`${PANEL_BASE_URL}/api/v1/auth/otp/send`, {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify({ user_type: 'passenger', phone }),
  })
  return parseJsonResponse(response)
}

/**
 * POST /api/v1/auth/otp/verify
 *
 * ⚠️ Mocked (docs/hotel-mock-flow-plan.md) — any 6-digit code is accepted
 * (already enforced by `AuthModal`) and a fake token is returned; no real
 * session exists server-side. See `verifyPassengerOtpFromApi` for the real
 * implementation, kept live (type-checked, unused) to swap back in later.
 */
export async function verifyPassengerOtp(phone: string, code: string): Promise<string> {
  void code
  await new Promise((resolve) => setTimeout(resolve, 300))
  return `mock-passenger-token-${phone}`
}

/** Real implementation of `verifyPassengerOtp`, unused while auth is mocked. */
export async function verifyPassengerOtpFromApi(phone: string, code: string): Promise<string> {
  const response = await fetch(`${PANEL_BASE_URL}/api/v1/auth/otp/verify`, {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify({ user_type: 'passenger', phone, code }),
  })
  return extractToken(await parseJsonResponse(response))
}

/**
 * POST /api/v1/business-employees/auth/otp/send
 *
 * ⚠️ Mocked (docs/hotel-mock-flow-plan.md) — see `sendBusinessOtpFromApi` for
 * the real implementation, kept live (type-checked, unused) to swap back in later.
 */
export async function sendBusinessOtp(companyCode: string) {
  void companyCode
  await new Promise((resolve) => setTimeout(resolve, 300))
  return { message: 'کد تایید ارسال شد.' }
}

/** Real implementation of `sendBusinessOtp`, unused while auth is mocked. */
export async function sendBusinessOtpFromApi(companyCode: string) {
  const response = await fetch(`${PANEL_BASE_URL}/api/v1/business-employees/auth/otp/send`, {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify({ company_code: companyCode }),
  })
  return parseJsonResponse(response)
}

/**
 * POST /api/v1/business-employees/auth/otp/verify
 *
 * ⚠️ Mocked (docs/hotel-mock-flow-plan.md) — any 6-digit code is accepted;
 * see `verifyBusinessOtpFromApi` for the real implementation, kept live
 * (type-checked, unused) to swap back in later.
 */
export async function verifyBusinessOtp(companyCode: string, code: string): Promise<string> {
  void code
  await new Promise((resolve) => setTimeout(resolve, 300))
  return `mock-business-token-${companyCode}`
}

/** Real implementation of `verifyBusinessOtp`, unused while auth is mocked. */
export async function verifyBusinessOtpFromApi(companyCode: string, code: string): Promise<string> {
  const response = await fetch(`${PANEL_BASE_URL}/api/v1/business-employees/auth/otp/verify`, {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify({ company_code: companyCode, code }),
  })
  return extractToken(await parseJsonResponse(response))
}

// The panel login endpoints are classic form-encoded logins (not JSON APIs) —
// they set a session cookie on panel.hotelpedia.ir. Submitting through a
// hidden iframe lets that cookie get set without navigating the current page.
function submitPanelLoginForm(action: string, token: string) {
  const iframe = document.createElement('iframe')
  iframe.name = `panel-login-${Math.round(performance.now())}`
  iframe.style.display = 'none'
  document.body.appendChild(iframe)

  const form = document.createElement('form')
  form.method = 'POST'
  form.action = action
  form.target = iframe.name

  const tokenField = document.createElement('input')
  tokenField.type = 'hidden'
  tokenField.name = 'token'
  tokenField.value = token
  form.appendChild(tokenField)

  document.body.appendChild(form)
  form.submit()
  form.remove()

  iframe.addEventListener('load', () => iframe.remove(), { once: true })
}

/**
 * ⚠️ Mocked (docs/hotel-mock-flow-plan.md) — there's no real panel session to
 * create, so this is a no-op (the app's own logged-in state comes from
 * `AuthContext`/`localStorage`, not this cookie). See `panelLoginPassengerFromApi`
 * for the real implementation, kept live (unused) to swap back in later.
 */
export function panelLoginPassenger(token: string) {
  void token
}

/** Real implementation of `panelLoginPassenger`, unused while auth is mocked. */
export function panelLoginPassengerFromApi(token: string) {
  submitPanelLoginForm(`${PANEL_BASE_URL}/panel/passenger/auth`, token)
}

/** ⚠️ Mocked (docs/hotel-mock-flow-plan.md) — see `panelLoginPassenger` above. */
export function panelLoginBusiness(token: string) {
  void token
}

/** Real implementation of `panelLoginBusiness`, unused while auth is mocked. */
export function panelLoginBusinessFromApi(token: string) {
  submitPanelLoginForm(`${PANEL_BASE_URL}/panel/business-employees/auth`, token)
}
