import { useEffect, useState } from 'react'
import { useAuth } from '../AuthContext.jsx'
import { api } from '../api.js'
import PageLegale from './PageLegale.jsx'

// `requis` : sans ces consentements, la réservation d'un bilan est refusée (vérifié aussi par le serveur)
const CONSENTEMENTS = [
  {
    cle: 'donnees_personnelles',
    texte: "J'accepte que mes données personnelles soient collectées et utilisées par VO2RUN dans le cadre de mon accompagnement sportif",
  },
  {
    cle: 'politique_confidentialite',
    texte: 'Je reconnais avoir pris connaissance de la ',
    lien: 'politique de confidentialité',
    requis: true,
  },
  {
    cle: 'analyse_performance',
    texte: "Je comprends que mes données pourront être utilisées à des fins d'analyse de performance",
  },
  { cle: 'informations_exactes', texte: "J'atteste que les informations fournies sont exactes", requis: true },
  { cle: 'contact', texte: "J'accepte d'être contacté(e) par VO2RUN (email / téléphone)" },
]

const REQUIS = CONSENTEMENTS.filter((c) => c.requis)

const VIDE = {
  droit_image: null,
  ...Object.fromEntries(CONSENTEMENTS.map(({ cle }) => [cle, false])),
}

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })

// Choix enregistrés + enregistrement immédiat de chaque modification (annulée en cas d'erreur)
function useConsentements() {
  const { withAuth } = useAuth()
  const [choix, setChoix] = useState(VIDE)
  const [majLe, setMajLe] = useState(null)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState(null)

  useEffect(() => {
    withAuth(api.getConsentements)
      .then((enregistre) => {
        if (!enregistre) return
        setChoix(Object.fromEntries(Object.keys(VIDE).map((cle) => [cle, enregistre[cle]])))
        setMajLe(enregistre.updated_at)
      })
      .catch((err) => setMessage({ type: 'error', text: err.message }))
      .finally(() => setLoading(false))
  }, [])

  const enregistrer = async (cle, valeur) => {
    const precedent = choix
    setChoix({ ...choix, [cle]: valeur })
    setMessage(null)
    try {
      const enregistre = await withAuth((token) => api.saveConsentements(token, { [cle]: valeur }))
      setMajLe(enregistre.updated_at)
      setMessage({ cle, type: 'success', text: 'Choix enregistré' })
    } catch (err) {
      setChoix(precedent)
      setMessage({ cle, type: 'error', text: err.message })
    }
  }

  return { choix, majLe, loading, message, enregistrer }
}

function CaseConsentement({ consentement, coche, onChange, onPolitique }) {
  const { cle, texte, lien, requis } = consentement
  return (
    <label className="case">
      <input type="checkbox" checked={coche} onChange={(e) => onChange(cle, e.target.checked)} />
      <span>
        {texte}
        {lien && (
          <button
            type="button"
            className="link"
            onClick={(e) => {
              e.preventDefault()
              onPolitique()
            }}
          >
            {lien}
          </button>
        )}
        {requis && <span className="consentement-requis"> (obligatoire)</span>}
      </span>
    </label>
  )
}

// Politique de confidentialité en fenêtre, pour la lire sans quitter la réservation
function FenetrePolitique({ onClose }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal modal-large" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Fermer">
          ×
        </button>
        <PageLegale page="confidentialite" />
      </div>
    </div>
  )
}

// Étape de paiement : les consentements obligatoires, s'ils ne sont pas encore acceptés
export function ConsentementsRequis({ onPret }) {
  const { choix, loading, message, enregistrer } = useConsentements()
  const [politiqueOuverte, setPolitiqueOuverte] = useState(false)
  const [dejaAcceptes, setDejaAcceptes] = useState(null)
  const pret = REQUIS.every(({ cle }) => choix[cle])

  useEffect(() => {
    if (!loading && dejaAcceptes === null) setDejaAcceptes(pret)
    onPret(!loading && pret)
  }, [loading, pret])

  // Déjà acceptés lors d'une visite précédente : rien à redemander
  if (loading || dejaAcceptes) return null

  return (
    <div className="consentement consentement-paiement">
      <p className="muted small">Pour réserver, merci de confirmer :</p>
      {REQUIS.map((c) => (
        <CaseConsentement
          key={c.cle}
          consentement={c}
          coche={choix[c.cle]}
          onChange={enregistrer}
          onPolitique={() => setPolitiqueOuverte(true)}
        />
      ))}
      {message?.type === 'error' && <p className="form-error">{message.text}</p>}
      {politiqueOuverte && <FenetrePolitique onClose={() => setPolitiqueOuverte(false)} />}
    </div>
  )
}

// Mon espace : droit à l'image et consentements
export default function Consentements({ onPolitique }) {
  const { choix, majLe, loading, message, enregistrer } = useConsentements()

  // Message affiché sous l'encart concerné (droit à l'image ou consentements)
  const statut = (image) =>
    message &&
    (message.cle === 'droit_image') === image && <p className={`form-${message.type}`}>{message.text}</p>

  return (
    <>
      <div id="droit-image" className="card consentement">
        <div className="card-header">
          <h2 id="titre-droit-image">Droit à l'image</h2>
          <div className="segmented" role="group" aria-labelledby="titre-droit-image">
            {[
              [true, 'Oui'],
              [false, 'Non'],
            ].map(([valeur, libelle]) => (
              <button
                key={libelle}
                type="button"
                aria-pressed={choix.droit_image === valeur}
                disabled={loading}
                onClick={() => choix.droit_image !== valeur && enregistrer('droit_image', valeur)}
              >
                {libelle}
              </button>
            ))}
          </div>
        </div>
        <p>
          J'autorise VO2RUN à capturer et utiliser des images (photos et vidéos) me représentant lors des tests
          ou événements, à des fins de communication sur ses supports (réseaux sociaux, site internet, supports
          promotionnels).
        </p>
        <p className="muted small">
          Cette autorisation est accordée à titre gratuit et peut être retirée à tout moment sur simple demande.
        </p>
        {statut(true)}
      </div>

      <div id="consentement" className="card consentement">
        <h2>Consentement</h2>
        <fieldset className="consentement-liste" disabled={loading}>
          <legend className="sr-only">Consentements</legend>
          {CONSENTEMENTS.map((c) => (
            <CaseConsentement
              key={c.cle}
              consentement={c}
              coche={choix[c.cle]}
              onChange={enregistrer}
              onPolitique={onPolitique}
            />
          ))}
        </fieldset>
        {!loading && !REQUIS.every(({ cle }) => choix[cle]) && (
          <p className="muted small">Les consentements obligatoires sont nécessaires pour réserver un bilan.</p>
        )}
        {majLe && <p className="muted small">Dernière modification le {formatDate(majLe)}.</p>}
        {statut(false)}
      </div>
    </>
  )
}
