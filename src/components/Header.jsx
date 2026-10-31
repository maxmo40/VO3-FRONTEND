import { useAuth } from '../AuthContext.jsx'

export default function Header({ onHome, onLogin, onEspace, onRdv }) {
  const { user, loading } = useAuth()

  return (
    <header className="header">
      <button className="logo" onClick={onHome}>
        VO3
      </button>
      <nav className="header-actions">
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
