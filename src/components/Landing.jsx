const FEATURES = [
  { title: 'Simple', text: 'Créez votre compte en quelques secondes, sans étape superflue.' },
  { title: 'Sécurisé', text: 'Vos identifiants sont protégés et vos mots de passe chiffrés.' },
  { title: 'Personnel', text: 'Retrouvez toutes vos informations dans votre espace dédié.' },
]

// Pas de lecture automatique pour les personnes qui demandent moins d'animations
const animationsReduites = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

export default function Landing({ onRdv }) {
  return (
    <>
      {/* Vidéo Mixkit (licence gratuite, sans attribution requise) */}
      <div className="hero-video">
        <video
          src="/videos/accueil.mp4"
          poster="/videos/accueil.jpg"
          autoPlay={!animationsReduites()}
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden="true"
        />
      </div>
      <section className="hero">
        <h1>Bienvenue sur VO3</h1>
        <p className="hero-subtitle">
          La plateforme qui vous accompagne au quotidien. Rejoignez-nous dès aujourd'hui.
        </p>
        <button className="btn btn-primary btn-large" onClick={onRdv}>
          Prendre rendez-vous
        </button>
      </section>
      <section className="features">
        {FEATURES.map((feature) => (
          <article key={feature.title} className="feature">
            <h2>{feature.title}</h2>
            <p>{feature.text}</p>
          </article>
        ))}
      </section>
    </>
  )
}
