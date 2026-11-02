import { useEffect, useRef, useState } from 'react'
import { formatVitesse } from '../format.js'

// Vitesse du tapis au fil du test : une marche d'escalier par palier (paliers de durées variables)
export default function GraphiqueProtocole({ protocole }) {
  const conteneur = useRef(null)
  const [largeur, setLargeur] = useState(640)
  const [survol, setSurvol] = useState(null)

  useEffect(() => {
    const observateur = new ResizeObserver(([entree]) => setLargeur(entree.contentRect.width))
    observateur.observe(conteneur.current)
    return () => observateur.disconnect()
  }, [])

  const { paliers, duree_max_min: dureeMax, vitesse_vma_kmh: vitesseVma, pente_pct: pente } = protocole
  const etroit = largeur < 520
  const hauteur = etroit ? 240 : 300
  const marge = { haut: 32, droite: 16, bas: 44, gauche: 44 }
  const l = Math.max(0, largeur - marge.gauche - marge.droite)
  const h = hauteur - marge.haut - marge.bas

  // Axe des vitesses resserré autour du test pour que les marches restent lisibles
  const vMin = Math.max(0, Math.floor(paliers[0].vitesse_kmh) - 2)
  const vMax = Math.ceil(Math.max(paliers.at(-1).vitesse_kmh, vitesseVma)) + 1
  const x = (min) => marge.gauche + (min / dureeMax) * l
  const y = (v) => marge.haut + h - ((v - vMin) / (vMax - vMin)) * h

  const escalier = paliers
    .map((p, i) => `${i ? 'V' : `M${x(p.debut_min)},`}${y(p.vitesse_kmh)}H${x(p.fin_min)}`)
    .join('')
  const aire = `${escalier}V${y(vMin)}H${x(0)}Z`

  const pasTemps = dureeMax > 12 || etroit ? 2 : 1
  const ticksX = Array.from({ length: Math.floor(dureeMax / pasTemps) + 1 }, (_, i) => i * pasTemps)
  const pasVitesse = vMax - vMin > 8 ? 2 : 1
  const ticksY = []
  for (let v = Math.ceil(vMin / pasVitesse) * pasVitesse; v <= vMax; v += pasVitesse) ticksY.push(v)

  const handlePointer = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const minute = ((e.clientX - rect.left - marge.gauche) / l) * dureeMax
    const index = paliers.findIndex((p) => minute >= p.debut_min && minute < p.fin_min)
    setSurvol(index >= 0 ? index : null)
  }

  const palier = survol != null ? paliers[survol] : null
  const infos = palier && (
    <>
      <strong>
        Palier {palier.numero} · {palier.debut_min}–{palier.fin_min} min
      </strong>
      <span>
        {formatVitesse(palier.vitesse_kmh)}
        {pente ? ` à ${pente} % de pente` : ''}
      </span>
      <span className="muted">
        {palier.pct_vma} % de la VMA{pente ? ' (équivalent plat)' : ''}
      </span>
    </>
  )

  return (
    <div className="courbe graphique-protocole" ref={conteneur}>
      <svg
        width={largeur}
        height={hauteur}
        role="img"
        aria-label={`Vitesse du tapis de ${formatVitesse(paliers[0].vitesse_kmh)} à ${formatVitesse(
          paliers.at(-1).vitesse_kmh
        )}, en ${paliers.length} paliers sur ${dureeMax} minutes`}
        onPointerMove={handlePointer}
        onPointerDown={handlePointer}
        onPointerLeave={() => setSurvol(null)}
      >
        {ticksY.map((v) => (
          <g key={v}>
            <line className="courbe-grille" x1={marge.gauche} x2={marge.gauche + l} y1={y(v)} y2={y(v)} />
            <text className="courbe-axe" x={marge.gauche - 8} y={y(v)} dy="0.35em" textAnchor="end">
              {v}
            </text>
          </g>
        ))}
        <text className="courbe-axe" x={marge.gauche - 8} y={marge.haut - 18} textAnchor="end">
          km/h
        </text>
        {ticksX.map((m) => (
          <text key={m} className="courbe-axe" x={x(m)} y={marge.haut + h + 18} textAnchor="middle">
            {m}
          </text>
        ))}
        <text className="courbe-axe" x={marge.gauche + l} y={hauteur - 4} textAnchor="end">
          Temps (min)
        </text>

        <path className="escalier-aire" d={aire} />

        {/* Repère : vitesse correspondant à la VMA (équivalent plat en pente) */}
        <line className="courbe-repere" x1={marge.gauche} x2={marge.gauche + l} y1={y(vitesseVma)} y2={y(vitesseVma)} />
        <text className="courbe-etiquette" x={marge.gauche + 6} y={y(vitesseVma) - 6}>
          VMA{pente ? ` (équiv. à ${pente} %)` : ''} · {formatVitesse(vitesseVma)}
        </text>

        {palier && (
          <rect
            className="escalier-survol"
            x={x(palier.debut_min)}
            y={y(palier.vitesse_kmh)}
            width={x(palier.fin_min) - x(palier.debut_min)}
            height={y(vMin) - y(palier.vitesse_kmh)}
          />
        )}
        <path className="escalier-ligne" d={escalier} />
      </svg>

      {etroit ? (
        <div className="courbe-infobulle courbe-infobulle-fixe" aria-live="polite">
          {infos ?? <span className="muted">Touchez un palier pour lire sa vitesse</span>}
        </div>
      ) : (
        palier && (
          <div
            className="courbe-infobulle"
            style={{
              top: Math.max(0, y(palier.vitesse_kmh) - 90),
              ...(x(palier.fin_min) > largeur / 2
                ? { right: largeur - x(palier.debut_min) + 8 }
                : { left: x(palier.fin_min) + 8 }),
            }}
          >
            {infos}
          </div>
        )
      )}
    </div>
  )
}
