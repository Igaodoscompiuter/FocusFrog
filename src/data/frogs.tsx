// @ts-nocheck
// Recuperado do build 2.4.9 (tipagem e nomes locais ainda por revisar).


export const k3 = ["legendary", "epic", "rare", "common"];

export const ld = {
  common: {
    label: "Comum",
    color: "#8BC34A",
    rank: 3
  },
  rare: {
    label: "Rara",
    color: "#4FC3F7",
    rank: 2
  },
  epic: {
    label: "Épica",
    color: "#C084FC",
    rank: 1
  },
  legendary: {
    label: "Lendária",
    color: "#FBBF24",
    rank: 0
  }
};

export const Kr = [{
  id: "mata",
  label: "Mata",
  emoji: "🌿"
}, {
  id: "riacho",
  label: "Riacho",
  emoji: "💧"
}, {
  id: "jardim",
  label: "Jardim",
  emoji: "🌸"
}, {
  id: "noite",
  label: "Noite",
  emoji: "🌙",
  night: true
}, {
  id: "cosmos",
  label: "Cosmos",
  emoji: "✨",
  night: true
}];

export const cd = {
  equilibrado: {
    label: "Equilibrado",
    hint: "pula num ritmo calmo e constante"
  },
  agitado: {
    label: "Agitado",
    hint: "pula sem parar, sempre por perto"
  },
  explorador: {
    label: "Explorador",
    hint: "cruza a lagoa de ponta a ponta"
  },
  timido: {
    label: "Tímido",
    hint: "quase não sai da folha dele"
  },
  zen: {
    label: "Zen",
    hint: "medita e quase não se mexe"
  },
  cosmico: {
    label: "Cósmico",
    hint: "fica parado e de repente dá um salto enorme"
  },
  dorminhoco: {
    label: "Dorminhoco",
    hint: "cochila na folha a maior parte do tempo"
  },
  nadador: {
    label: "Nadador",
    hint: "adora dar mergulhos entre as folhas"
  },
  cantor: {
    label: "Cantor",
    hint: "coaxa mais que todo mundo"
  },
  cacador: {
    label: "Caçador",
    hint: "rápido no pulo, de olho nos vagalumes"
  }
};

const S3 = (e, t) => {
  const n = parseInt(e.slice(1), 16),
    s = l => Math.round(l + (255 - l) * t),
    r = s(n >> 16 & 255),
    o = s(n >> 8 & 255),
    a = s(n & 255);
  return "#" + (1 << 24 | r << 16 | o << 8 | a).toString(16).slice(1);
};

