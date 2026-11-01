import { useAuth } from '../AuthContext.jsx'
import MenuDeroulant from './MenuDeroulant.jsx'
import Marque from './Marque.jsx'

export default function Header({ onHome, onLogin, onEspace, onRdv, onAdmin, onCentre, onEquipe, onVo2, onClubs, onContact }) {
  const { user, loading } = useAuth()

  return (
    <header className="header">
      <button className="logo" onClick={onHome} aria-label="VO2RUN, accueil">
        <Marque />
      </button>
      <nav className="header-actions">
        <MenuDeroulant libelle="Le centre" onClick={onCentre} elements={[{ libelle: 'Notre équipe', onClick: onEquipe }]} />
        <button className="btn btn-ghost" onClick={onVo2}>
          Kossa la VO2 ?
        </button>
        <MenuDeroulant
          libelle="Nous contacter"
          onClick={onContact}
          elements={[{ libelle: 'Vous êtes un club ?', onClick: onClubs }]}
        />
        {user?.is_admin && (
          <button className="btn btn-secondary" onClick={onAdmin}>
            Agenda
          </button>
        )}
        <button className="btn btn-secondary" onClick={onRdv}>
          Prendre RDV
        </button>
        {!loading &&
          (user ? (
            <button className="btn btn-primary" onClick={onEspace}>
              Mon espace
            </button>
          ) : (
            <button className="btn btn-primary" onClick={onLogin}>
              Se connecter
            </button>
          ))}
      </nav>
    </header>
  )
}
