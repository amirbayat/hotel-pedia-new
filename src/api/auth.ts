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

export async function sendPassengerOtp(phone: string) {
  const response = await fetch(`${PANEL_BASE_URL}/api/v1/auth/otp/send`, {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify({ user_type: 'passenger', phone }),
  })
  return parseJsonResponse(response)
}

export async function verifyPassengerOtp(phone: string, code: string): Promise<string> {
  const response = await fetch(`${PANEL_BASE_URL}/api/v1/auth/otp/verify`, {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify({ user_type: 'passenger', phone, code }),
  })
  return extractToken(await parseJsonResponse(response))
}

export async function sendBusinessOtp(companyCode: string) {
  const response = await fetch(`${PANEL_BASE_URL}/api/v1/business-employees/auth/otp/send`, {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify({ company_code: companyCode }),
  })
  return parseJsonResponse(response)
}

export async function verifyBusinessOtp(companyCode: string, code: string): Promise<string> {
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

export function panelLoginPassenger(token: string) {
  submitPanelLoginForm(`${PANEL_BASE_URL}/panel/passenger/auth`, token)
}

export function panelLoginBusiness(token: string) {
  submitPanelLoginForm(`${PANEL_BASE_URL}/panel/business-employees/auth`, token)
}
