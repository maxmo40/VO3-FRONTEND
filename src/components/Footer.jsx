import { ADRESSE, EMAIL, HORAIRES, NOM_CENTRE, TELEPHONE } from '../infos.js'
import Marque from './Marque.jsx'
import Remparts from './Remparts.jsx'

// Réseaux sociaux affichés mais pas encore cliquables (comptes à venir)
const RESEAUX = [
  {
    nom: 'Instagram',
    icone: (
      <>
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
      </>
    ),
  },
  {
    nom: 'Facebook',
    icone: <path d="M15 3h-2.5A4.5 4.5 0 0 0 8 7.5V10H6v4h2v7h4v-7h2.5l.5-4H12V7.5a.5.5 0 0 1 .5-.5H15Z" />,
  },
]

export default function Footer({ onCgv, onMentions }) {
  return (
    <>
      <Remparts className="remparts-footer" />
      <footer className="footer">
        <div className="footer-colonnes">
          <div>
            <p className="footer-logo">
              <Marque />
            </p>
            <p className="muted">Bilans de performance pour la course sur route, le trail et le vélo.</p>
            <div className="footer-reseaux">
              {RESEAUX.map(({ nom, icone }) => (
                <span key={nom} className="footer-reseau" role="img" aria-label={`${nom} (bientôt disponible)`} title="Bientôt disponible">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    {icone}
                  </svg>
                </span>
              ))}
            </div>
          </div>

          <div>
            <h2>Nous contacter</h2>
            <p>{TELEPHONE}</p>
            <p>{EMAIL}</p>
          </div>

          <div>
            <h2>Nous trouver</h2>
            <address>
              {ADRESSE.map((ligne) => (
                <span key={ligne}>{ligne}</span>
              ))}
            </address>
            <p className="muted">{HORAIRES}</p>
          </div>
        </div>

        <div className="footer-bas">
          <span>
            © {new Date().getFullYear()} {NOM_CENTRE}
          </span>
          <nav className="footer-liens" aria-label="Informations légales">
            <button className="link" onClick={onCgv}>
              CGV
            </button>
            <button className="link" onClick={onMentions}>
              Mentions légales
            </button>
          </nav>
        </div>
      </footer>
    </>
  )
}
