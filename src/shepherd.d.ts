// Declaração de tipos mínima para o shepherd.js — o pacote não inclui um .d.ts
// próprio e não existe um pacote @types/shepherd.js. Isso cobre apenas a API
// que o FocusFrog usa (ver src/tutorial/); qualquer chamada além disso cai em `any`.
declare module 'shepherd.js' {
  namespace Shepherd {
    interface StepOptionsButton {
      text: string;
      action?: (...args: any[]) => void;
      secondary?: boolean;
      classes?: string;
      [key: string]: any;
    }

    interface StepOptions {
      id?: string;
      title?: string;
      text?: string;
      attachTo?: { element: string; on: string };
      buttons?: StepOptionsButton[];
      classes?: string;
      scrollTo?: boolean | { behavior?: string; block?: string };
      cancelIcon?: { enabled?: boolean };
      [key: string]: any;
    }

    interface Step {
      id: string;
      options: StepOptions;
      [key: string]: any;
    }

    interface TourOptions {
      useModalOverlay?: boolean;
      defaultStepOptions?: StepOptions;
      [key: string]: any;
    }

    class Tour {
      constructor(options?: TourOptions);
      addStep(step: StepOptions): Step;
      addSteps(steps: StepOptions[]): void;
      start(): void;
      next(): void;
      back(): void;
      cancel(): void;
      complete(): void;
      hide(): void;
      show(key?: string | number, forward?: boolean): void;
      getById(id: string): Step | undefined;
      getCurrentStep(): Step | undefined;
      on(event: string, handler: (...args: any[]) => void): void;
      off(event: string, handler?: (...args: any[]) => void): void;
      steps: Step[];
      [key: string]: any;
    }
  }

  class Shepherd {
    static Tour: typeof Shepherd.Tour;
  }
  export default Shepherd;
}

declare module 'shepherd.js/dist/css/shepherd.css';
