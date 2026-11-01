import { useEffect, useRef } from 'react'

const ETAPES = [
  {
    titre: 'Vous réservez en ligne',
    texte:
      'Choisissez votre bilan (route, trail ou vélo), un créneau qui vous convient, et réglez en quelques clics depuis votre espace.',
  },
  {
    titre: 'Vous préparez le test',
    texte:
      'Renseignez votre VMA ou vos temps de course : votre protocole personnalisé apparaît dans « Mon espace », avec les conseils pour le jour J.',
  },
  {
    titre: 'Vous réalisez le test, encadré',
    texte:
      "Entretien et contrôle cardiaque par le cardiologue du sport, puis test d'effort progressif sur tapis ou vélo, avec analyse de vos échanges gazeux respiration par respiration.",
  },
  {
    titre: 'Nous analysons vos résultats',
    texte:
      "VO2max, seuils SV1 et SV2, fréquences cardiaques et allures ou puissances associées : chaque courbe est relue et expliquée, pas seulement calculée.",
  },
  {
    titre: 'Vous vous retestez',
    texte:
      "Quelques mois plus tard, un nouveau bilan dans les mêmes conditions montre ce que l'entraînement a changé, et permet d'ajuster vos zones.",
  },
]

// Chaque étape apparaît quand elle entre à l'écran (une seule fois)
function useApparition() {
  const liste = useRef(null)

  useEffect(() => {
    const elements = liste.current.querySelectorAll('.parcours-etape')
    if (!('IntersectionObserver' in window)) {
      elements.forEach((el) => el.classList.add('visible'))
      return
    }
    const observateur = new IntersectionObserver(
      (entrees) => {
        for (const entree of entrees) {
          if (!entree.isIntersecting) continue
          entree.target.classList.add('visible')
          observateur.unobserve(entree.target)
        }
      },
      { threshold: 0.25, rootMargin: '0px 0px -10% 0px' }
    )
    elements.forEach((el) => observateur.observe(el))
    return () => observateur.disconnect()
  }, [])

  return liste
}

export default function Parcours() {
  const liste = useApparition()

  return (
    <section className="parcours">
      <h2>Comment ça se passe, du premier clic au retest</h2>
      <p className="parcours-intro">
        Un bilan VO2RUN n'est pas une mesure isolée : c'est une séance encadrée, une analyse humaine,
        et un point de comparaison pour la suite.
      </p>
      <ol className="parcours-etapes" ref={liste}>
        {ETAPES.map((etape, i) => (
          <li key={etape.titre} className="parcours-etape">
            <span className="parcours-numero" aria-hidden="true">
              {i + 1}
            </span>
            <div>
              <h3>{etape.titre}</h3>
              <p>{etape.texte}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}
