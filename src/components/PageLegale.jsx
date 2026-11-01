import { ADRESSE, EMAIL, NOM_CENTRE, TELEPHONE } from '../infos.js'

const A_COMPLETER = (texte) => <span className="a-completer">[{texte}]</span>

const coordonnees = (
  <>
    {NOM_CENTRE}, {ADRESSE.join(', ')}. Téléphone : {TELEPHONE}. Email : {EMAIL}.
  </>
)

const PAGES = {
  mentions: {
    titre: 'Mentions légales',
    sections: [
      {
        titre: 'Éditeur du site',
        contenu: (
          <>
            <p>{coordonnees}</p>
            <p>
              Forme juridique : {A_COMPLETER('forme juridique et capital')}. SIRET :{' '}
              {A_COMPLETER('numéro SIRET')}. Directeur de la publication :{' '}
              {A_COMPLETER('nom du responsable')}.
            </p>
          </>
        ),
      },
      {
        titre: 'Hébergement',
        contenu: (
          <p>
            Le site est hébergé par Vercel Inc. (vercel.com). Le serveur applicatif est hébergé par
            Railway (railway.com) et les données par Supabase (supabase.com).
          </p>
        ),
      },
      {
        titre: 'Données personnelles',
        contenu: (
          <p>
            Les informations saisies dans votre espace (identité, mesures, performances, rendez-vous)
            servent uniquement à organiser et préparer vos bilans. Vous pouvez demander l'accès, la
            rectification ou la suppression de vos données en écrivant à {EMAIL}. Responsable du
            traitement : {A_COMPLETER('nom du responsable')}.
          </p>
        ),
      },
      {
        titre: 'Propriété intellectuelle',
        contenu: (
          <p>
            Les textes, graphiques et éléments visuels du site sont la propriété de {NOM_CENTRE}, sauf
            mention contraire. Toute reproduction sans autorisation est interdite.
          </p>
        ),
      },
    ],
  },
  cgv: {
    titre: 'Conditions générales de vente',
    sections: [
      {
        titre: 'Objet',
        contenu: (
          <p>
            Les présentes conditions régissent la réservation des bilans de performance (route, trail
            et vélo) proposés par {NOM_CENTRE} via ce site.
          </p>
        ),
      },
      {
        titre: 'Prestations et prix',
        contenu: (
          <p>
            Chaque bilan dure 1 h 30 et est facturé 149 € TTC. Les bilans sont réalisés par un
            cardiologue du sport dans un but d'aide à la performance : ils ne sont pas pris en charge
            par l'Assurance Maladie.
          </p>
        ),
      },
      {
        titre: 'Réservation et paiement',
        contenu: (
          <p>
            La réservation nécessite un compte utilisateur. Le rendez-vous est confirmé après paiement
            en ligne. {A_COMPLETER('moyens de paiement acceptés')}
          </p>
        ),
      },
      {
        titre: 'Annulation',
        contenu: (
          <p>
            Vous pouvez annuler un rendez-vous depuis votre espace jusqu'à 24 h avant son début. Passé
            ce délai, contactez le centre. {A_COMPLETER('conditions de remboursement')}
          </p>
        ),
      },
      {
        titre: 'Déroulement et contre-indications',
        contenu: (
          <p>
            Le test d'effort est maximal. Le sportif s'engage à signaler tout antécédent ou symptôme
            lors de l'entretien préalable ; le médecin peut refuser ou interrompre l'examen pour raison
            médicale. {A_COMPLETER('conséquences sur le paiement')}
          </p>
        ),
      },
      {
        titre: 'Litiges',
        contenu: (
          <p>
            Les présentes conditions sont soumises au droit français. {A_COMPLETER('médiateur de la consommation')}
          </p>
        ),
      },
    ],
  },
}

export default function PageLegale({ page }) {
  const { titre, sections } = PAGES[page]
  return (
    <section className="centre page-legale">
      <div className="centre-intro">
        <h1>{titre}</h1>
        <p className="muted small">Les éléments entre crochets restent à compléter.</p>
      </div>
      {sections.map((section) => (
        <div key={section.titre}>
          <h2>{section.titre}</h2>
          {section.contenu}
        </div>
      ))}
    </section>
  )
}
