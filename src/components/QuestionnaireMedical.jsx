import { useEffect, useState } from 'react'
import { useAuth } from '../AuthContext.jsx'
import { api } from '../api.js'

// Les clés correspondent aux colonnes de la table questionnaire_medical
const FACTEURS_RISQUE = [
  { cle: 'hta', libelle: 'HTA' },
  { cle: 'diabete', libelle: 'Diabète' },
  { cle: 'hypercholesterolemie', libelle: 'Hypercholestérolémie' },
  { cle: 'tabagisme', libelle: 'Tabagisme' },
]

const SYMPTOMES = [
  { cle: 'douleur_thoracique', libelle: "Douleur thoracique à l'effort" },
  { cle: 'essoufflement', libelle: "Essoufflement à l'effort" },
  { cle: 'palpitations', libelle: 'Palpitations' },
  { cle: 'malaise', libelle: 'Malaise récent, avec ou sans perte de connaissance' },
]

const TEXTES = [
  { cle: 'antecedents_medicaux', libelle: 'Antécédents médicaux', exemple: 'Asthme ? Cardiopathie hypertrophique ?' },
  {
    cle: 'antecedents_chirurgicaux',
    libelle: 'Antécédents chirurgicaux',
    exemple: 'Chirurgie des ménisques ? Chirurgie des ligaments croisés ?',
  },
  {
    cle: 'antecedents_familiaux',
    libelle: 'Antécédents familiaux',
    exemple: 'Infarctus chez le père ou la mère ? Maladie cardiaque héréditaire connue ?',
  },
  { cle: 'traitements', libelle: 'Traitements en cours', exemple: '' },
]

const AGE_LIMITE = 35

const calculerAge = (dateNaissance) => {
  if (!dateNaissance) return ''
  const naissance = new Date(dateNaissance)
  const auj = new Date()
  let age = auj.getFullYear() - naissance.getFullYear()
  const anniversairePasse =
    auj.getMonth() > naissance.getMonth() ||
    (auj.getMonth() === naissance.getMonth() && auj.getDate() >= naissance.getDate())
  if (!anniversairePasse) age -= 1
  return String(age)
}

const REPONSES_VIDES = {
  suivi_cardio: null,
  ...Object.fromEntries([...FACTEURS_RISQUE, ...SYMPTOMES].map(({ cle }) => [cle, false])),
  ...Object.fromEntries(TEXTES.map(({ cle }) => [cle, ''])),
}

// Les valeurs null de la base deviennent des chaînes vides pour les champs du formulaire
const versFormulaire = (enregistre) =>
  Object.fromEntries(Object.entries(REPONSES_VIDES).map(([cle, vide]) => [cle, enregistre?.[cle] ?? vide]))

const formatDate = (iso) => new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })

