/**
 * src/config/frogLore.ts
 * 
 * Contém a "lore" e os detalhes de personalidade para cada espécie de sapo.
 * Essas informações serão exibidas na tela de coleção.
 */

interface FrogLore {
  title: string;      // O título da personalidade (ex: "Personalidade: Agitado")
  description: string; // O texto descritivo (lore)
}

export const frogLore: Record<string, FrogLore> = {
  SUNNY: {
    title: "Personalidade: Agitado",
    description: "Repleto de uma energia incessante, o Sapo Solar está sempre em movimento. Seus saltos são curtos e rápidos, como se estivesse dançando sobre a água sob o sol do meio-dia. Ele raramente se afasta muito do mesmo lugar."
  },
  OCEAN: {
    title: "Personalidade: Explorador",
    description: "Com um espírito aventureiro, o Sapo Oceânico anseia por conhecer cada centímetro do lago. Ele é um viajante incansável, dando longos e graciosos saltos para cruzar o laguinho de uma margem à outra sem parar."
  },
  JUNGLE: {
    title: "Personalidade: Equilibrado",
    description: "Representando o equilíbrio natural, o Sapo da Selva se move com um ritmo calmo e constante. Seus pulos de distância média são a personificação do comportamento padrão dos sapos, tornando-o um pilar de normalidade no laguinho."
  },
  STRAWBERRY: {
    title: "Personalidade: Tímido",
    description: "Tímido e hesitante, o Sapo Morango parece quase ter medo da própria água. Seus movimentos são raros e, quando acontecem, são apenas pequenos saltos, quase imperceptíveis, como se ele quisesse se esconder no lugar onde está."
  },
  GHOST: {
    title: "Personalidade: Zen",
    description: "Este sapo é um mestre da quietude. Passando a maior parte do tempo em meditação profunda, o Sapo Fantasma se move tão raramente que vê-lo pular é um evento. Seus movimentos são sutis, quase como um sussurro na água."
  },
  GALAXY: {
    title: "Personalidade: Cósmico",
    description: "O Sapo Galáxia parece contemplar os mistérios do universo. Ele permanece imóvel por longos períodos, absorvendo a energia do cosmos, e então, subitamente, realiza um salto majestoso e épico, cruzando o lago como um cometa."
  },
  DEFAULT: {
    title: "Personalidade: Amigável",
    description: "Um sapinho amigável e curioso, com um comportamento perfeitamente equilibrado. Nem muito rápido, nem muito lento, ele aproveita o dia em seu próprio ritmo."
  },
};