const j3 = [["JUNGLE", "Sapo da Selva", "common", "mata", "equilibrado", ["#2E7D32", "#AED581", "#FFF176"], "plain", [6, 7, 6], "O pilar da lagoa: nem rápido, nem lento. Pula no próprio ritmo e deixa todo mundo mais tranquilo."], ["MUSGO", "Sapo Musgo", "common", "mata", "dorminhoco", ["#556B2F", "#9CB86B", "#C5E1A5"], "spots", [3, 8, 5], "Passa tanto tempo parado que já nasceu musgo nas costas. Acordar? Só se for importante."], ["FOLHA_SECA", "Sapo Folha-seca", "common", "mata", "timido", ["#A1662F", "#E0B07A", "#5D3A1A"], "stripes", [5, 9, 4], "Se esconde no outono do chão da mata. Você só percebe que ele estava ali quando ele pula."], ["COGUMELO", "Sapo Cogumelo", "rare", "mata", "cantor", ["#C62828", "#FFEBEE", "#FFFFFF"], "dots", [4, 6, 9], "Nasceu depois de uma noite de chuva, igual cogumelo. Coaxa alto pra todo mundo saber."], ["CIPO", "Sapo Cipó", "rare", "mata", "cacador", ["#33691E", "#DCE775", "#827717"], "stripes", [9, 7, 5], "Língua ligeira como um cipó que estica. Vagalume distraído vira lanche."], ["GUARDIAO", "Guardião da Mata", "legendary", "mata", "zen", ["#1B5E20", "#81C784", "#FFD54F"], "spots", [7, 10, 10], "Dizem que cuida da lagoa desde antes de existir água nela. Aparece pra quem volta todo dia.", "glow"], ["OCEAN", "Sapo Oceânico", "common", "riacho", "explorador", ["#0288D1", "#B3E5FC", "#00BFA5"], "plain", [7, 5, 6], "Quer conhecer cada centímetro da lagoa e cruza de uma margem à outra sem cansar."], ["SEIXO", "Sapo Seixo", "common", "riacho", "zen", ["#78909C", "#CFD8DC", "#455A64"], "speckles", [3, 9, 5], "Parece uma pedra de rio. Fica tão quieto que os peixes passam por cima dele."], ["GOTA", "Sapo Gota", "common", "riacho", "nadador", ["#4FC3F7", "#E1F5FE", "#0277BD"], "plain", [8, 6, 7], "Mergulha, some, aparece do outro lado. Mais tempo na água do que em cima da folha."], ["VITORIA_REGIA", "Sapo Vitória-régia", "rare", "riacho", "equilibrado", ["#43A047", "#F8BBD0", "#EC407A"], "stripes", [5, 8, 8], "Usa folha gigante como trono. Elegante, educado e sempre com uma flor por perto."], ["CORAL", "Sapo Coral", "rare", "riacho", "nadador", ["#FF7043", "#FFE0B2", "#00897B"], "stripes", [8, 5, 8], "Listrado de cor quente, nada como peixe-palhaço. Os kois acham que ele é da turma."], ["CRISTAL", "Sapo Cristal", "epic", "riacho", "timido", ["#B2EBF2", "#FFFFFF", "#4DD0E1"], "plain", [4, 10, 9], "Transparente como água de nascente. Quando o sol bate, a lagoa inteira brilha.", "crystal"], ["SUNNY", "Sapo Solar", "common", "jardim", "agitado", ["#FFC107", "#FFF9C4", "#FF6F00"], "plain", [8, 4, 7], "Energia de meio-dia: pulos curtos e rápidos, como se dançasse no mesmo lugar."], ["MEL", "Sapo Mel", "common", "jardim", "dorminhoco", ["#F9A825", "#FFF59D", "#8D6E63"], "speckles", [3, 5, 8], "Doce e preguiçoso. Cochila no sol da tarde e acorda com cheiro de flor."], ["MENTA", "Sapo Menta", "common", "jardim", "agitado", ["#26A69A", "#B2DFDB", "#E0F2F1"], "dots", [8, 6, 6], "Fresco e elétrico. Não para quieto um segundo, mas nunca vai longe."], ["STRAWBERRY", "Sapo Morango", "rare", "jardim", "timido", ["#E91E63", "#F8BBD0", "#4CAF50"], "dots", [4, 8, 8], "Tímido e hesitante. Prefere ficar na folha dele, com as pintas à mostra."], ["IPE", "Sapo Ipê", "rare", "jardim", "cantor", ["#EC407A", "#FFF176", "#AD1457"], "spots", [6, 5, 9], "Florido como ipê em agosto. Canta pra avisar que chegou a estação dele."], ["ARCO_IRIS", "Sapo Arco-íris", "legendary", "jardim", "agitado", ["#7E57C2", "#FFFFFF", "#FF4081"], "plain", [9, 3, 10], "Só aparece depois de muita constância, igual arco-íris depois da chuva. Muda de cor sem parar.", "rainbow"], ["SERENO", "Sapo Sereno", "common", "noite", "cantor", ["#3949AB", "#9FA8DA", "#C5CAE9"], "speckles", [6, 7, 6], "Sai quando a lagoa esfria. Canta baixo a mesma música toda noite."], ["SONECA", "Sapo Soneca", "common", "noite", "dorminhoco", ["#5C6BC0", "#D1C4E9", "#FFE082"], "plain", [2, 7, 9], "Acorda à noite… e dorme de novo. Mestre na arte de descansar sem culpa."], ["VAGALUME", "Sapo Vagalume", "rare", "noite", "cacador", ["#2E3B55", "#FFF59D", "#FFEB3B"], "dots", [8, 6, 8], "Caça vagalume e acabou pegando o brilho deles. À noite, acende.", "glow"], ["NEBLINA", "Sapo Neblina", "rare", "noite", "timido", ["#90A4AE", "#ECEFF1", "#B0BEC5"], "speckles", [5, 9, 6], "Some na névoa da madrugada. Quando você olha de novo, já mudou de folha."], ["GHOST", "Sapo Fantasma", "epic", "noite", "zen", ["#E0E0E0", "#F5F5F5", "#BDBDBD"], "plain", [2, 10, 9], "Mestre da quietude. Some e reaparece devagar, como um sussurro na água.", "ghost"], ["LUA", "Sapo Lua Cheia", "epic", "noite", "cosmico", ["#ECEFF1", "#FFFDE7", "#FFD54F"], "spots", [7, 6, 10], "Tem crateras nas costas e brilha prateado. Dizem que puxa a maré da lagoa.", "glow"], ["METEORO", "Sapo Meteoro", "common", "cosmos", "explorador", ["#6D4C41", "#BCAAA4", "#FF7043"], "speckles", [9, 5, 5], "Caiu do céu numa noite de chuva de estrelas e nunca mais parou de correr."], ["NEBULOSA", "Sapo Nebulosa", "rare", "cosmos", "zen", ["#6A1B9A", "#F48FB1", "#E1BEE7"], "dots", [4, 7, 9], "Um pedaço de nuvem colorida do espaço. Medita olhando pras estrelas."], ["GALAXY", "Sapo Galáxia", "epic", "cosmos", "cosmico", ["#191970", "#483D8B", "#E6E6FA"], "plain", [9, 6, 10], "Fica imóvel absorvendo o cosmos e, de repente, cruza a lagoa como um cometa.", "stars"], ["COMETA", "Sapo Cometa", "epic", "cosmos", "explorador", ["#0D47A1", "#90CAF9", "#FFFFFF"], "stripes", [10, 4, 9], "Deixa um rastro brilhante por onde pula. Nunca está no mesmo lugar duas vezes.", "stars"], ["AURORA", "Sapo Aurora", "epic", "cosmos", "nadador", ["#00897B", "#B388FF", "#69F0AE"], "stripes", [8, 6, 10], "Tem a cor da aurora boreal. Mergulha e a água fica verde e roxa por um instante.", "rainbow"], ["ECLIPSE", "Sapo Eclipse", "legendary", "cosmos", "cosmico", ["#212121", "#FFB300", "#FFE082"], "plain", [10, 8, 10], "Raro como um eclipse: aparece pra quem foca de verdade. Quando pula, o céu escurece.", "stars"]];

