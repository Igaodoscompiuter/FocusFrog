// @ts-nocheck
// Recuperado do build 2.4.9 (tipagem e nomes locais ainda por revisar).
import * as jsxRuntime from "react/jsx-runtime";
import { FROG_PATTERNS, FROG_SPECIES } from "../../data/frogs";
import { Td } from "../dashboard/RoutineSuggestion";

export const Dj = ({ id: e }) => {
  switch (e) {
    case "acc_leaf":
      return (
        <g>
          <path
            d="M50,34 Q41,22 50,14 Q59,22 50,34Z"
            fill="#4ADE80"
            stroke="#166534"
            strokeWidth="1.2"
          />
          <path d="M50,32 L50,19" stroke="#166534" strokeWidth="1" />
        </g>
      );
    case "acc_bowtie":
      return (
        <g>
          <path
            d="M50,76 L40,71 L40,81Z M50,76 L60,71 L60,81Z"
            fill="#DC2626"
          />
          <circle cx="50" cy="76" r="2.6" fill="#991B1B" />
        </g>
      );
    case "acc_glasses":
      return (
        <g>
          <rect x="29" y="40" width="20" height="11" rx="5" fill="#111827" />
          <rect x="51" y="40" width="20" height="11" rx="5" fill="#111827" />
          <path d="M49,44 L51,44" stroke="#111827" strokeWidth="2" />
          <path
            d="M32,43 L38,43"
            stroke="#ffffff"
            strokeOpacity=".35"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </g>
      );
    case "acc_headphones":
      return (
        <g>
          <path
            d="M25,50 Q25,22 50,22 Q75,22 75,50"
            fill="none"
            stroke="#1F2937"
            strokeWidth="3.4"
          />
          <rect x="19" y="44" width="9" height="15" rx="4" fill="#3B82F6" />
          <rect x="72" y="44" width="9" height="15" rx="4" fill="#3B82F6" />
        </g>
      );
    case "acc_crown":
      return (
        <g>
          <path
            d="M37,33 L39,20 L45,27 L50,17 L55,27 L61,20 L63,33Z"
            fill="#FBBF24"
            stroke="#B45309"
            strokeWidth="1.2"
          />
          <circle cx="50" cy="28" r="1.8" fill="#DC2626" />
        </g>
      );
    default:
      return null;
  }
};

export const MascotArt = ({
  speciesId: e,
  accessory: t = "acc_none",
  scene: n = "scene_pond",
  size: s = 120,
}) => {
  const r = FROG_SPECIES[e || ""] || FROG_SPECIES.JUNGLE,
    o = r.stages.adult.colors,
    a = FROG_PATTERNS[r.pattern] || {};
  return (
    <div
      style={{
        width: s,
        height: s,
        flexShrink: 0,
        borderRadius: 18,
        background: Td[n] || Td.scene_pond,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {n === "scene_night" && (
        <svg
          viewBox="0 0 100 100"
          style={{
            position: "absolute",
            inset: 0,
          }}
          aria-hidden="true"
        >
          {[
            [12, 14],
            [30, 8],
            [70, 12],
            [88, 22],
            [80, 6],
            [18, 30],
          ].map(([l, c], u) => (
            <circle
              key={u}
              cx={l}
              cy={c}
              r={u % 2 ? 0.8 : 1.2}
              fill="#fff"
              opacity=".8"
            />
          ))}
        </svg>
      )}
      <svg
        viewBox="0 0 100 100"
        width={s * 0.9}
        height={s * 0.9}
        aria-hidden="true"
      >
        <ellipse cx="50" cy="88" rx="42" ry="10" fill="#2F8F5B" />
        <ellipse cx="50" cy="87" rx="38" ry="8" fill="#3AA568" />
        {n === "scene_lotus" && (
          <g transform="translate(80,84)">
            {[-40, 0, 40].map((l) => (
              <ellipse
                key={l}
                cx="0"
                cy="-5"
                rx="3.4"
                ry="7"
                fill="#F9A8D4"
                transform={`rotate(${l})`}
              />
            ))}
            <circle cx="0" cy="-1" r="2" fill="#FDE68A" />
          </g>
        )}
        <ellipse
          cx="28"
          cy="75"
          rx="12"
          ry="10"
          fill={o.primary}
          stroke="rgba(0,0,0,.25)"
          strokeWidth="1.5"
        />
        <ellipse
          cx="72"
          cy="75"
          rx="12"
          ry="10"
          fill={o.primary}
          stroke="rgba(0,0,0,.25)"
          strokeWidth="1.5"
        />
        <ellipse cx="50" cy="60" rx="30" ry="25" fill={o.primary} />
        {(a.dots || []).map(([l, c, u], d) => (
          <circle
            key={d}
            cx={50 + l}
            cy={60 + c}
            r={u}
            fill={r.pattern === "speckles" ? "#000" : o.accent}
            opacity={r.pattern === "speckles" ? 0.35 : 0.6}
          />
        ))}
        {(a.stripes || []).map(([l, c, u, d, f, h], m) => (
          <path
            key={m}
            d={`M${50 + l},${60 + c} Q${50 + u},${60 + d} ${50 + f},${60 + h}`}
            stroke={o.accent}
            strokeOpacity={0.55}
            strokeWidth={3.2}
            strokeLinecap="round"
            fill="none"
          />
        ))}
        <ellipse
          cx="50"
          cy="65"
          rx="20"
          ry="18"
          fill={o.secondary}
          opacity=".8"
        />
        <ellipse
          cx="38"
          cy="80"
          rx="8"
          ry="6"
          fill={o.primary}
          stroke="rgba(0,0,0,.25)"
          strokeWidth="1.5"
        />
        <ellipse
          cx="62"
          cy="80"
          rx="8"
          ry="6"
          fill={o.primary}
          stroke="rgba(0,0,0,.25)"
          strokeWidth="1.5"
        />
        <circle cx="40" cy="45" r="10" fill="#fff" />
        <circle cx="40" cy="45" r="5" fill="#000" />
        <circle cx="60" cy="45" r="10" fill="#fff" />
        <circle cx="60" cy="45" r="5" fill="#000" />
        <path
          d="M45,68 Q50,72 55,68"
          fill="none"
          stroke={o.secondary}
          strokeWidth="2"
          strokeLinecap="round"
        />
        <Dj id={t} />
      </svg>
    </div>
  );
};
