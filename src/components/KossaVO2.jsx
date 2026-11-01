import { useState } from 'react'
import CourbeVO2, { POIDS_KG, PROFILS, simulerTest } from './CourbeVO2.jsx'

const ZONES = [
  {
    titre: 'Zone 1 · sous SV1',
    texte:
      "Endurance fondamentale : respiration aisée, on peut tenir une conversation. C'est là que se construit le « moteur » aérobie (capillaires, mitochondries, utilisation des graisses). Elle doit représenter la grande majorité du volume d'entraînement.",
  },
  {
    titre: 'Zone 2 · entre SV1 et SV2',
    texte:
      "Allure « seuil » ou tempo : on ne parle plus que par phrases courtes. Très efficace pour repousser SV2, mais coûteuse en fatigue : à doser. C'est souvent l'intensité d'un marathon ou d'une longue sortie à vélo appuyée.",
  },
  {
    titre: 'Zone 3 · au-dessus de SV2',
    texte:
      "Haute intensité : l'effort ne tient que quelques minutes. Les fractionnés courts dans cette zone développent la VO2max elle-même. Quelques séances par semaine suffisent, avec une récupération suffisante.",
  },
]

const INTERETS = [
  {
    titre: 'Des zones vraiment personnelles',
    texte:
      'Les formules en % de fréquence cardiaque maximale se trompent souvent de 10 à 15 battements. Vos seuils mesurés donnent des fréquences, allures et puissances qui sont les vôtres.',
  },
  {
    titre: 'Éviter le piège de la zone grise',
    texte:
      "Beaucoup de sportifs font leurs footings trop vite et leurs séances dures trop lentement. Connaître SV1 permet de ralentir vraiment les jours faciles pour être frais les jours intenses.",
  },
  {
    titre: 'Mesurer la progression',
    texte:
      "D'un bilan à l'autre, des seuils qui se décalent vers la droite (plus de puissance ou de vitesse au même effort) montrent que l'entraînement fonctionne, même si la VO2max bouge peu.",
  },
  {
    titre: 'Gérer sa course',
    texte:
      'Savoir à quelle allure ou puissance se situe SV2 aide à choisir un rythme tenable sur un semi, un trail ou un contre-la-montre, sans exploser avant la fin.',
  },
]

const nombre = (n, decimales = 0) =>
  n.toLocaleString('fr-FR', { minimumFractionDigits: decimales, maximumFractionDigits: decimales })

