// Silhouette stylisée des remparts et pitons du cirque de Mafate (décorative)
export default function Remparts({ className = '' }) {
  return (
    <svg className={`remparts ${className}`} viewBox="0 0 1440 120" preserveAspectRatio="none" aria-hidden="true">
      <path
        className="remparts-loin"
        d="M0 70 L60 52 L110 60 L170 28 L215 44 L260 20 L320 48 L380 36 L430 58 L500 30 L545 12 L590 40 L650 34 L700 56 L770 24 L820 38 L870 16 L930 46 L990 40 L1040 60 L1110 26 L1160 44 L1210 22 L1270 50 L1330 38 L1390 54 L1440 42 V120 H0 Z"
      />
      <path
        className="remparts-pres"
        d="M0 92 L50 80 L95 86 L150 58 L190 74 L235 64 L290 84 L345 70 L400 88 L455 62 L500 50 L540 72 L600 80 L655 66 L710 86 L765 60 L815 74 L860 56 L915 82 L975 72 L1030 90 L1085 68 L1135 54 L1180 76 L1240 84 L1300 64 L1350 80 L1400 72 L1440 82 V120 H0 Z"
      />
      <path className="remparts-sol" d="M0 108 Q360 96 720 106 T1440 102 V120 H0 Z" />
    </svg>
  )
}
