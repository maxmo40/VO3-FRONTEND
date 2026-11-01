const FUSEAU = 'Europe/Paris'

export const formatPrix = (centimes) =>
  (centimes / 100).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })

export const formatJour = (iso) =>
  new Date(iso).toLocaleDateString('fr-FR', { timeZone: FUSEAU, weekday: 'long', day: 'numeric', month: 'long' })

export const formatHeure = (iso) =>
  new Date(iso).toLocaleTimeString('fr-FR', { timeZone: FUSEAU, hour: '2-digit', minute: '2-digit' })

export const formatDateHeure = (iso) => `${formatJour(iso)} à ${formatHeure(iso)}`

export const formatDuree = (minutes) => {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return h ? `${h} h${m ? ` ${String(m).padStart(2, '0')}` : ''}` : `${m} min`
}

// Secondes → « mm:ss », ou « h:mm:ss » au-delà d'une heure
export const formatChrono = (secondes) => {
  const h = Math.floor(secondes / 3600)
  const m = Math.floor((secondes % 3600) / 60)
  const s = secondes % 60
  const deux = (n) => String(n).padStart(2, '0')
  return h ? `${h}:${deux(m)}:${deux(s)}` : `${deux(m)}:${deux(s)}`
}

export const formatVitesse = (kmh) => `${kmh.toLocaleString('fr-FR')} km/h`
