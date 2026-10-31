import { useEffect, useState } from 'react'
import { useAuth } from '../AuthContext.jsx'

export default function AuthModal({ onClose, onSuccess }) {
  const { signup, login } = useAuth()
  const [mode, setMode] = useState('signup')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const isSignup = mode === 'signup'

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await (isSignup ? signup : login)(email, password)
      onSuccess()
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const switchMode = () => {
    setMode(isSignup ? 'login' : 'signup')
    setError('')
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-title"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal-close" onClick={onClose} aria-label="Fermer">
          ×
        </button>
        <h2 id="auth-title">{isSignup ? 'Créer un compte' : 'Se connecter'}</h2>

        <form onSubmit={handleSubmit}>
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
              autoFocus
            />
          </label>
          <label>
            Mot de passe
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={isSignup ? 'new-password' : 'current-password'}
              minLength={6}
              required
            />
          </label>
          {error && <p className="form-error">{error}</p>}
          <button className="btn btn-primary btn-block" disabled={submitting}>
            {submitting ? 'Patientez…' : isSignup ? 'Créer mon compte' : 'Se connecter'}
          </button>
        </form>

        <p className="modal-switch">
          {isSignup ? 'Déjà un compte ?' : 'Pas encore de compte ?'}{' '}
          <button className="link" onClick={switchMode}>
            {isSignup ? 'Se connecter' : 'Créer un compte'}
          </button>
        </p>
      </div>
    </div>
  )
}
