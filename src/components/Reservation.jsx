import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../AuthContext.jsx'
import { api } from '../api.js'
import { formatDateHeure, formatDuree, formatHeure, formatJour, formatPrix } from '../format.js'

export default function Reservation({ onLogin, onEspace, onContact }) {
  const { user, withAuth } = useAuth()
  const [bilans, setBilans] = useState([])
  const [creneaux, setCreneaux] = useState(null)
  const [bilan, setBilan] = useState(null)
  const [creneau, setCreneau] = useState(null)
  const [confirmation, setConfirmation] = useState(null)
  const [paying, setPaying] = useState(false)
  const [error, setError] = useState('')

  const chargerCreneaux = () =>
    api
      .getCreneaux()
      .then(setCreneaux)
      .catch((err) => setError(err.message))

  const chargerBilans = () => {
    setError('')
    api.getBilans().then(setBilans).catch((err) => setError(err.message))
  }

  useEffect(chargerBilans, [])

  useEffect(() => {
    if (bilan) chargerCreneaux()
  }, [bilan])

  // Créneaux regroupés par jour pour l'affichage
  const creneauxParJour = useMemo(() => {
    const jours = new Map()
    for (const c of creneaux ?? []) {
      const jour = formatJour(c)
      if (!jours.has(jour)) jours.set(jour, [])
      jours.get(jour).push(c)
    }
    return [...jours]
  }, [creneaux])

  const choisirBilan = (b) => {
    setBilan(b)
    setCreneau(null)
    setError('')
  }

  const payer = async () => {
    setPaying(true)
    setError('')
    try {
      const rdv = await withAuth((token) => api.reserver(token, { type_bilan: bilan.type, debut: creneau }))
      setConfirmation(rdv)
    } catch (err) {
      setError(err.message)
      // Créneau pris entre-temps : on revient au choix du créneau avec la liste à jour
      if (err.status === 409) {
        setCreneau(null)
        chargerCreneaux()
      }
    } finally {
      setPaying(false)
    }
  }

  if (confirmation) {
    return (
      <section className="reservation">
        <div className="card confirmation">
          <h1>Rendez-vous confirmé</h1>
          <p>
            {confirmation.libelle}
            <br />
            <strong>{formatDateHeure(confirmation.debut)}</strong>
          </p>
          <p className="muted">Paiement de {formatPrix(confirmation.prix_centimes)} reçu.</p>
          <button className="btn btn-primary" onClick={onEspace}>
            Voir mes rendez-vous
          </button>
        </div>
      </section>
    )
  }

  const etape = !bilan ? 1 : !creneau ? 2 : 3

  return (
    <section className="reservation">
      <h1>Prendre rendez-vous</h1>
      <ol className="etapes">
        <li className={etape >= 1 ? 'active' : ''}>Bilan</li>
        <li className={etape >= 2 ? 'active' : ''}>Créneau</li>
        <li className={etape >= 3 ? 'active' : ''}>Paiement</li>
      </ol>

      {error && (
        <div className="erreur-ligne">
          <p className="form-error">{error}</p>
          {etape === 1 && bilans.length === 0 && (
            <button className="btn btn-secondary" onClick={chargerBilans}>
              Réessayer
            </button>
          )}
        </div>
      )}

      {etape === 1 && (
        <div className="bilans">
          {bilans.map((b) => (
            <button key={b.type} className="card bilan" onClick={() => choisirBilan(b)}>
              <span className="bilan-nom">{b.libelle}</span>
              <span className="bilan-prix">{formatPrix(b.prix_centimes)}</span>
              <span className="muted">Durée : {formatDuree(b.duree_minutes)}</span>
            </button>
          ))}
        </div>
      )}

      {etape === 1 && bilans.length > 0 && (
        <div className="bilans-avertissement">
          <p>
            Les bilans sont réalisés par un cardiologue du sport. Ils ne sont pas pris en charge par
            l'Assurance Maladie, car l'examen est réalisé dans le seul but d'aider à la performance.
          </p>
          <p>
            Pour une consultation de cardiologie du sport, rapprochez-vous du secrétariat.{' '}
            <button className="link" onClick={() => onContact('Consultation de cardiologie du sport')}>
              Contacter le secrétariat
            </button>
          </p>
        </div>
      )}

      {etape === 2 && (
        <>
          <div className="recap-ligne">
            <span>
              {bilan.libelle} · {formatPrix(bilan.prix_centimes)}
            </span>
            <button className="link" onClick={() => setBilan(null)}>
              Changer de bilan
            </button>
          </div>
          {creneaux === null ? (
            <p className="muted">Chargement des créneaux…</p>
          ) : creneauxParJour.length === 0 ? (
            <p className="muted">Aucun créneau disponible pour le moment.</p>
          ) : (
            <div className="jours">
              {creneauxParJour.map(([jour, horaires]) => (
                <div key={jour} className="jour">
                  <h2>{jour}</h2>
                  <div className="horaires">
                    {horaires.map((c) => (
                      <button key={c} className="btn btn-secondary" onClick={() => setCreneau(c)}>
                        {formatHeure(c)}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {etape === 3 && (
        <div className="card paiement">
          <h2>Récapitulatif</h2>
          <dl>
            <dt>Bilan</dt>
            <dd>{bilan.libelle}</dd>
            <dt>Date</dt>
            <dd>{formatDateHeure(creneau)}</dd>
            <dt>Prix</dt>
            <dd>{formatPrix(bilan.prix_centimes)}</dd>
          </dl>

          {user ? (
            <>
              <button className="btn btn-primary btn-block" onClick={payer} disabled={paying}>
                {paying ? 'Paiement en cours…' : `Payer ${formatPrix(bilan.prix_centimes)}`}
              </button>
              <p className="muted small">Paiement simulé : aucun montant ne sera débité.</p>
            </>
          ) : (
            <>
              <p className="muted">Créez un compte ou connectez-vous pour finaliser votre réservation.</p>
              <button className="btn btn-primary btn-block" onClick={onLogin}>
                Créer un compte pour continuer
              </button>
            </>
          )}

          <button className="link" onClick={() => setCreneau(null)} disabled={paying}>
            Changer de créneau
          </button>
        </div>
      )}
    </section>
  )
}
