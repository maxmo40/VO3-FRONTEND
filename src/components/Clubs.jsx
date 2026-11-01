const AVANTAGES = [
  {
    titre: 'Tarif préférentiel',
    texte: 'Un prix réduit sur chaque bilan, dégressif selon le nombre d’athlètes de votre club.',
  },
  {
    titre: 'Accompagnement sur-mesure',
    texte: 'Un programme de tests construit avec vos entraîneurs, adapté à votre discipline et à votre calendrier de compétitions.',
  },
  {
    titre: 'Suivi de la progression',
    texte: 'Des bilans répétés au fil de la saison pour mesurer l’effet de l’entraînement et ajuster les charges.',
  },
  {
    titre: 'Créneaux dédiés',
    texte: 'Des plages réservées à votre club pour faire passer plusieurs athlètes sur une même session.',
  },
]

const ETAPES = [
  'Vous nous présentez votre club, vos athlètes et vos objectifs',
  'Nous construisons ensemble un programme de bilans et un devis adapté',
  'Vos athlètes passent leurs bilans sur des créneaux réservés',
  'Vos entraîneurs reçoivent les comptes rendus pour individualiser l’entraînement',
]

export default function Clubs({ onContact }) {
  return (
    <section className="centre">
      <div className="centre-intro">
        <h1>Vous êtes un club ?</h1>
        <p>
          Course sur route, trail ou cyclisme : VO2RUN accompagne les clubs et leurs entraîneurs avec une
          offre sur-mesure et un tarif préférentiel pour évaluer et faire progresser leurs athlètes.
        </p>
      </div>

      <div>
        <h2>Ce que nous proposons</h2>
        <div className="features">
          {AVANTAGES.map((avantage) => (
            <article key={avantage.titre} className="feature">
              <h2>{avantage.titre}</h2>
              <p>{avantage.texte}</p>
            </article>
          ))}
        </div>
      </div>

      <div className="card">
        <h2>Comment ça se passe</h2>
        <ol className="centre-etapes">
          {ETAPES.map((etape) => (
            <li key={etape}>{etape}</li>
          ))}
        </ol>
      </div>

      <div className="card clubs-contact">
        <div>
          <h2>Parlons de votre projet</h2>
          <p className="muted">
            Indiquez-nous le nom de votre club, votre discipline et le nombre d’athlètes concernés : nous
            revenons vers vous avec une proposition et un devis.
          </p>
        </div>
        <button className="btn btn-primary btn-large" onClick={() => onContact('Partenariat club')}>
          Nous contacter
        </button>
      </div>
    </section>
  )
}
