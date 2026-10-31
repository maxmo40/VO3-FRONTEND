import { useEffect, useState } from 'react'
import { useAuth } from './AuthContext.jsx'
import Header from './components/Header.jsx'
import Landing from './components/Landing.jsx'
import MonEspace from './components/MonEspace.jsx'
import Reservation from './components/Reservation.jsx'
import AuthModal from './components/AuthModal.jsx'

export default function App() {
  const { user } = useAuth()
  const [page, setPage] = useState('accueil')
  const [authOpen, setAuthOpen] = useState(false)

  // Déconnecté depuis "Mon espace" : retour à l'accueil
  useEffect(() => {
    if (!user && page === 'espace') setPage('accueil')
  }, [user, page])

  const openAuth = () => setAuthOpen(true)

  return (
    <>
      <Header
        onHome={() => setPage('accueil')}
        onLogin={openAuth}
        onEspace={() => setPage('espace')}
        onRdv={() => setPage('rdv')}
      />
      <main>
        {page === 'espace' && user ? (
          <MonEspace onRdv={() => setPage('rdv')} />
        ) : page === 'rdv' ? (
          <Reservation onLogin={openAuth} onEspace={() => setPage('espace')} />
        ) : (
          <Landing onRdv={() => setPage('rdv')} />
        )}
      </main>
      {authOpen && (
        <AuthModal
          onClose={() => setAuthOpen(false)}
          onSuccess={() => {
            setAuthOpen(false)
            // Pendant une réservation, on reste sur le parcours pour pouvoir payer
            if (page !== 'rdv') setPage('espace')
          }}
        />
      )}
    </>
  )
}
