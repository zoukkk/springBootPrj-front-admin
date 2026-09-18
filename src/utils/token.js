const LOCAL_TOKEN_KEY = 'token'
const SESSION_TOKEN_KEY = 'sessionToken'

let accessToken = localStorage.getItem(LOCAL_TOKEN_KEY) || sessionStorage.getItem(SESSION_TOKEN_KEY) || ''

export function getToken() {
  return accessToken
}

export function hasRememberedToken() {
  return Boolean(localStorage.getItem(LOCAL_TOKEN_KEY))
}

export function setToken(token, remember = false) {
  accessToken = token
  localStorage.removeItem(LOCAL_TOKEN_KEY)
  sessionStorage.removeItem(SESSION_TOKEN_KEY)

  const storage = remember ? localStorage : sessionStorage
  storage.setItem(remember ? LOCAL_TOKEN_KEY : SESSION_TOKEN_KEY, token)
}

export function clearToken() {
  accessToken = ''
  localStorage.removeItem(LOCAL_TOKEN_KEY)
  sessionStorage.removeItem(SESSION_TOKEN_KEY)
}
