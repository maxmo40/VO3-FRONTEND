import { useEffect, useMemo, useRef, useState } from 'react'

// Modèle simplifié d'un test d'effort triangulaire sur vélo (athlète de 70 kg)
// VO2 linéaire avec la puissance (~10,8 ml/min/W) jusqu'au plateau de la VO2max ;
// VCO2 = VO2 × quotient respiratoire, qui augmente plus vite après chaque seuil.
export const POIDS_KG = 70
const VO2_BASE = 0.35
const PENTE_VO2 = 0.0108
const PUISSANCE_DEBUT = 40
const PAS = 2

export const PROFILS = {
  debutant: { libelle: 'Débutant', vo2max: 2.8, sv1: 0.55, sv2: 0.8 },
  entraine: { libelle: 'Entraîné', vo2max: 3.85, sv1: 0.65, sv2: 0.85 },
  elite: { libelle: 'Élite', vo2max: 4.9, sv1: 0.75, sv2: 0.9 },
}

const puissancePour = (vo2) => (vo2 - VO2_BASE) / PENTE_VO2

// Minimum adouci : la VO2 s'arrondit en plateau au lieu de casser net
const plafonner = (a, b, k = 0.05) => -k * Math.log(Math.exp(-a / k) + Math.exp(-b / k))

const interpoler = (points, x) => {
  if (x <= points[0][0]) return points[0][1]
  for (let i = 1; i < points.length; i++) {
    const [x0, y0] = points[i - 1]
    const [x1, y1] = points[i]
    if (x <= x1) return y0 + ((x - x0) / (x1 - x0)) * (y1 - y0)
  }
  return points.at(-1)[1]
}

export function simulerTest({ vo2max, sv1, sv2 }) {
  const quotient = [
    [0, 0.8],
    [sv1, 0.9],
    [sv2, 1.0],
    [1, 1.1],
    [1.3, 1.2],
  ]
  const fin = Math.round(puissancePour(vo2max) + 40)
  const points = []
  for (let p = PUISSANCE_DEBUT; p <= fin; p += PAS) {
    const demande = VO2_BASE + PENTE_VO2 * p
    const vo2 = plafonner(demande, vo2max)
    const qr = interpoler(quotient, demande / vo2max)
    points.push({ p, vo2, vco2: vo2 * qr, qr })
  }
  return {
    points,
    pSv1: puissancePour(sv1 * vo2max),
    pSv2: puissancePour(sv2 * vo2max),
    pMax: puissancePour(vo2max),
  }
}

// Échelles communes à tous les profils, pour voir les seuils se décaler
const TESTS = Object.fromEntries(Object.entries(PROFILS).map(([cle, profil]) => [cle, simulerTest(profil)]))
const X_MAX = Math.ceil(Math.max(...Object.values(TESTS).map((t) => t.points.at(-1).p)) / 50) * 50
const Y_MAX = Math.ceil(Math.max(...Object.values(TESTS).flatMap((t) => t.points.map((pt) => pt.vco2))))

const zone = (p, { pSv1, pSv2 }) =>
  p < pSv1 ? 'Zone 1 · endurance fondamentale' : p < pSv2 ? 'Zone 2 · seuil' : 'Zone 3 · haute intensité'

const nombre = (n, decimales = 2) => n.toLocaleString('fr-FR', { minimumFractionDigits: decimales, maximumFractionDigits: decimales })

function Valeurs({ point, vo2max, test }) {
  return (
    <>
      <strong>{point.p} W</strong>
      <span>
        <span className="pastille pastille-o2" /> VO₂ {nombre(point.vo2)} L/min
        <span className="muted"> · {nombre((point.vo2 * 1000) / POIDS_KG, 1)} ml/kg/min</span>
      </span>
      <span>
        <span className="pastille pastille-co2" /> VCO₂ {nombre(point.vco2)} L/min
      </span>
      <span className="muted">
        QR {nombre(point.qr)} · {Math.round((point.vo2 / vo2max) * 100)} % de la VO2max
      </span>
      <span>{zone(point.p, test)}</span>
    </>
  )
}

