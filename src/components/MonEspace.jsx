import { useEffect, useState } from 'react'
import { useAuth } from '../AuthContext.jsx'
import { api } from '../api.js'
import { formatDateHeure, formatPrix } from '../format.js'

const PROFIL_VIDE = {
  prenom: '',
  nom: '',
  sexe: '',
  date_naissance: '',
  telephone: '',
  poids_kg: '',
  taille_cm: '',
  activite: '',
}

// Échelle d'activité physique PA-R (Jackson et al., 1990)
const NIVEAUX_ACTIVITE = [
  'Sédentaire : j’évite de marcher et de faire des efforts',
  'Activité légère : marche pour le plaisir, escaliers de temps en temps',
  'Activité modérée (jardinage, vélo tranquille…) de 10 à 60 min par semaine',
  'Activité modérée plus d’1 h par semaine',
  'Sport intense (course, natation…) moins de 30 min par semaine',
  'Sport intense 30 à 60 min par semaine',
  'Sport intense 1 à 3 h par semaine',
  'Sport intense plus de 3 h par semaine',
]

// Les valeurs null de la base deviennent des chaînes vides pour les champs du formulaire
const versFormulaire = (profil) =>
  Object.fromEntries(Object.keys(PROFIL_VIDE).map((champ) => [champ, profil?.[champ] ?? '']))

const today = new Date().toISOString().slice(0, 10)

export default function MonEspace({ onRdv }) {
  const { user, withAuth, logout } = useAuth()
  const [memberSince, setMemberSince] = useState(null)
  const [profil, setProfil] = useState(PROFIL_VIDE)
  const [vo2max, setVo2max] = useState(null)
  const [rdvs, setRdvs] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState(null)

  useEffect(() => {
    withAuth(api.mesRdv)
      .then(setRdvs)
      .catch(() => setRdvs([]))

    Promise.all([withAuth(api.me), withAuth(api.getProfil)])
      .then(([me, data]) => {
        setMemberSince(
          new Date(me.created_at).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })
        )
        setProfil(versFormulaire(data))
        setVo2max(data.vo2max)
      })
      .catch((err) => setMessage({ type: 'error', text: err.message }))
      .finally(() => setLoading(false))
  }, [])

  const handleChange = (e) => {
    setProfil({ ...profil, [e.target.name]: e.target.value })
    setMessage(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)
    try {
      const data = await withAuth((token) => api.updateProfil(token, profil))
      setProfil(versFormulaire(data))
      setVo2max(data.vo2max)
      setMessage({ type: 'success', text: 'Profil enregistré' })
    } catch (err) {
      setMessage({ type: 'error', text: err.message })
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="espace">
      <h1>Mon espace</h1>

      <div className="card">
        <dl>
          <dt>Email</dt>
          <dd>{user.email}</dd>
          <dt>Membre depuis</dt>
          <dd>{memberSince ?? '…'}</dd>
        </dl>
      </div>

      <div className="card">
        <div className="card-header">
          <h2>Mes rendez-vous</h2>
          <button className="link" onClick={onRdv}>
            Prendre rendez-vous
          </button>
        </div>
        {rdvs === null ? (
          <p className="muted">Chargement…</p>
        ) : rdvs.length === 0 ? (
          <p className="muted">Aucun rendez-vous pour le moment.</p>
        ) : (
          <ul className="rdv-liste">
            {rdvs.map((rdv) => (
              <li key={rdv.id} className={new Date(rdv.debut) < new Date() ? 'passe' : ''}>
                <strong>{rdv.libelle}</strong>
                <span>{formatDateHeure(rdv.debut)}</span>
                <span className="muted">{formatPrix(rdv.prix_centimes)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {vo2max?.valeur != null ? (
        <div className="card vo2max">
          <h2>Estimation de votre VO2max</h2>
          <p className="vo2max-valeur">
            {vo2max.valeur.toLocaleString('fr-FR')} <span>ml/kg/min</span>
          </p>
          <p className="vo2max-note">
            Calculée à partir de votre âge ({vo2max.age} ans), sexe, IMC (
            {vo2max.imc.toLocaleString('fr-FR')}) et niveau d'activité, selon le modèle de Jackson
            et al. (1990). Estimation sans test d'effort : marge d'erreur d'environ ±5 ml/kg/min.
          </p>
        </div>
      ) : (
        vo2max && (
          <p className="vo2max-hint">
            {vo2max.raison ??
              `Renseignez ${vo2max.manquants.join(', ')} pour obtenir une estimation de votre VO2max.`}
          </p>
        )
      )}

      <form className="card profil-form" onSubmit={handleSubmit}>
        <h2>Mes informations</h2>
        <fieldset disabled={loading || saving}>
          <div className="form-grid">
            <label>
              Prénom
              <input name="prenom" value={profil.prenom} onChange={handleChange} maxLength={100} autoComplete="given-name" />
            </label>
            <label>
              Nom
              <input name="nom" value={profil.nom} onChange={handleChange} maxLength={100} autoComplete="family-name" />
            </label>
            <label>
              Sexe
              <select name="sexe" value={profil.sexe} onChange={handleChange}>
                <option value="">Non renseigné</option>
                <option value="homme">Homme</option>
                <option value="femme">Femme</option>
                <option value="autre">Autre</option>
              </select>
            </label>
            <label>
              Date de naissance
              <input
                type="date"
                name="date_naissance"
                value={profil.date_naissance}
                onChange={handleChange}
                min="1900-01-01"
                max={today}
                autoComplete="bday"
              />
            </label>
            <label>
              Téléphone
              <input
                type="tel"
                name="telephone"
                value={profil.telephone}
                onChange={handleChange}
                placeholder="06 12 34 56 78"
                autoComplete="tel"
              />
            </label>
            <label>
              Poids (kg)
              <input
                type="number"
                name="poids_kg"
                value={profil.poids_kg}
                onChange={handleChange}
                min="1"
                max="499"
                step="0.1"
                inputMode="decimal"
              />
            </label>
            <label>
              Taille (cm)
              <input
                type="number"
                name="taille_cm"
                value={profil.taille_cm}
                onChange={handleChange}
                min="30"
                max="300"
                step="1"
                inputMode="numeric"
              />
            </label>
            <label className="form-grid-full">
              Niveau d'activité physique
              <select name="activite" value={profil.activite} onChange={handleChange}>
                <option value="">Non renseigné</option>
                {NIVEAUX_ACTIVITE.map((libelle, niveau) => (
                  <option key={niveau} value={niveau}>
                    {niveau} – {libelle}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </fieldset>
        <div className="form-actions">
          <button className="btn btn-primary" disabled={loading || saving}>
            {saving ? 'Enregistrement…' : 'Enregistrer'}
          </button>
          {message && <p className={`form-${message.type}`}>{message.text}</p>}
        </div>
      </form>

      <button className="btn btn-secondary" onClick={logout}>
        Se déconnecter
      </button>
    </section>
  )
}
