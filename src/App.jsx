import { useEffect, useState } from 'react'
import { useAuth } from './AuthContext.jsx'
import Header from './components/Header.jsx'
import Landing from './components/Landing.jsx'
import MonEspace from './components/MonEspace.jsx'
import Reservation from './components/Reservation.jsx'
import Agenda from './components/Agenda.jsx'
import Centre from './components/Centre.jsx'
import Clubs from './components/Clubs.jsx'
import Contact from './components/Contact.jsx'
import Equipe from './components/Equipe.jsx'
import KossaVO2 from './components/KossaVO2.jsx'
import AuthModal from './components/AuthModal.jsx'

export default function App() {
  const { user } = useAuth()
  const [page, setPage] = useState('accueil')
  const [authOpen, setAuthOpen] = useState(false)
  const [sujetContact, setSujetContact] = useState('')

  // Déconnecté depuis "Mon espace" ou l'agenda : retour à l'accueil
  useEffect(() => {
    if ((!user && page === 'espace') || (!user?.is_admin && page === 'admin')) setPage('accueil')
  }, [user, page])

  const openAuth = () => setAuthOpen(true)

  const openContact = (sujet = '') => {
    setSujetContact(sujet)
    setPage('contact')
  }

  return (
    <>
      <Header
        onHome={() => setPage('accueil')}
        onLogin={openAuth}
        onEspace={() => setPage('espace')}
        onRdv={() => setPage('rdv')}
        onAdmin={() => setPage('admin')}
        onCentre={() => setPage('centre')}
        onEquipe={() => setPage('equipe')}
        onVo2={() => setPage('vo2')}
        onClubs={() => setPage('clubs')}
        onContact={() => openContact()}
      />
      <main>
        {page === 'admin' && user?.is_admin ? (
          <Agenda />
        ) : page === 'espace' && user ? (
          <MonEspace onRdv={() => setPage('rdv')} />
        ) : page === 'vo2' ? (
          <KossaVO2 onRdv={() => setPage('rdv')} />
        ) : page === 'equipe' ? (
          <Equipe onRdv={() => setPage('rdv')} />
        ) : page === 'contact' ? (
          <Contact key={sujetContact} sujetInitial={sujetContact} />
        ) : page === 'clubs' ? (
          <Clubs onContact={openContact} />
        ) : page === 'centre' ? (
          <Centre onRdv={() => setPage('rdv')} />
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
