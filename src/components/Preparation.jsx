import { useState } from 'react'
import { useAuth } from '../AuthContext.jsx'
import { api } from '../api.js'
import { formatDateHeure, formatVitesse } from '../format.js'
import { PENTE_MAX, VARIANTES_TRAIL, construireRampe, rampeAdaptee } from '../protocoleTrail.js'
import { decrireDeroulement, formatNombre } from '../protocoleTexte.js'
import GraphiqueProtocole from './GraphiqueProtocole.jsx'

const CONSEILS = [
  'Pas de repas copieux dans les 2 à 3 heures qui précèdent',
  "Évitez tout entraînement intense la veille et le jour de l'examen",
]
const TENUE = {
  course: 'Venez en tenue de course avec vos chaussures habituelles',
  velo: 'Venez en tenue de vélo (cuissard conseillé), avec vos chaussures et pédales si besoin',
}

const TITRES = { route: 'Protocole route, sur tapis', trail: 'Protocole trail, sur tapis', velo: 'Protocole vélo, sur ergocycle' }


// Couleur de chaque variante (graphique et carte de choix)
const COULEURS = { base: 'var(--primary)', bal: '#2a78d6', breche: '#d9480f', perso: '#7048b8' }

// Bornes de la configuration personnalisée
const CHAMPS_PERSO = [
  { cle: 'pente_pct', libelle: 'Pente (%)', min: 0, max: PENTE_MAX, step: 1 },
  { cle: 'depart_kmh', libelle: 'Allure de départ (km/h)', min: 2, max: 20, step: 0.5 },
  { cle: 'duree_min', libelle: 'Durée des paliers (min)', min: 0.5, max: 5, step: 0.5 },
  { cle: 'increment_kmh', libelle: 'Écart entre paliers (km/h)', min: 0.1, max: 2, step: 0.1 },
]

const lirePerso = (valeurs) => {
  const config = {}
  for (const { cle, libelle, min, max } of CHAMPS_PERSO) {
    const n = Number(String(valeurs[cle]).replace(',', '.'))
    if (valeurs[cle] === '' || !Number.isFinite(n) || n < min || n > max) {
      return { erreur: `${libelle} : entre ${formatNombre(min)} et ${formatNombre(max)}` }
    }
    config[cle] = n
  }
  return { config }
}

const memesReglages = (a, b) => Object.keys(a).every((cle) => Number(a[cle]) === Number(b[cle]))

// Protocole enregistré sur le rendez-vous → réglages du tapis
const reglagesEnregistres = (p) =>
  p && {
    pente_pct: p.pente_pct,
    depart_kmh: p.depart,
    duree_min: p.sequence[0].duree_min,
    increment_kmh: p.sequence[0].increment,
  }

// Bilan trail : protocole proposé (10 %), Sentier BAL (20 %), BRECHE (25 %) ou configuration personnalisée.
// Le choix validé est enregistré sur le rendez-vous pour que le centre règle le tapis en conséquence.
function ProtocolesTrail({ base, vma, rdv, onRdvModifie }) {
  const { withAuth } = useAuth()
  const enregistre = rdv.protocole
  const reglagesBase = {
    pente_pct: base.pente_pct,
    depart_kmh: base.depart,
    duree_min: base.sequence.at(-1).duree_min,
    increment_kmh: base.sequence.at(-1).increment,
  }
  const [choix, setChoix] = useState(enregistre?.choix ?? 'base')
  const [perso, setPerso] = useState(
    enregistre?.choix === 'perso' ? reglagesEnregistres(enregistre) : { ...reglagesBase, duree_min: 1, increment_kmh: 0.5 }
  )
  const [envoi, setEnvoi] = useState({ enCours: false, erreur: null })

  const variante = VARIANTES_TRAIL.find((v) => v.cle === choix)
  let reglages = null
  let erreur = null
  if (choix === 'base') reglages = reglagesBase
  else if (choix === 'perso') ({ config: reglages, erreur } = lirePerso(perso))
  // Sentier BAL / BRECHE : on garde les réglages validés (figés à la VMA du jour du choix)
  else if (enregistre?.choix === choix) reglages = reglagesEnregistres(enregistre)
  else reglages = rampeAdaptee(vma, variante.pente_pct)

  const protocole = choix === 'base' ? base : reglages && construireRampe(vma, reglages)
  const irrealisable = protocole && (protocole.trop_long || protocole.paliers[0].pct > 100)
  const valide = enregistre && reglages && enregistre.choix === choix && memesReglages(reglagesEnregistres(enregistre), reglages)

  const valider = async () => {
    setEnvoi({ enCours: true, erreur: null })
    try {
      onRdvModifie(await withAuth((token) => api.choisirProtocole(token, rdv.id, { choix, ...reglages })))
      setEnvoi({ enCours: false, erreur: null })
    } catch (err) {
      setEnvoi({ enCours: false, erreur: err.message })
    }
  }

  return (
    <>
      <div className="choix-protocole" role="group" aria-label="Protocole du test trail">
        {VARIANTES_TRAIL.map((v) => (
          <button
            key={v.cle}
            type="button"
            aria-pressed={choix === v.cle}
            style={{ '--serie-protocole': COULEURS[v.cle] }}
            onClick={() => setChoix(v.cle)}
          >
            <strong>{v.titre}</strong>
            <span>{v.pente_pct != null ? `Pente ${v.pente_pct} %` : 'Pente, allure et paliers au choix'}</span>
          </button>
        ))}
      </div>

      {choix === 'perso' && (
        <div className="profil-form form-grid protocole-perso">
          {CHAMPS_PERSO.map(({ cle, libelle, min, max, step }) => (
            <label key={cle}>
              {libelle}
              <input
                type="number"
                value={perso[cle]}
                onChange={(e) => setPerso({ ...perso, [cle]: e.target.value })}
                min={min}
                max={max}
                step={step}
                inputMode="decimal"
              />
            </label>
          ))}
        </div>
      )}

      {protocole ? (
        <>
          <p className="muted">
            {variante.titre}, sur tapis{protocole.pente_pct ? ` incliné à ${formatNombre(protocole.pente_pct)} %` : ''} :{' '}
            {decrireDeroulement(protocole)}, jusqu'à épuisement (environ {formatNombre(protocole.duree_max_min)} minutes).
          </p>
          {protocole.trop_long && (
            <p className="form-error">
              Avec ces réglages, le test dépasserait 40 minutes sans atteindre votre VMA : augmentez l'allure de
              départ ou l'écart entre paliers.
            </p>
          )}
          {protocole.paliers[0].pct > 100 && (
            <p className="form-error">L'allure de départ dépasse déjà votre VMA sur cette pente : réduisez-la.</p>
          )}
          <GraphiqueProtocole protocole={protocole} couleur={COULEURS[choix]} />
        </>
      ) : (
        <p className="form-error">{erreur}</p>
      )}

      <div className="protocole-validation">
        {valide ? (
          <p className="form-success">✓ Protocole validé : le centre réglera le tapis ainsi pour votre test.</p>
        ) : (
          <>
            <button
              type="button"
              className="btn btn-primary"
              disabled={!reglages || irrealisable || envoi.enCours}
              onClick={valider}
            >
              {envoi.enCours ? 'Enregistrement…' : 'Valider ce protocole pour mon test'}
            </button>
            <p className="muted small">
              {enregistre
                ? `Protocole actuellement validé : ${enregistre.titre}${enregistre.choix === choix ? ' (réglages différents)' : ''}.`
                : "Tant que vous n'avez rien validé, le centre appliquera le protocole proposé."}
            </p>
          </>
        )}
        {envoi.erreur && <p className="form-error">{envoi.erreur}</p>}
      </div>
    </>
  )
}

