
const CACHE_NAME = 'focusfrog-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/App.css',
  '/index.tsx',
  '/screens/MoodboardScreen.css',
  '/screens/wireframes/wireframes.css'
];

// --- Pomodoro State (Single Source of Truth) ---
let timerId = null;
let focusDuration = 25 * 60; // Default 25 min, mutable via message
let timeRemaining = focusDuration;
let timerMode = 'focus'; // 'focus', 'shortBreak', 'longBreak'
let status = 'idle'; // 'idle', 'running', 'paused'
let pomodorosInCycle = 0; // 0 to 4
let expectedEndTime = null; // timestamp logic to prevent freezing

const BREAK_DURATIONS = { 
    shortBreak: 5 * 60, 
    longBreak: 15 * 60 
};

// Quantos Pomodoros antes da pausa longa? (Padrão: 4)
const POMODOROS_PER_CYCLE = 4;

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

// --- Logic ---

function broadcastStateUpdate() {
  self.clients.matchAll({
    includeUncontrolled: true,
    type: 'window',
  }).then(clients => {
    if (clients && clients.length) {
      clients.forEach(client => {
        client.postMessage({
          type: 'TIMER_STATE',
          timeRemaining,
          timerMode,
          status,
          pomodorosInCycle,
          focusDuration // Send back current config
        });
      });
    }
  });
}

function showNotification(title, options) {
  if (Notification.permission === 'granted') {
    self.registration.showNotification(title, options);
  }
}

function handleCycleEnd() {
    if (timerId) clearInterval(timerId);
    timerId = null;
    status = 'idle';
    expectedEndTime = null;

    let nextMode = 'focus';
    let nextDuration = focusDuration;
    
    // Lógica Estrita do Pomodoro
    if (timerMode === 'focus') {
        // Terminou um foco. Incrementa o ciclo.
        pomodorosInCycle = pomodorosInCycle + 1;
        
        if (pomodorosInCycle >= POMODOROS_PER_CYCLE) {
            // Completou 4 focos -> Pausa Longa
            nextMode = 'longBreak';
            nextDuration = BREAK_DURATIONS.longBreak;
            showNotification('Ciclo Completo! 🎉', { 
                body: 'Você completou 4 sessões. Hora de uma Pausa Longa merecida (15min).',
                icon: '/icon-192.png'
            });
        } else {
            // Menos de 4 focos -> Pausa Curta
            nextMode = 'shortBreak';
            nextDuration = BREAK_DURATIONS.shortBreak;
            showNotification('Sessão de Foco concluída!', { 
                body: 'Respire fundo. Hora de uma pausa curta (5min).',
                icon: '/icon-192.png'
            });
        }
    } else if (timerMode === 'shortBreak') {
        // Terminou pausa curta -> Volta pro Foco
        nextMode = 'focus';
        nextDuration = focusDuration;
        showNotification('Pausa finalizada!', { 
            body: 'Pronto para voltar ao foco?',
            icon: '/icon-192.png'
        });
    } else if (timerMode === 'longBreak') {
        // Terminou pausa longa -> Reseta o ciclo e volta pro Foco
        nextMode = 'focus';
        nextDuration = focusDuration;
        pomodorosInCycle = 0; // Reseta o contador de ciclo
        showNotification('Baterias recarregadas?', { 
            body: 'Ciclo reiniciado. Vamos começar uma nova sequência!',
            icon: '/icon-192.png'
        });
    }
    
    timerMode = nextMode;
    timeRemaining = nextDuration;
    
    // Notifica a UI que o ciclo acabou (para tocar sons, etc)
    self.clients.matchAll({
      includeUncontrolled: true,
      type: 'window',
    }).then(clients => {
      if (clients && clients.length) {
        clients.forEach(client => client.postMessage({ type: 'CYCLE_END', nextMode, pomodorosInCycle }));
      }
    });
    
    broadcastStateUpdate();
}

