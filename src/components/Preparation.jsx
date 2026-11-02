import { formatDateHeure, formatVitesse } from '../format.js'

const CONSEILS = [
  'Venez en tenue de course avec vos chaussures habituelles',
  'Pas de repas copieux dans les 2 à 3 heures qui précèdent',
  "Évitez tout entraînement intense la veille et le jour de l'examen",
]

const formatIncrement = (kmh) => kmh.toLocaleString('fr-FR')

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
            {protocole.pente_pct ? ` incliné à ${protocole.pente_pct} %` : ''} : départ à{' '}
            {formatVitesse(protocole.depart_kmh)}, puis +{formatIncrement(protocole.increment_kmh)} km/h{' '}
            {protocole.duree_palier_min === 1 ? 'toutes les minutes' : `toutes les ${protocole.duree_palier_min} minutes`}, jusqu'à
            épuisement (environ {protocole.duree_max_min} minutes).
          </p>

          <table className="protocole">
            <thead>
              <tr>
                <th scope="col">Palier</th>
                <th scope="col">Temps</th>
                <th scope="col">Vitesse</th>
                {protocole.pente_pct > 0 && <th scope="col">Pente</th>}
                <th scope="col">{protocole.pente_pct > 0 ? '% VMA (équiv. plat)' : '% VMA'}</th>
              </tr>
            </thead>
            <tbody>
              {protocole.paliers.map((palier) => (
                <tr key={palier.numero}>
                  <th scope="row">{palier.numero}</th>
                  <td>
                    {palier.debut_min}–{palier.fin_min} min
                  </td>
                  <td>{formatVitesse(palier.vitesse_kmh)}</td>
                  {protocole.pente_pct > 0 && <td>{protocole.pente_pct} %</td>}
                  <td>
                    <span className="protocole-barre" style={{ '--pct': `${Math.min(palier.pct_vma, 120) / 1.2}%` }}>
                      {palier.pct_vma} %
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

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
