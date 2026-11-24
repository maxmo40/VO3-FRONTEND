import { formatDateHeure, formatVitesse } from '../format.js'
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

const formatNombre = (n) => n.toLocaleString('fr-FR')
const formatMinutes = (min) => (min === 1 ? '1 minute' : `${min} minutes`)

// Ex. « départ à 8 km/h pendant 1 minute, puis +1 km/h pendant 2 minutes, puis +2 km/h toutes les 2 minutes
// (2 paliers), puis +0,5 km/h toutes les minutes »
const decrireDeroulement = ({ unite, depart, duree_depart_min, sequence }) =>
  [
    `${unite === 'W' ? 'échauffement' : 'départ'} à ${formatNombre(depart)} ${unite} pendant ${formatMinutes(duree_depart_min)}`,
    ...sequence.map(({ nb, duree_min, increment }) => {
      const pas = `+${formatNombre(increment)} ${unite}`
      if (nb === 1) return `${pas} pendant ${formatMinutes(duree_min)}`
      const rythme = duree_min === 1 ? 'toutes les minutes' : `toutes les ${duree_min} minutes`
      return nb ? `${pas} ${rythme} (${nb} paliers)` : `${pas} ${rythme}`
    }),
  ].join(', puis ')

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
export default function Preparation({ protocoles, prochainRdv }) {
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
          <p className="muted">
            {TITRES[type]}
            {protocole.pente_pct ? ` incliné à ${protocole.pente_pct} %` : ''} : {decrireDeroulement(protocole)},
            jusqu'à épuisement (environ {protocole.duree_max_min} minutes)
            {velo ? ', à une cadence de 80 à 90 tours par minute' : ''}.
          </p>

          <GraphiqueProtocole protocole={protocole} />

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
