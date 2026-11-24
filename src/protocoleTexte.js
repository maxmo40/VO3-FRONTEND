// Description en toutes lettres d'un protocole de test (Mon espace et agenda du centre)

export const formatNombre = (n) => n.toLocaleString('fr-FR')
export const formatMinutes = (min) =>
  min < 1 ? `${Math.round(min * 60)} secondes` : min < 2 ? `${formatNombre(min)} minute` : `${formatNombre(min)} minutes`

// Ex. « départ à 8 km/h pendant 1 minute, puis +1 km/h pendant 2 minutes, puis +2 km/h toutes les 2 minutes
// (2 paliers), puis +0,5 km/h toutes les minutes »
export const decrireDeroulement = ({ unite, depart, duree_depart_min, sequence }) =>
  [
    `${unite === 'W' ? 'échauffement' : 'départ'} à ${formatNombre(depart)} ${unite} pendant ${formatMinutes(duree_depart_min)}`,
    ...sequence.map(({ nb, duree_min, increment }) => {
      const pas = `+${formatNombre(increment)} ${unite}`
      if (nb === 1) return `${pas} pendant ${formatMinutes(duree_min)}`
      const rythme = duree_min === 1 ? 'toutes les minutes' : `toutes les ${formatMinutes(duree_min)}`
      return nb ? `${pas} ${rythme} (${nb} paliers)` : `${pas} ${rythme}`
    }),
  ].join(', puis ')
