import { formatVitesse } from '../format.js'

const CONSEILS = [
  'Venez en tenue de course avec vos chaussures habituelles',
  'Pas de repas copieux dans les 2 à 3 heures qui précèdent',
  "Évitez tout entraînement intense la veille et le jour de l'examen",
]

export default function Preparation({ protocole }) {
  return (
    <div className="card preparation">
      <h2>Préparation de l'examen</h2>

      {!protocole ? (
        <p className="muted">
          Renseignez votre VMA ou au moins un temps de course dans « Mes performances » pour obtenir le
          protocole de votre test d'effort.
        </p>
      ) : (
        <>
          <p>
            {protocole.vma.source === 'renseignee' ? 'VMA renseignée' : 'VMA estimée'} :{' '}
            <strong>{formatVitesse(protocole.vma.valeur)}</strong>
            {protocole.vma.source === 'estimee' && (
              <span className="muted">
                {' '}
                (d'après{' '}
                {protocole.vma.detail
                  .map((d) => `${d.libelle.toLowerCase()} : ${formatVitesse(d.vma_kmh)}`)
                  .join(', ')}
                )
              </span>
            )}
          </p>
          <p className="muted">
            Test sur tapis : départ à {formatVitesse(protocole.depart_kmh)}, puis +
            {protocole.increment_kmh} km/h{' '}
            {protocole.duree_palier_min === 1 ? 'toutes les minutes' : `toutes les ${protocole.duree_palier_min} minutes`}, jusqu'à
            épuisement (environ {protocole.duree_max_min} minutes).
          </p>

          <table className="protocole">
            <thead>
              <tr>
                <th scope="col">Palier</th>
                <th scope="col">Temps</th>
                <th scope="col">Vitesse</th>
                <th scope="col">% VMA</th>
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
                  <td>
                    <span className="protocole-barre" style={{ '--pct': `${Math.min(palier.pct_vma, 120) / 1.2}%` }}>
                      {palier.pct_vma} %
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <p className="muted small">
            Ce protocole concerne les bilans route et trail. Pour le bilan vélo, les paliers sont définis
            en watts le jour de l'examen.
          </p>
        </>
      )}

      <h3>Le jour J</h3>
      <ul className="preparation-conseils">
        {CONSEILS.map((conseil) => (
          <li key={conseil}>{conseil}</li>
        ))}
      </ul>
    </div>
  )
}