export default function QuestionnaireMedical({ dateNaissance }) {
  const { withAuth } = useAuth()
  const [age, setAge] = useState(calculerAge(dateNaissance))
  const [reponses, setReponses] = useState(REPONSES_VIDES)
  const [enregistreLe, setEnregistreLe] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState(null)

  // Réponses déjà enregistrées ; l'âge reste calculé depuis « Mes informations » quand c'est possible
  useEffect(() => {
    withAuth(api.getQuestionnaire)
      .then((enregistre) => {
        if (!enregistre) return
        setReponses(versFormulaire(enregistre))
        setEnregistreLe(enregistre.updated_at)
        setAge((age) => age || String(enregistre.age))
      })
      .catch((err) => setMessage({ type: 'error', text: err.message }))
      .finally(() => setLoading(false))
  }, [])

  // Pré-remplissage à partir de « Mes informations », mis à jour si la date de naissance change
  useEffect(() => {
    if (dateNaissance) setAge(calculerAge(dateNaissance))
  }, [dateNaissance])

  const modifier = (cle, valeur) => {
    setReponses((r) => ({ ...r, [cle]: valeur }))
    setMessage(null)
  }

  const libellesCoches = (liste) => liste.filter(({ cle }) => reponses[cle]).map(({ libelle }) => libelle)
  const facteursPresents = libellesCoches(FACTEURS_RISQUE)
  const symptomesPresents = libellesCoches(SYMPTOMES)

  const raisons = [
    Number(age) > AGE_LIMITE && `âge supérieur à ${AGE_LIMITE} ans`,
    reponses.suivi_cardio === true && 'suivi cardiologique en cours',
    facteursPresents.length > 0 && `facteur de risque cardio-vasculaire (${facteursPresents.join(', ')})`,
    symptomesPresents.length > 0 && `symptôme à l'effort ou récent (${symptomesPresents.join(', ')})`,
  ].filter(Boolean)

  const complet = age !== '' && reponses.suivi_cardio !== null

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!complet) {
      setMessage({ type: 'error', text: "Renseigne ton âge et ton suivi cardiologique avant d'enregistrer." })
      return
    }
    setSaving(true)
    setMessage(null)
    try {
      const enregistre = await withAuth((token) => api.saveQuestionnaire(token, { ...reponses, age: Number(age) }))
      setReponses(versFormulaire(enregistre))
      setEnregistreLe(enregistre.updated_at)
      setMessage({ type: 'success', text: 'Questionnaire enregistré' })
    } catch (err) {
      setMessage({ type: 'error', text: err.message })
    } finally {
      setSaving(false)
    }
  }

  const casesACocher = (liste) =>
    liste.map(({ cle, libelle }) => (
      <label key={cle} className="case">
        <input type="checkbox" checked={reponses[cle]} onChange={(e) => modifier(cle, e.target.checked)} />
        {libelle}
      </label>
    ))

  return (
    <form className="card profil-form questionnaire" onSubmit={handleSubmit}>
      <h2>Questionnaire médical pré-test</h2>
      <p className="muted small performances-aide">
        Ce questionnaire permet de savoir si tu as besoin d'une consultation avec un cardiologue du
        sport avant l'épreuve.
        {enregistreLe && ` Dernière mise à jour le ${formatDate(enregistreLe)}.`}
      </p>

      <fieldset disabled={loading || saving}>
        <div className="form-grid">
          <label>
            Âge
            <input
              type="number"
              value={age}
              onChange={(e) => {
                setAge(e.target.value)
                setMessage(null)
              }}
              min="1"
              max="120"
              inputMode="numeric"
            />
            {!dateNaissance && (
              <span className="muted small questionnaire-note">
                Renseigne ta date de naissance dans « Mes informations » pour le pré-remplir.
              </span>
            )}
          </label>

          <div className="questionnaire-champ">
            <span className="questionnaire-question" id="q-suivi">
              As-tu déjà un suivi cardiologique ?
            </span>
            <div className="segmented" role="group" aria-labelledby="q-suivi">
              {[
                [true, 'Oui'],
                [false, 'Non'],
              ].map(([valeur, libelle]) => (
                <button
                  key={libelle}
                  type="button"
                  aria-pressed={reponses.suivi_cardio === valeur}
                  onClick={() => modifier('suivi_cardio', valeur)}
                >
                  {libelle}
                </button>
              ))}
            </div>
          </div>

          <fieldset className="form-grid-full questionnaire-cases">
            <legend className="questionnaire-question">
              Facteurs de risque cardio-vasculaire <span className="muted">(coche ceux qui sont présents)</span>
            </legend>
            {casesACocher(FACTEURS_RISQUE)}
          </fieldset>

          {TEXTES.map(({ cle, libelle, exemple }) => (
            <label key={cle} className="form-grid-full">
              {libelle}
              <textarea
                value={reponses[cle]}
                onChange={(e) => modifier(cle, e.target.value)}
                rows={2}
                maxLength={1000}
                placeholder={exemple}
              />
            </label>
          ))}

          <fieldset className="form-grid-full questionnaire-cases">
            <legend className="questionnaire-question">
              Te plains-tu d'un des symptômes suivants en ce moment ?
            </legend>
            {casesACocher(SYMPTOMES)}
          </fieldset>
        </div>
      </fieldset>

      {raisons.length > 0 ? (
        <div className="questionnaire-resultat alerte" role="status">
          <strong>Consultation avec un cardiologue du sport recommandée avant l'épreuve.</strong>
          <p>Motif : {raisons.join(' ; ')}.</p>
        </div>
      ) : (
        complet && (
          <div className="questionnaire-resultat ok" role="status">
            <strong>D'après tes réponses, pas de consultation cardiologique nécessaire avant l'épreuve.</strong>
            <p>Si ta situation change d'ici le test (nouveau symptôme, nouveau traitement), mets à jour le questionnaire.</p>
          </div>
        )
      )}

      <div className="form-actions">
        <button className="btn btn-primary" disabled={loading || saving}>
          {saving ? 'Enregistrement…' : 'Enregistrer'}
        </button>
        {message && <p className={`form-${message.type}`}>{message.text}</p>}
      </div>
    </form>
  )
}