export const FROG_SPECIES = Object.fromEntries(j3.map(([e, t, n, s, r, [o, a, l], c, [u, d, f], h, m]) => [e, {
  id: e,
  name: t,
  rarity: n,
  habitat: s,
  trait: r,
  pattern: c,
  special: m,
  lore: h,
  stages: {
    tadpole: {
      shape: "circle",
      colors: {
        primary: S3(o, 0.35),
        secondary: o,
        accent: l
      }
    },
    adult: {
      shape: "frog",
      colors: {
        primary: o,
        secondary: a,
        accent: l
      }
    }
  },
  stats: {
    agilidade: u,
    camuflagem: d,
    charme: f
  }
}]));

export const q2 = (e, t) => ld[e.rarity].rank - ld[t.rarity].rank || e.name.localeCompare(t.name);

export const FROG_PATTERNS = {
  plain: {},
  spots: {
    dots: [[-14, -9, 5], [10, -12, 4], [16, 3, 4.5], [-18, 6, 3.5], [2, -2, 3]]
  },
  dots: {
    dots: [[-16, -8, 2.2], [-6, -14, 2], [6, -13, 2.2], [15, -6, 2], [-20, 4, 1.8], [19, 6, 1.8], [-10, 2, 1.6], [10, 0, 1.6], [0, -6, 1.8]]
  },
  speckles: {
    dots: [[-17, -6, 1.2], [-9, -13, 1], [-3, -8, 1.1], [5, -15, 1], [12, -9, 1.2], [18, -2, 1], [-21, 3, 1], [14, 5, 1.1], [-12, 6, 1], [3, -1, 0.9], [8, -4, 1]]
  },
  stripes: {
    stripes: [[-24, -6, -12, -16, 0, -18], [-22, 4, -6, -6, 12, -12], [-12, 10, 6, 2, 22, -4]]
  }
};