export default function CourbeVO2({ profil }) {
  const conteneur = useRef(null)
  const [largeur, setLargeur] = useState(640)
  const [survol, setSurvol] = useState(null)

  useEffect(() => {
    const observateur = new ResizeObserver(([entree]) => setLargeur(entree.contentRect.width))
    observateur.observe(conteneur.current)
    return () => observateur.disconnect()
  }, [])

  const test = TESTS[profil]
  const { vo2max } = PROFILS[profil]
  const etroit = largeur < 520
  const hauteur = etroit ? 300 : 380
  const marge = { haut: 28, droite: etroit ? 12 : 64, bas: 44, gauche: 40 }
  const l = Math.max(0, largeur - marge.gauche - marge.droite)
  const h = hauteur - marge.haut - marge.bas

  const x = (p) => marge.gauche + ((p - PUISSANCE_DEBUT) / (X_MAX - PUISSANCE_DEBUT)) * l
  const y = (v) => marge.haut + h - (v / Y_MAX) * h

  const tracer = (cle) => test.points.map((pt, i) => `${i ? 'L' : 'M'}${x(pt.p)},${y(pt[cle])}`).join('')

  const ticksX = useMemo(() => {
    const pas = etroit ? 100 : 50
    const ticks = []
    for (let p = Math.ceil(PUISSANCE_DEBUT / pas) * pas; p <= X_MAX; p += pas) ticks.push(p)
    return ticks
  }, [etroit])
  const ticksY = Array.from({ length: Y_MAX + 1 }, (_, i) => i)

  const handlePointer = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const p = PUISSANCE_DEBUT + ((e.clientX - rect.left - marge.gauche) / l) * (X_MAX - PUISSANCE_DEBUT)
    const index = Math.round((p - PUISSANCE_DEBUT) / PAS)
    setSurvol(index >= 0 && index < test.points.length ? index : null)
  }

  const point = survol != null ? test.points[survol] : null
  const dernier = test.points.at(-1)

  return (
    <div className="courbe" ref={conteneur}>
      <ul className="courbe-legende">
        <li>
          <span className="pastille pastille-o2" /> VO₂ (oxygène consommé)
        </li>
        <li>
          <span className="pastille pastille-co2" /> VCO₂ (gaz carbonique rejeté)
        </li>
      </ul>

      <svg
        width={largeur}
        height={hauteur}
        role="img"
        aria-label={`Courbes de VO2 et VCO2 en fonction de la puissance, profil ${PROFILS[profil].libelle}`}
        onPointerMove={handlePointer}
        onPointerDown={handlePointer}
        onPointerLeave={() => setSurvol(null)}
      >
        {/* Zone 2, entre les deux seuils */}
        <rect
          className="courbe-zone"
          x={x(test.pSv1)}
          y={marge.haut}
          width={x(test.pSv2) - x(test.pSv1)}
          height={h}
        />

        {[
          ['Zone 1', PUISSANCE_DEBUT, test.pSv1],
          ['Zone 2', test.pSv1, test.pSv2],
          ['Zone 3', test.pSv2, X_MAX],
        ].map(([nom, debut, fin]) => (
          <text key={nom} className="courbe-axe" x={(x(debut) + x(fin)) / 2} y={marge.haut + h - 8} textAnchor="middle">
            {etroit ? nom.replace('Zone ', 'Z') : nom}
          </text>
        ))}

        {ticksY.map((v) => (
          <g key={v}>
            <line className="courbe-grille" x1={marge.gauche} x2={marge.gauche + l} y1={y(v)} y2={y(v)} />
            <text className="courbe-axe" x={marge.gauche - 8} y={y(v)} dy="0.35em" textAnchor="end">
              {v}
            </text>
          </g>
        ))}
        <text className="courbe-axe" x={marge.gauche - 8} y={marge.haut - 14} textAnchor="end">
          L/min
        </text>
        {ticksX.map((p) => (
          <text key={p} className="courbe-axe" x={x(p)} y={marge.haut + h + 18} textAnchor="middle">
            {p}
          </text>
        ))}
        <text className="courbe-axe" x={marge.gauche + l} y={hauteur - 4} textAnchor="end">
          Puissance (W)
        </text>

        {/* Plateau de VO2max */}
        <line className="courbe-repere" x1={marge.gauche} x2={marge.gauche + l} y1={y(vo2max)} y2={y(vo2max)} />
        <text className="courbe-etiquette" x={marge.gauche + 6} y={y(vo2max) - 6}>
          VO2max {nombre(vo2max)} L/min
        </text>

        {/* Seuils ventilatoires */}
        {[
          ['SV1', test.pSv1],
          ['SV2', test.pSv2],
        ].map(([nom, p]) => (
          <g key={nom}>
            <line className="courbe-repere" x1={x(p)} x2={x(p)} y1={marge.haut} y2={marge.haut + h} />
            <text className="courbe-etiquette" x={x(p)} y={marge.haut - 8} textAnchor="middle">
              {nom}
            </text>
          </g>
        ))}

        <path className="courbe-ligne courbe-o2" d={tracer('vo2')} />
        <path className="courbe-ligne courbe-co2" d={tracer('vco2')} />

        {!etroit && (
          <>
            <text className="courbe-etiquette" x={x(dernier.p) + 6} y={y(dernier.vo2)} dy="0.35em">
              VO₂
            </text>
            <text className="courbe-etiquette" x={x(dernier.p) + 6} y={y(dernier.vco2)} dy="0.35em">
              VCO₂
            </text>
          </>
        )}

        {point && (
          <g>
            <line className="courbe-curseur" x1={x(point.p)} x2={x(point.p)} y1={marge.haut} y2={marge.haut + h} />
            <circle className="courbe-point courbe-point-o2" cx={x(point.p)} cy={y(point.vo2)} r="5" />
            <circle className="courbe-point courbe-point-co2" cx={x(point.p)} cy={y(point.vco2)} r="5" />
          </g>
        )}
      </svg>

      {etroit ? (
        // Sur mobile, les valeurs s'affichent sous le graphique pour ne pas déborder de l'écran
        <div className="courbe-infobulle courbe-infobulle-fixe" aria-live="polite">
          {point ? <Valeurs point={point} vo2max={vo2max} test={test} /> : <span className="muted">Touchez la courbe pour lire les valeurs</span>}
        </div>
      ) : (
        point && (
          <div
            className="courbe-infobulle"
            style={{
              top: marge.haut + 40,
              ...(x(point.p) > largeur / 2 ? { right: largeur - x(point.p) + 12 } : { left: x(point.p) + 12 }),
            }}
          >
            <Valeurs point={point} vo2max={vo2max} test={test} />
          </div>
        )
      )}
    </div>
  )
}
