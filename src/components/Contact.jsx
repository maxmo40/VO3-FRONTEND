import { useState } from 'react'
import { useAuth } from '../AuthContext.jsx'

const EMAIL_VALIDE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function Contact({ sujetInitial = '' }) {
  const { user } = useAuth()
  const [message, setMessage] = useState({
    prenom: '',
    nom: '',
    email: user?.email ?? '',
    sujet: sujetInitial,
    texte: '',
  })
  const [erreur, setErreur] = useState(null)
  const [envoi, setEnvoi] = useState(false)
  const [envoye, setEnvoye] = useState(false)

  const handleChange = (e) => {
    setMessage({ ...message, [e.target.name]: e.target.value })
    setErreur(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (Object.values(message).some((valeur) => !valeur.trim())) {
      return setErreur('Merci de remplir tous les champs')
    }
    if (!EMAIL_VALIDE.test(message.email.trim())) return setErreur('Adresse email invalide')

    // Envoi fictif en attendant une adresse email professionnelle : rien ne part réellement
    setEnvoi(true)
    await new Promise((resolve) => setTimeout(resolve, 600))
    setEnvoi(false)
    setEnvoye(true)
  }

  if (envoye) {
    return (
      <section className="centre">
        <div className="confirmation">
          <h1>Message envoyé</h1>
          <p className="muted">
            Merci {message.prenom.trim()}, nous avons bien reçu votre message et vous répondrons à{' '}
            {message.email.trim()} dans les meilleurs délais.
          </p>
          <button
            className="btn btn-secondary"
            onClick={() => {
              setMessage({ ...message, sujet: '', texte: '' })
              setEnvoye(false)
            }}
          >
            Envoyer un autre message
          </button>
        </div>
      </section>
    )
  }

  return (
    <section className="centre">
      <div className="centre-intro">
        <h1>Nous contacter</h1>
        <p>Une question sur nos bilans, un projet de club ou une demande particulière ? Écrivez-nous.</p>
      </div>

      <form className="card profil-form" onSubmit={handleSubmit} noValidate>
        <fieldset disabled={envoi}>
          <div className="form-grid">
            <label>
              Prénom
              <input name="prenom" value={message.prenom} onChange={handleChange} autoComplete="given-name" />
            </label>
            <label>
              Nom
              <input name="nom" value={message.nom} onChange={handleChange} autoComplete="family-name" />
            </label>
            <label className="form-grid-full">
              Email
              <input
                type="email"
                name="email"
                value={message.email}
                onChange={handleChange}
                autoComplete="email"
              />
            </label>
            <label className="form-grid-full">
              Sujet
              <input name="sujet" value={message.sujet} onChange={handleChange} maxLength={150} />
            </label>
            <label className="form-grid-full">
              Message
              <textarea name="texte" value={message.texte} onChange={handleChange} rows={7} maxLength={5000} />
            </label>
          </div>
        </fieldset>
        <div className="form-actions">
          <button className="btn btn-primary" disabled={envoi}>
            {envoi ? 'Envoi…' : 'Envoyer'}
          </button>
          {erreur && <p className="form-error">{erreur}</p>}
        </div>
      </form>
    </section>
  )
}