function LigneVma({ vma }) {
  return (
    <p>
      {vma.source === 'renseignee' ? 'VMA renseignée' : 'VMA estimée'} : <strong>{formatVitesse(vma.valeur)}</strong>
      {vma.source === 'estimee' && (
        <span className="muted">
          {' '}
          (d'après {vma.detail.map((d) => `${d.libelle.toLowerCase()} : ${formatVitesse(d.vma_kmh)}`).join(', ')})
        </span>
      )}
    </p>
  )
}

// Protocole du prochain rendez-vous ; sans rendez-vous, on montre le protocole route par défaut
export default function Preparation({ protocoles, prochainRdv, onRdvModifie }) {
  const type = prochainRdv?.type_bilan ?? 'route'
  const protocole = protocoles?.[type]
  const velo = type === 'velo'

  return (
    <div className="card preparation">
      <h2>Préparation de l'examen</h2>

      {prochainRdv && (
        <p>
          Prochain bilan : <strong>{prochainRdv.libelle}</strong>, {formatDateHeure(prochainRdv.debut)}
        </p>
      )}

      {!protocole ? (
        <p className="muted">
          {velo
            ? 'Renseignez votre poids et votre VMA (ou un temps de course) — à défaut votre sexe, date de naissance et taille — pour obtenir le protocole de votre test sur vélo.'
            : "Renseignez votre VMA ou au moins un temps de course dans « Mes performances » pour obtenir le protocole de votre test d'effort."}
        </p>
      ) : (
        <>
          {velo ? (
            <p>
              Puissance maximale estimée : <strong>{protocole.repere.valeur} W</strong>
              <span className="muted">
                {' '}
                ({protocole.base === 'vma' ? "d'après votre VMA et votre poids" : "d'après votre âge, sexe, taille et poids"})
              </span>
            </p>
          ) : (
            <LigneVma vma={protocoles.vma} />
          )}
          {type === 'trail' ? (
            <ProtocolesTrail
              key={prochainRdv.id}
              base={protocole}
              vma={protocoles.vma.valeur}
              rdv={prochainRdv}
              onRdvModifie={onRdvModifie}
            />
          ) : (
            <>
              <p className="muted">
                {TITRES[type]}
                {protocole.pente_pct ? ` incliné à ${protocole.pente_pct} %` : ''} : {decrireDeroulement(protocole)},
                jusqu'à épuisement (environ {protocole.duree_max_min} minutes)
                {velo ? ', à une cadence de 80 à 90 tours par minute' : ''}.
              </p>

              <GraphiqueProtocole protocole={protocole} />
            </>
          )}

          {velo ? (
            <p className="muted small">
              Rampe individualisée selon la méthode de Wasserman : l'incrément est choisi pour atteindre votre
              puissance maximale en 8 à 12 minutes environ. Il pourra être ajusté le jour de l'examen.
            </p>
          ) : protocole.pente_pct > 0 ? (
            <p className="muted small">
              En montée, chaque km/h demande plus d'énergie qu'à plat : le % de VMA est calculé en
              équivalent plat (équation métabolique de l'ACSM).
            </p>
          ) : (
            !prochainRdv && (
              <p className="muted small">
                Protocole du bilan route. Pour un bilan trail, le test se fait en pente à 10 % ; pour un bilan
                vélo, sur ergocycle avec une rampe en watts.
              </p>
            )
          )}
        </>
      )}

      <h3>Le jour J</h3>
      <ul className="preparation-conseils">
        {[velo ? TENUE.velo : TENUE.course, ...CONSEILS].map((conseil) => (
          <li key={conseil}>{conseil}</li>
        ))}
      </ul>
    </div>
  )
}
