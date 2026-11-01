import { useEffect, useId, useRef, useState } from 'react'

// Bouton de navbar avec un sous-menu : ouvert au survol (CSS) ou via la flèche (tactile, clavier)
export default function MenuDeroulant({ libelle, onClick, elements }) {
  const [ouvert, setOuvert] = useState(false)
  const conteneur = useRef(null)
  const id = useId()

  // Un clic ailleurs ou Échap referme le menu
  useEffect(() => {
    if (!ouvert) return
    const fermer = (e) => {
      if (!conteneur.current.contains(e.target)) setOuvert(false)
    }
    const echap = (e) => e.key === 'Escape' && setOuvert(false)
    document.addEventListener('pointerdown', fermer)
    document.addEventListener('keydown', echap)
    return () => {
      document.removeEventListener('pointerdown', fermer)
      document.removeEventListener('keydown', echap)
    }
  }, [ouvert])

  const choisir = (action) => () => {
    setOuvert(false)
    action()
  }

  return (
    <div className={`menu-deroulant${ouvert ? ' ouvert' : ''}`} ref={conteneur}>
      <button className="btn btn-ghost" onClick={choisir(onClick)}>
        {libelle}
      </button>
      <button
        className="menu-fleche"
        aria-label={`Plus d'options : ${libelle}`}
        aria-expanded={ouvert}
        aria-controls={id}
        onClick={() => setOuvert(!ouvert)}
      >
        <svg viewBox="0 0 12 12" width="12" height="12" aria-hidden="true">
          <path d="M2.5 4.5 6 8l3.5-3.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <div className="menu-liste" id={id}>
        {elements.map(({ libelle: libelleElement, onClick: action }) => (
          <button key={libelleElement} onClick={choisir(action)}>
            {libelleElement}
          </button>
        ))}
      </div>
    </div>
  )
}
