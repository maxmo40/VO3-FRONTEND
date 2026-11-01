// Membres de l'équipe : noms et parcours à compléter
const MEMBRES = [
  {
    nom: '[Prénom Nom]',
    role: 'Cardiologue du sport',
    initiales: 'CS',
    description:
      "Médecin cardiologue spécialisé dans le suivi des sportifs, il s'assure que votre cœur est prêt pour l'effort. Il analyse l'électrocardiogramme et la réponse cardiaque pendant le test, et vérifie qu'aucune contre-indication ne s'oppose à votre pratique.",
    missions: ["Examen et ECG avant l'effort", 'Surveillance cardiaque pendant le test', 'Avis médical sur la pratique sportive'],
  },
  {
    nom: '[Prénom Nom]',
    role: "Physiologiste de l'exercice",
    initiales: 'PE',
    description:
      "Spécialiste de la réponse du corps à l'effort, il conduit le test sur tapis ou sur vélo et analyse vos échanges gazeux. Il traduit vos résultats en zones d'entraînement concrètes, adaptées à vos objectifs.",
    missions: ['Conduite du test d’effort', 'Analyse de la VO2max et des seuils', "Définition de vos zones d'entraînement"],
  },
]

export default function Equipe({ onRdv }) {
  return (
    <section className="centre">
      <div className="centre-intro">
        <h1>Notre équipe</h1>
        <p>
          Chaque bilan associe un regard médical et une expertise de la performance : vous testez vos
          limites en toute sécurité, et repartez avec des repères fiables pour vous entraîner.
        </p>
      </div>

      <div className="equipe">
        {MEMBRES.map((membre) => (
          <article key={membre.role} className="card membre">
            <div className="membre-entete">
              <div className="membre-avatar" aria-hidden="true">
                {membre.initiales}
              </div>
              <div>
                <h2>{membre.nom}</h2>
                <p className="membre-role">{membre.role}</p>
              </div>
            </div>
            <p className="muted">{membre.description}</p>
            <ul className="membre-missions">
              {membre.missions.map((mission) => (
                <li key={mission}>{mission}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>

      <button className="btn btn-primary btn-large" onClick={onRdv}>
        Prendre rendez-vous
      </button>
    </section>
  )
}
