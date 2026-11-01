import { ADRESSE, HORAIRES, TELEPHONE } from '../infos.js'

const EQUIPEMENTS = [
  {
    titre: 'Analyse des échanges gazeux',
    texte: "Mesure de l'oxygène consommé et du CO₂ rejeté à chaque respiration pour déterminer votre VO2max réelle et vos seuils ventilatoires.",
  },
  {
    titre: 'Tapis de course',
    texte: 'Pour les coureurs sur route et les traileurs, avec réglage de la pente pour reproduire les montées.',
  },
  {
    titre: 'Ergocycle',
    texte: 'Pour les cyclistes, avec une puissance contrôlée au watt près afin de calibrer vos zones d’entraînement.',
  },
]

const DEROULEMENT = [
  'Accueil et entretien sur vos objectifs, votre pratique et vos antécédents',
  "Test d'effort progressif sur tapis ou sur vélo, jusqu'à votre maximum",
  'Analyse des résultats : VO2max, seuils, fréquences cardiaques et allures ou puissances associées',
  "Remise d'un compte rendu avec vos zones d'entraînement personnalisées",
]

export default function Centre({ onRdv }) {
  return (
    <section className="centre">
      <div className="centre-intro">
        <h1>Le centre</h1>
        <p>
          VO3 est un centre d'évaluation de la performance dédié aux sportifs d'endurance : course sur
          route, trail et vélo. Débutant ou confirmé, vous y mesurez précisément vos capacités
          physiologiques pour vous entraîner aux bonnes intensités et progresser sans vous blesser.
        </p>
      </div>

      <div>
        <h2>Nos équipements</h2>
        <div className="features">
          {EQUIPEMENTS.map((equipement) => (
            <article key={equipement.titre} className="feature">
              <h2>{equipement.titre}</h2>
              <p>{equipement.texte}</p>
            </article>
          ))}
        </div>
      </div>

      <div className="card">
        <h2>Déroulement d'un bilan</h2>
        <ol className="centre-etapes">
          {DEROULEMENT.map((etape) => (
            <li key={etape}>{etape}</li>
          ))}
        </ol>
        <p className="muted">Durée : 1 h 30. Prévoyez une tenue de sport et vos chaussures habituelles.</p>
      </div>

      <div className="card centre-infos">
        <div>
          <h2>Adresse</h2>
          <address>
            {ADRESSE.map((ligne) => (
              <span key={ligne}>{ligne}</span>
            ))}
          </address>
        </div>
        <div>
          <h2>Horaires</h2>
          <p>{HORAIRES}</p>
        </div>
        <div>
          <h2>Contact</h2>
          <p>{TELEPHONE}</p>
        </div>
      </div>

      <button className="btn btn-primary btn-large" onClick={onRdv}>
        Prendre rendez-vous
      </button>
    </section>
  )
}
