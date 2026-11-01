const STORAGE_KEY = 'vo3_session'

export const loadSession = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY))
  } catch {
    return null
  }
}

export const saveSession = (session) => {
  try {
    if (session) localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
    else localStorage.removeItem(STORAGE_KEY)
  } catch {
    // stockage indisponible (navigation privée) : la session reste en mémoire
  }
}

const SERVEUR_INJOIGNABLE = 'Le serveur est injoignable pour le moment. Réessayez dans quelques instants.'

const request = async (path, { method = 'GET', body, token } = {}) => {
  let res
  try {
    res = await fetch(`/api${path}`, {
      method,
      headers: {
        ...(body && { 'Content-Type': 'application/json' }),
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: body && JSON.stringify(body),
    })
  } catch {
    throw new Error(SERVEUR_INJOIGNABLE)
  }
  // 502/503/504 : le proxy ou l'hébergeur n'arrive pas à joindre le backend
  if ([502, 503, 504].includes(res.status)) throw new Error(SERVEUR_INJOIGNABLE)
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const error = new Error(data.error || 'Une erreur est survenue')
    error.status = res.status
    throw error
  }
  return data
}

export const api = {
  signup: (email, password) => request('/auth/signup', { method: 'POST', body: { email, password } }),
  login: (email, password) => request('/auth/login', { method: 'POST', body: { email, password } }),
  refresh: (refresh_token) => request('/auth/refresh', { method: 'POST', body: { refresh_token } }),
  me: (token) => request('/auth/me', { token }),
  getProfil: (token) => request('/profil', { token }),
  updateProfil: (token, profil) => request('/profil', { method: 'PUT', body: profil, token }),
  getBilans: () => request('/rdv/bilans'),
  getCreneaux: () => request('/rdv/creneaux'),
  reserver: (token, reservation) => request('/rdv', { method: 'POST', body: reservation, token }),
  mesRdv: (token) => request('/rdv/mes-rdv', { token }),
  annulerRdv: (token, id) => request(`/rdv/${id}/annuler`, { method: 'POST', token }),
  agenda: (token) => request('/admin/rdv', { token }),
}
