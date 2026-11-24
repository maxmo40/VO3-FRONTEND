// Variantes du protocole trail sur tapis incliné, calculées dans le navigateur à partir de la VMA.
// Même principe que le backend : chaque vitesse est exprimée en % de VMA « équivalent plat »
// grâce à l'équation métabolique de l'ACSM (coût = 0,2 × v + 0,9 × v × pente).

export const PENTE_MAX = 25
const DUREE_MAX_MIN = 40 // au-delà, le protocole n'est plus un test d'effort maximal

const propre = (n) => Math.round(n * 100) / 100 // évite les 4.6000000001
const arrondi = (n, pas = 0.1) => propre(Math.round(n / pas) * pas)

export const coutRelatif = (pentePct) => (0.2 + 0.9 * (pentePct / 100)) / 0.2

// Vitesse qui, sur cette pente, demande autant d'énergie que la VMA à plat
export const vmaEquivalente = (vma, pentePct) => vma / coutRelatif(pentePct)

// Rampe : un palier de départ, puis +increment km/h à chaque palier, jusqu'au premier palier
// au-dessus de la VMA équivalente (le test s'arrête à épuisement)
export function construireRampe(vma, { pente_pct, depart_kmh, duree_min, increment_kmh }) {
  const cout = coutRelatif(pente_pct)
  const paliers = []
  let vitesse = depart_kmh
  let temps = 0
  let tropLong = false

  for (;;) {
    paliers.push({
      numero: paliers.length + 1,
      debut_min: propre(temps),
      fin_min: propre(temps + duree_min),
      valeur: propre(vitesse),
      pct: Math.round(((vitesse * cout) / vma) * 100),
    })
    temps += duree_min
    if (paliers.at(-1).pct > 100) break
    if (temps >= DUREE_MAX_MIN) {
      tropLong = true
      break
    }
    vitesse += increment_kmh
  }

  return {
    unite: 'km/h',
    pente_pct,
    repere: {
      valeur: propre(arrondi(vmaEquivalente(vma, pente_pct))),
      libelle: pente_pct ? `VMA (équiv. à ${pente_pct} %)` : 'VMA',
    },
    depart: propre(depart_kmh),
    duree_depart_min: duree_min,
    sequence: [{ nb: null, duree_min, increment: propre(increment_kmh) }],
    duree_max_min: propre(temps),
    paliers,
    trop_long: tropLong,
  }
}

// Rampe adaptée à une pente forte : départ vers 55 % de la VMA équivalente (comme le protocole à 10 %),
// incrément choisi pour atteindre la VMA en une dizaine de minutes
export function rampeAdaptee(vma, pentePct) {
  const vmaEq = vmaEquivalente(vma, pentePct)
  const depart_kmh = Math.max(3, arrondi(vmaEq * 0.55, 0.5))
  const increment_kmh = Math.max(0.2, arrondi((vmaEq - depart_kmh) / 9))
  return { pente_pct: pentePct, depart_kmh, duree_min: 1, increment_kmh }
}

export const VARIANTES_TRAIL = [
  { cle: 'base', titre: 'Protocole proposé', pente_pct: 10 },
  { cle: 'bal', titre: 'Protocole Sentier BAL', pente_pct: 20 },
  { cle: 'breche', titre: 'Protocole BRECHE 🔥', pente_pct: 25 },
  { cle: 'perso', titre: 'Configuration personnalisée', pente_pct: null },
]
