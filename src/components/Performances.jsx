import { useEffect, useState } from 'react'
import { useAuth } from '../AuthContext.jsx'
import { api } from '../api.js'
import { formatChrono } from '../format.js'

const TEMPS = [
  { champ: 'temps_5k_s', libelle: '5 km', exemple: '22:30' },
  { champ: 'temps_10k_s', libelle: '10 km', exemple: '47:00' },
  { champ: 'temps_semi_s', libelle: 'Semi-marathon', exemple: '1:45:00' },
  { champ: 'temps_marathon_s', libelle: 'Marathon', exemple: '3:40:00' },
]

const versFormulaire = (profil) => ({
  vma_kmh: profil?.vma_kmh ?? '',
  ...Object.fromEntries(TEMPS.map(({ champ }) => [champ, profil?.[champ] != null ? formatChrono(profil[champ]) : ''])),
})

export default function Performances({ profil, onSaved }) {
  const { withAuth } = useAuth()
  const [valeurs, setValeurs] = useState(versFormulaire(profil))
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState(null)

  useEffect(() => setValeurs(versFormulaire(profil)), [profil])

  const handleChange = (e) => {
    setValeurs({ ...valeurs, [e.target.name]: e.target.value })
    setMessage(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)
    try {
      onSaved(await withAuth((token) => api.updateProfil(token, valeurs)))
      setMessage({ type: 'success', text: 'Performances enregistrées' })
    } catch (err) {
      setMessage({ type: 'error', text: err.message })
    } finally {
      setSaving(false)
    }
  }

  return (
    <form className="card profil-form" onSubmit={handleSubmit}>
      <h2>Mes performances</h2>
      <p className="muted small performances-aide">
        Renseignez votre VMA si vous la connaissez. Sinon, vos meilleurs temps récents permettent de
        l'estimer pour adapter le protocole de votre test.
      </p>
      <fieldset disabled={!profil || saving}>
        <div className="form-grid">
          <label className="form-grid-full">
            VMA (km/h)
            <input
              type="number"
              name="vma_kmh"
              value={valeurs.vma_kmh}
              onChange={handleChange}
              min="6"
              max="30"
              step="0.1"
              inputMode="decimal"
              placeholder="Ex. 16"
            />
          </label>
          {TEMPS.map(({ champ, libelle, exemple }) => (
            <label key={champ}>
              Temps sur {libelle}
              <input
                name={champ}
                value={valeurs[champ]}
                onChange={handleChange}
                placeholder={`Ex. ${exemple}`}
                inputMode="numeric"
                pattern="\d{1,2}(:\d{2}){1,2}"
                title="Format mm:ss ou h:mm:ss"
              />
            </label>
          ))}
        </div>
      </fieldset>
      <div className="form-actions">
        <button className="btn btn-primary" disabled={!profil || saving}>
          {saving ? 'Enregistrement…' : 'Enregistrer'}
        </button>
        {message && <p className={`form-${message.type}`}>{message.text}</p>}
      </div>
    </form>
  )
}
