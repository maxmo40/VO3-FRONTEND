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
            traitement : {A_COMPLETER('nom du responsable')}. Le détail figure dans la politique de
            confidentialité.
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
  confidentialite: {
    titre: 'Politique de confidentialité',
    intro: 'Ébauche à faire valider par un juriste ou un DPO avant mise en service. Dernière mise à jour : 24 novembre 2026.',
    sections: [
      {
        titre: 'Responsable du traitement',
        contenu: (
          <p>
            Les données personnelles collectées sur ce site sont traitées par {coordonnees} Responsable du
            traitement : {A_COMPLETER('nom et qualité du responsable')}. Délégué à la protection des données :{' '}
            {A_COMPLETER('nom et contact du DPO, le cas échéant')}.
          </p>
        ),
      },
      {
        titre: 'Données collectées',
        contenu: (
          <>
            <p>Selon votre utilisation du site, nous collectons :</p>
            <ul>
              <li>
                <strong>Compte</strong> : adresse email et mot de passe (stocké chiffré, nous n'y avons jamais
                accès).
              </li>
              <li>
                <strong>Profil</strong> : prénom, nom, sexe, date de naissance, téléphone, poids et taille.
              </li>
              <li>
                <strong>Performances</strong> : VMA et temps de course que vous déclarez.
              </li>
              <li>
                <strong>Rendez-vous</strong> : bilans réservés, créneaux, montants et protocole de test choisi.
              </li>
              <li>
                <strong>Données de santé</strong> : réponses au questionnaire médical pré-test (âge, suivi
                cardiologique, facteurs de risque, antécédents, traitements, symptômes) et résultats de vos
                tests d'effort. {A_COMPLETER('préciser si les résultats sont conservés sur le site')}
              </li>
              <li>
                <strong>Consentements</strong> : vos choix concernant le droit à l'image et l'utilisation de vos
                données, avec leur date.
              </li>
              <li>
                <strong>Images</strong> : photos et vidéos prises lors des tests ou événements, uniquement si vous
                l'avez autorisé.
              </li>
            </ul>
          </>
        ),
      },
      {
        titre: 'Finalités et bases légales',
        contenu: (
          <ul>
            <li>
              Gérer votre compte, vos réservations et le paiement : <em>exécution du contrat</em>.
            </li>
            <li>
              Préparer votre test (protocole personnalisé, estimation de la VO2max) :{' '}
              <em>exécution du contrat</em>.
            </li>
            <li>
              Évaluer, grâce au questionnaire médical, si une consultation cardiologique est nécessaire avant
              l'épreuve : <em>consentement explicite</em> (article 9.2.a du RGPD).{' '}
              {A_COMPLETER('base légale à confirmer avec le médecin responsable')}
            </li>
            <li>
              Analyser vos performances et suivre votre progression : <em>consentement</em>.
            </li>
            <li>
              Vous contacter par email ou téléphone en dehors de vos rendez-vous : <em>consentement</em>.
            </li>
            <li>
              Utiliser votre image sur nos supports de communication : <em>consentement</em>.
            </li>
            <li>
              Conserver les factures : <em>obligation légale</em>.
            </li>
          </ul>
        ),
      },
      {
        titre: 'Destinataires',
        contenu: (
          <>
            <p>
              Vos données sont accessibles uniquement à l'équipe de {NOM_CENTRE} qui réalise et analyse vos bilans,
              dont le cardiologue du sport. Elles ne sont jamais vendues ni cédées à des tiers à des fins
              commerciales.
            </p>
            <p>
              Des prestataires techniques les hébergent pour notre compte, sans pouvoir les utiliser à d'autres
              fins : Supabase (base de données et authentification), Railway (serveur applicatif) et Vercel
              (hébergement du site).
            </p>
          </>
        ),
      },
      {
        titre: 'Hébergement et transferts hors de l\'Union européenne',
        contenu: (
          <p>
            Les données de santé doivent être hébergées par un hébergeur certifié HDS (hébergeur de données de
            santé). {A_COMPLETER('nom de l\'hébergeur certifié HDS et localisation des serveurs')} Certains
            prestataires techniques sont des sociétés américaines : les éventuels transferts sont encadrés par{' '}
            {A_COMPLETER('clauses contractuelles types ou Data Privacy Framework, à vérifier pour chaque prestataire')}.
          </p>
        ),
      },
      {
        titre: 'Durées de conservation',
        contenu: (
          <ul>
            <li>
              Compte et profil : tant que votre compte est actif, puis {A_COMPLETER('durée, par exemple 3 ans')}{' '}
              après votre dernière activité.
            </li>
            <li>
              Questionnaire médical et résultats de tests : {A_COMPLETER('durée, à fixer avec le médecin responsable')}.
            </li>
            <li>Factures : 10 ans, conformément au Code de commerce.</li>
            <li>Consentements : pendant toute leur durée de validité, puis le temps nécessaire à leur preuve.</li>
            <li>
              Images : jusqu'au retrait de votre autorisation, et au plus {A_COMPLETER('durée maximale')}.
            </li>
          </ul>
        ),
      },
      {
        titre: 'Vos droits',
        contenu: (
          <>
            <p>
              Vous disposez d'un droit d'accès, de rectification, d'effacement, de limitation, d'opposition et de
              portabilité de vos données, ainsi que du droit de définir des directives sur leur sort après votre
              décès. Vous pouvez retirer un consentement à tout moment depuis « Mon espace » ; ce retrait ne remet
              pas en cause les traitements déjà réalisés.
            </p>
            <p>
              Pour exercer vos droits, écrivez à {EMAIL}. Nous répondons dans un délai d'un mois. Si vous estimez
              que vos droits ne sont pas respectés, vous pouvez adresser une réclamation à la CNIL (cnil.fr).
            </p>
          </>
        ),
      },
      {
        titre: 'Sécurité',
        contenu: (
          <p>
            Les échanges avec le site sont chiffrés (HTTPS), les mots de passe sont stockés chiffrés et l'accès
            aux données est limité aux personnes qui en ont besoin. Chaque client ne peut consulter que ses propres
            informations.
          </p>
        ),
      },
      {
        titre: 'Cookies et stockage local',
        contenu: (
          <p>
            Le site ne dépose aucun cookie publicitaire ni de mesure d'audience. Votre session de connexion est
            conservée dans le stockage local de votre navigateur et disparaît à la déconnexion. Les polices de
            caractères sont chargées depuis Google Fonts, ce qui transmet votre adresse IP à Google.
          </p>
        ),
      },
      {
        titre: 'Mineurs',
        contenu: <p>{A_COMPLETER('âge minimum et autorisation parentale pour les sportifs mineurs')}</p>,
      },
      {
        titre: 'Modifications',
        contenu: (
          <p>
            Cette politique peut évoluer. La date de dernière mise à jour figure en haut de cette page ; en cas
            de changement important, nous vous en informerons par email.
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
            Chaque bilan dure 30 minutes et est facturé 149 € TTC. Les bilans sont réalisés par un
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
  const { titre, intro, sections } = PAGES[page]
  return (
    <section className="centre page-legale">
      <div className="centre-intro">
        <h1>{titre}</h1>
        {intro && <p className="muted small">{intro}</p>}
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
