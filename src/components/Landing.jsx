import Parcours from './Parcours.jsx'

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
        <h1>Bienvenue sur VO2RUN</h1>
        <p className="hero-subtitle">
          Test physiologique par épreuve d'effort cardio-respiratoire dite VO2max.
        </p>
        <button className="btn btn-primary btn-large" onClick={onRdv}>
          Prendre rendez-vous
        </button>
      </section>
      <Parcours />
    </>
  )
}
