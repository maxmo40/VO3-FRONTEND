import { formatDateHeure, formatVitesse } from '../format.js'
import GraphiqueProtocole from './GraphiqueProtocole.jsx'

const CONSEILS = [
  'Venez en tenue de course avec vos chaussures habituelles',
  'Pas de repas copieux dans les 2 à 3 heures qui précèdent',
  "Évitez tout entraînement intense la veille et le jour de l'examen",
]

const formatIncrement = (kmh) => kmh.toLocaleString('fr-FR')
const formatMinutes = (min) => (min === 1 ? '1 minute' : `${min} minutes`)

// Ex. « 8 km/h pendant 1 minute, puis +1 km/h pendant 2 minutes, puis +2 km/h toutes les 2 minutes (2 paliers),
// puis +0,5 km/h toutes les minutes »
const decrireDeroulement = ({ depart_kmh, duree_depart_min, sequence }) =>
  [
    `départ à ${formatVitesse(depart_kmh)} pendant ${formatMinutes(duree_depart_min)}`,
    ...sequence.map(({ nb, duree_min, increment_kmh }) => {
      const pas = `+${formatIncrement(increment_kmh)} km/h`
      if (nb === 1) return `${pas} pendant ${formatMinutes(duree_min)}`
      const rythme = duree_min === 1 ? 'toutes les minutes' : `toutes les ${duree_min} minutes`
      return nb ? `${pas} ${rythme} (${nb} paliers)` : `${pas} ${rythme}`
    }),
  ].join(', puis ')

// Protocole du prochain rendez-vous ; sans rendez-vous, on montre le protocole route par défaut
export default function Preparation({ protocoles, prochainRdv }) {
  const type = prochainRdv?.type_bilan ?? 'route'
  const protocole = protocoles?.[type]

  return (
    <div className="card preparation">
      <h2>Préparation de l'examen</h2>

      {prochainRdv && (
        <p>
          Prochain bilan : <strong>{prochainRdv.libelle}</strong>, {formatDateHeure(prochainRdv.debut)}
        </p>
      )}

      {type === 'velo' ? (
        <p className="muted">
          Pour le bilan vélo, le test se fait sur ergocycle : les paliers sont définis en watts le jour de
          l'examen, selon votre niveau.
        </p>
      ) : !protocoles ? (
        <p className="muted">
          Renseignez votre VMA ou au moins un temps de course dans « Mes performances » pour obtenir le
          protocole de votre test d'effort.
        </p>
      ) : (
        <>
          <p>
            {protocoles.vma.source === 'renseignee' ? 'VMA renseignée' : 'VMA estimée'} :{' '}
            <strong>{formatVitesse(protocoles.vma.valeur)}</strong>
            {protocoles.vma.source === 'estimee' && (
              <span className="muted">
                {' '}
                (d'après{' '}
                {protocoles.vma.detail
                  .map((d) => `${d.libelle.toLowerCase()} : ${formatVitesse(d.vma_kmh)}`)
                  .join(', ')}
                )
              </span>
            )}
          </p>
          <p className="muted">
            {type === 'trail' ? 'Protocole trail' : 'Protocole route'}, sur tapis
            {protocole.pente_pct ? ` incliné à ${protocole.pente_pct} %` : ''} : {decrireDeroulement(protocole)},
            jusqu'à épuisement (environ {protocole.duree_max_min} minutes).
          </p>

          <GraphiqueProtocole protocole={protocole} />

          {protocole.pente_pct > 0 ? (
            <p className="muted small">
              En montée, chaque km/h demande plus d'énergie qu'à plat : le % de VMA est calculé en
              équivalent plat (équation métabolique de l'ACSM).
            </p>
          ) : (
            !prochainRdv && (
              <p className="muted small">
                Protocole du bilan route. Pour un bilan trail, le test se fait en pente à 10 % ; pour le
                bilan vélo, les paliers sont définis en watts le jour de l'examen.
              </p>
            )
          )}
        </>
      )}

      <h3>Le jour J</h3>
      <ul className="preparation-conseils">
        {(type === 'velo'
          ? ['Venez en tenue de vélo (cuissard conseillé), avec vos chaussures et pédales si besoin', ...CONSEILS.slice(1)]
          : CONSEILS
        ).map((conseil) => (
          <li key={conseil}>{conseil}</li>
        ))}
      </ul>
    </div>
  )
}
