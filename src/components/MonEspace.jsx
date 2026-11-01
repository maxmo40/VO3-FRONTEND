import { useEffect, useState } from 'react'
import { useAuth } from '../AuthContext.jsx'
import { api } from '../api.js'
import { formatDateHeure, formatPrix } from '../format.js'
import Performances from './Performances.jsx'
import Preparation from './Preparation.jsx'

const PROFIL_VIDE = {
  prenom: '',
  nom: '',
  sexe: '',
  date_naissance: '',
  telephone: '',
  poids_kg: '',
  taille_cm: '',
}

const ERGOMETRES = { velo: 'Vélo', tapis: 'Tapis' }

// Les valeurs null de la base deviennent des chaînes vides pour les champs du formulaire
const versFormulaire = (profil) =>
  Object.fromEntries(Object.keys(PROFIL_VIDE).map((champ) => [champ, profil?.[champ] ?? '']))

const today = new Date().toISOString().slice(0, 10)

export default function MonEspace({ onRdv }) {
  const { user, withAuth, logout } = useAuth()
  const [memberSince, setMemberSince] = useState(null)
  const [profil, setProfil] = useState(PROFIL_VIDE)
  const [vo2max, setVo2max] = useState(null)
  const [ergometre, setErgometre] = useState('velo')
  const [donnees, setDonnees] = useState(null)
  const [rdvs, setRdvs] = useState(null)
  const [aAnnuler, setAAnnuler] = useState(null)
  const [annulation, setAnnulation] = useState({ enCours: false, erreur: null })
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
        setDonnees(data)
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
      setDonnees(data)
      setMessage({ type: 'success', text: 'Profil enregistré' })
    } catch (err) {
      setMessage({ type: 'error', text: err.message })
    } finally {
      setSaving(false)
    }
  }

  const confirmerAnnulation = async (id) => {
    setAnnulation({ enCours: true, erreur: null })
    try {
      await withAuth((token) => api.annulerRdv(token, id))
      setRdvs(rdvs.filter((rdv) => rdv.id !== id))
      setAAnnuler(null)
      setAnnulation({ enCours: false, erreur: null })
    } catch (err) {
      setAnnulation({ enCours: false, erreur: err.message })
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
                {rdv.annulable && aAnnuler !== rdv.id && (
                  <button
                    className="link rdv-annuler"
                    onClick={() => {
                      setAAnnuler(rdv.id)
                      setAnnulation({ enCours: false, erreur: null })
                    }}
                  >
                    Annuler
                  </button>
                )}
                {aAnnuler === rdv.id && (
                  <div className="rdv-confirmation">
                    <span>Annuler ce rendez-vous ?</span>
                    <button
                      className="btn btn-danger"
                      disabled={annulation.enCours}
                      onClick={() => confirmerAnnulation(rdv.id)}
                    >
                      {annulation.enCours ? 'Annulation…' : 'Oui, annuler'}
                    </button>
                    <button className="btn btn-secondary" disabled={annulation.enCours} onClick={() => setAAnnuler(null)}>
                      Non
                    </button>
                    {annulation.erreur && <p className="form-error">{annulation.erreur}</p>}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
        {rdvs?.some((rdv) => new Date(rdv.debut) > new Date()) && (
          <p className="muted small rdv-note">
            Annulation possible jusqu'à 24 h avant le rendez-vous. Passé ce délai, contactez-nous.
          </p>
        )}
      </div>

      <Preparation protocole={donnees?.protocole} />

      {vo2max?.velo ? (
        <div className="card vo2max">
          <div className="card-header">
            <h2>Estimation de votre VO2max</h2>
            <div className="segmented" role="group" aria-label="Ergomètre">
              {Object.entries(ERGOMETRES).map(([cle, libelle]) => (
                <button
                  key={cle}
                  type="button"
                  aria-pressed={ergometre === cle}
                  onClick={() => setErgometre(cle)}
                >
                  {libelle}
                </button>
              ))}
            </div>
          </div>
          <p className="vo2max-valeur">
            {vo2max[ergometre].ml_kg_min.toLocaleString('fr-FR')} <span>ml/kg/min</span>
          </p>
          <p className="vo2max-note">
            Soit {vo2max[ergometre].l_min.toLocaleString('fr-FR')} L/min. VO2max théorique calculée à
            partir de votre âge ({vo2max.age} ans), sexe, poids et taille selon les équations de Hansen
            et Wasserman{ergometre === 'tapis' && ', majorée de 11 % sur tapis par rapport au vélo'}.
            C'est une valeur de référence pour la population générale, pas une mesure : seul un test
            d'effort donne votre VO2max réelle.
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

      <Performances profil={donnees} onSaved={setDonnees} />

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