function startTimer() {
  if (timerId) clearInterval(timerId);
  status = 'running';
  
  // Lógica de Timestamp para evitar travamento em background:
  // Calculamos QUANDO o timer deve acabar, em vez de confiar no setInterval
  if (!expectedEndTime) {
      expectedEndTime = Date.now() + (timeRemaining * 1000);
  } else {
      // Se já existia um target (resume), ajustamos caso haja drift,
      // mas mantemos a consistência.
      const now = Date.now();
      const currentDiff = Math.ceil((expectedEndTime - now) / 1000);
      
      // Se o diff for muito diferente do timeRemaining (ex: bug), resincroniza
      if (Math.abs(currentDiff - timeRemaining) > 2) {
         expectedEndTime = Date.now() + (timeRemaining * 1000);
      }
  }
  
  broadcastStateUpdate(); 
  
  timerId = setInterval(() => {
    const now = Date.now();
    // O tempo restante é: (HoraAlvo - HoraAtual)
    const left = Math.ceil((expectedEndTime - now) / 1000);
    
    if (left <= 0) {
      timeRemaining = 0;
      handleCycleEnd();
    } else {
      timeRemaining = left;
      // Opcional: Não fazer broadcast todo segundo se quiser economizar performance,
      // mas para UI responsiva, a cada segundo é ok.
      broadcastStateUpdate();
    }
  }, 1000);
}

// --- Event Listener for UI Commands ---

self.addEventListener('message', (event) => {
  const { type, payload } = event.data;

  switch (type) {
    case 'START_TIMER':
      if (status === 'idle') {
        // Início limpo
        // Ensure we respect current mode durations
        if (timerMode === 'focus') timeRemaining = focusDuration;
        else if (timerMode === 'shortBreak') timeRemaining = BREAK_DURATIONS.shortBreak;
        else if (timerMode === 'longBreak') timeRemaining = BREAK_DURATIONS.longBreak;
        
        expectedEndTime = null;
        startTimer();
      } else if (status === 'paused') {
        // Retomada: Recalcula o EndTime baseado no que faltava
        expectedEndTime = Date.now() + (timeRemaining * 1000);
        startTimer();
      } else if (status === 'running') {
        // Já rodando, garante consistência
        startTimer();
      }
      break;

    case 'PAUSE_TIMER':
      if (timerId) clearInterval(timerId);
      timerId = null;
      status = 'paused';
      // Congela o tempo restante atual
      if (expectedEndTime) {
          const now = Date.now();
          timeRemaining = Math.max(0, Math.ceil((expectedEndTime - now) / 1000));
      }
      expectedEndTime = null; // Remove alvo para não pular tempo ao resumir
      broadcastStateUpdate();
      break;

    case 'STOP_TIMER':
      if (timerId) clearInterval(timerId);
      timerId = null;
      status = 'idle';
      expectedEndTime = null;
      // Reseta para o início do modo atual
      if (timerMode === 'focus') timeRemaining = focusDuration;
      else if (timerMode === 'shortBreak') timeRemaining = BREAK_DURATIONS.shortBreak;
      else if (timerMode === 'longBreak') timeRemaining = BREAK_DURATIONS.longBreak;
      
      broadcastStateUpdate();
      break;

    case 'SET_FOCUS_DURATION':
      if (typeof payload === 'number') {
          focusDuration = payload * 60; // Payload in minutes
          // FORCE reset to this new time, effectively stopping any previous paused state
          // This ensures that clicking a new task with a custom time always applies that time.
          if (timerId) clearInterval(timerId);
          timerId = null;
          expectedEndTime = null;
          
          status = 'idle';
          timerMode = 'focus';
          timeRemaining = focusDuration;
          
          broadcastStateUpdate();
      }
      break;
      
    case 'SKIP_BREAK':
      // Pular pausa leva direto ao próximo foco
      if (timerMode === 'shortBreak' || timerMode === 'longBreak') {
        if (timerId) clearInterval(timerId);
        timerId = null;
        expectedEndTime = null;
        status = 'idle';
        
        if (timerMode === 'longBreak') {
             pomodorosInCycle = 0; // Reseta se pular a longa
        }
        
        timerMode = 'focus';
        timeRemaining = focusDuration;
        broadcastStateUpdate();
      }
      break;

    case 'SKIP_CYCLE':
      // Força o fim do ciclo atual
      handleCycleEnd();
      break;

    case 'SYNC_STATE':
      broadcastStateUpdate();
      break;
      
    case 'SET_CYCLE_COUNT':
      // Permite que a UI force o contador (útil ao recarregar página)
      if (typeof payload === 'number') {
          pomodorosInCycle = payload;
      }
      break;
  }
});