export default function KossaVO2({ onRdv }) {
  const [profil, setProfil] = useState('entraine')
  const { vo2max, sv1, sv2 } = PROFILS[profil]
  const { pSv1, pSv2, pMax } = simulerTest(PROFILS[profil])

  return (
    <section className="centre">
      <div className="centre-intro">
        <h1>Kossa la VO2 ?</h1>
        <p>
          La VO2, c'est le volume d'oxygène que votre corps consomme chaque minute. Plus l'effort est
          intense, plus vos muscles en réclament, jusqu'à un plafond : la VO2max, votre « cylindrée »
          aérobie.
        </p>
      </div>

      <div className="card explication">
        <h2>D'où vient l'oxygène consommé ?</h2>
        <p>
          À chaque contraction, vos muscles produisent leur énergie (l'ATP) dans les mitochondries, en
          brûlant des glucides et des graisses grâce à l'oxygène. Pour y arriver, l'oxygène suit une
          chaîne : les <strong>poumons</strong> le font passer dans le sang, le <strong>cœur</strong>{' '}
          le propulse, l'<strong>hémoglobine</strong> le transporte, et les <strong>muscles</strong>{' '}
          l'extraient.
        </p>
        <p>
          C'est ce que résume l'équation de Fick : <em>VO2 = débit cardiaque × oxygène extrait par les
          muscles</em>. La VO2max est atteinte quand le maillon le plus faible (le plus souvent le cœur
          chez le sportif) ne peut plus suivre. Elle s'exprime en litres par minute, ou en ml/kg/min
          pour comparer des personnes de poids différents.
        </p>
        <p>
          En échange, les muscles rejettent du gaz carbonique, la <strong>VCO2</strong>. Au repos, on
          en rejette un peu moins qu'on ne consomme d'oxygène. Mais quand l'effort s'intensifie,
          l'acidité produite par les muscles est neutralisée par les bicarbonates du sang, ce qui libère
          du CO2 en plus : la VCO2 se met à grimper plus vite que la VO2. Ces cassures trahissent vos
          seuils.
        </p>
      </div>

      <div className="card">
        <div className="card-header">
          <h2>Un test d'effort, en courbes</h2>
          <div className="segmented" role="group" aria-label="Profil de sportif">
            {Object.entries(PROFILS).map(([cle, { libelle }]) => (
              <button key={cle} type="button" aria-pressed={profil === cle} onClick={() => setProfil(cle)}>
                {libelle}
              </button>
            ))}
          </div>
        </div>
        <p className="muted courbe-consigne">
          Survolez ou touchez le graphique pour lire les valeurs. Changez de profil pour voir les seuils
          et la VO2max se décaler.
        </p>
        <CourbeVO2 profil={profil} />
        <p className="muted small">
          Simulation d'un test sur vélo, avec une puissance qui augmente progressivement, pour un sportif
          de {POIDS_KG} kg. Profil {PROFILS[profil].libelle.toLowerCase()} : VO2max de{' '}
          {nombre((vo2max * 1000) / POIDS_KG)} ml/kg/min, atteinte vers {nombre(pMax)} W ; SV1 à{' '}
          {nombre(sv1 * 100)} % ({nombre(pSv1)} W) et SV2 à {nombre(sv2 * 100)} % ({nombre(pSv2)} W) de
          la VO2max. En bilan réel, les seuils sont repérés sur la ventilation et les échanges gazeux
          mesurés respiration par respiration.
        </p>
        <details className="courbe-tableau">
          <summary>Voir les valeurs des trois profils</summary>
          <table>
            <thead>
              <tr>
                <th scope="col">Profil</th>
                <th scope="col">VO2max</th>
                <th scope="col">SV1</th>
                <th scope="col">SV2</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(PROFILS).map(([cle, p]) => {
                const t = simulerTest(p)
                return (
                  <tr key={cle}>
                    <th scope="row">{p.libelle}</th>
                    <td>{nombre((p.vo2max * 1000) / POIDS_KG)} ml/kg/min</td>
                    <td>
                      {nombre(t.pSv1)} W · {nombre(p.sv1 * 100)} %
                    </td>
                    <td>
                      {nombre(t.pSv2)} W · {nombre(p.sv2 * 100)} %
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </details>
      </div>

      <div className="card explication">
        <h2>SV1 et SV2, les deux seuils ventilatoires</h2>
        <p>
          <strong>SV1, le seuil aérobie.</strong> Les muscles commencent à produire un peu plus de
          lactate. Le sang le tamponne, le CO2 supplémentaire fait accélérer la respiration : sur la
          courbe, la VCO2 décroche vers le haut par rapport à la VO2. En dessous, l'effort peut durer des
          heures.
        </p>
        <p>
          <strong>SV2, le seuil anaérobie</strong> (ou point de compensation respiratoire). Le lactate
          s'accumule plus vite que l'organisme ne l'élimine, le tampon est débordé et la respiration
          s'emballe pour évacuer l'acidité. Au-delà, l'effort ne se tient que quelques minutes avant
          l'épuisement.
        </p>
      </div>

      <div>
        <h2>Trois zones pour s'entraîner</h2>
        <div className="features">
          {ZONES.map((z) => (
            <article key={z.titre} className="feature">
              <h2>{z.titre}</h2>
              <p>{z.texte}</p>
            </article>
          ))}
        </div>
      </div>

      <div>
        <h2>Pourquoi mesurer ses seuils ?</h2>
        <div className="features">
          {INTERETS.map((i) => (
            <article key={i.titre} className="feature">
              <h2>{i.titre}</h2>
              <p>{i.texte}</p>
            </article>
          ))}
        </div>
      </div>

      <button className="btn btn-primary btn-large" onClick={onRdv}>
        Mesurer ma VO2max et mes seuils
      </button>
    </section>
  )
}
