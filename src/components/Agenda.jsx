import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../AuthContext.jsx'
import { api } from '../api.js'
import { formatHeure, formatJour, formatPrix, formatVitesse } from '../format.js'
import { decrireDeroulement, formatNombre } from '../protocoleTexte.js'

const finRdv = (rdv) => new Date(new Date(rdv.debut).getTime() + rdv.duree_minutes * 60_000).toISOString()

// Réglages à appliquer le jour du test (tapis ou ergocycle)
function ProtocoleRdv({ rdv }) {
  const { protocole, vma } = rdv
  if (!protocole) {
    return (
      <span className="agenda-protocole manquant">
        Protocole non calculable : le client n'a pas renseigné sa VMA ni ses temps de course
      </span>
    )
  }
  const machine = protocole.unite === 'W' ? 'Ergocycle' : `Tapis ${formatNombre(protocole.pente_pct)} %`
  return (
    <span className={`agenda-protocole ${protocole.par_defaut ? '' : 'choisi'}`}>
      <strong>
        {protocole.titre}
        {rdv.type_bilan === 'trail' && (protocole.par_defaut ? ' (par défaut, non validé par le client)' : ' (validé par le client)')}
      </strong>{' '}
      · {machine} : {decrireDeroulement(protocole)}
      {vma != null && ` · VMA ${formatVitesse(vma)}`}
    </span>
  )
}

const nomClient = ({ prenom, nom, email }) => [prenom, nom].filter(Boolean).join(' ') || email || 'Client inconnu'

export default function Agenda() {
  const { withAuth } = useAuth()
  const [rdvs, setRdvs] = useState(null)
  const [erreur, setErreur] = useState(null)

  const charger = () => {
    setErreur(null)
    withAuth(api.agenda)
      .then(setRdvs)
      .catch((err) => setErreur(err.message))
  }

  useEffect(charger, [])

  // Rendez-vous regroupés par jour pour l'affichage
  const rdvParJour = useMemo(() => {
    const jours = new Map()
    for (const rdv of rdvs ?? []) {
      const jour = formatJour(rdv.debut)
      if (!jours.has(jour)) jours.set(jour, [])
      jours.get(jour).push(rdv)
    }
    return [...jours]
  }, [rdvs])

  const total = rdvs?.reduce((somme, rdv) => somme + rdv.prix_centimes, 0) ?? 0

  return (
    <section className="agenda">
      <div className="agenda-entete">
        <div>
          <h1>Agenda</h1>
          {rdvs && (
            <p className="muted">
              {rdvs.length
                ? `${rdvs.length} rendez-vous à venir · ${formatPrix(total)}`
                : 'Aucun rendez-vous à venir'}
            </p>
          )}
        </div>
        <button className="btn btn-secondary" onClick={charger}>
          Actualiser
        </button>
      </div>

      {erreur ? (
        <p className="form-error">{erreur}</p>
      ) : !rdvs ? (
        <p className="muted">Chargement…</p>
      ) : (
        rdvParJour.map(([jour, rdvsDuJour]) => (
          <div key={jour} className="card agenda-jour">
            <h2>{jour}</h2>
            <ul className="agenda-liste">
              {rdvsDuJour.map((rdv) => (
                <li key={rdv.id}>
                  <span className="agenda-heure">
                    {formatHeure(rdv.debut)} – {formatHeure(finRdv(rdv))}
                  </span>
                  <div className="agenda-details">
                    <strong>{nomClient(rdv.client)}</strong>
                    <span className="muted">{rdv.libelle}</span>
                    <ProtocoleRdv rdv={rdv} />
                    <span className="agenda-contact">
                      {rdv.client.email && <a href={`mailto:${rdv.client.email}`}>{rdv.client.email}</a>}
                      {rdv.client.telephone && <a href={`tel:${rdv.client.telephone}`}>{rdv.client.telephone}</a>}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))
      )}
    </section>
  )
}
