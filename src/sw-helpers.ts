
// Um tipo para definir a estrutura das nossas mensagens
export interface SWMessage {
    type: 'SCHEDULE_NOTIFICATION' | 'CANCEL_NOTIFICATION';
    payload?: {
        title: string;
        body: string;
        timestamp: number; // Quando a notificação deve ser mostrada
    };
}

/**
 * Envia uma mensagem para o Service Worker ativo.
 * @param message O objeto da mensagem a ser enviada.
 */
export function postMessageToSW(message: SWMessage) {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage(message);
        console.log('Mensagem enviada para o SW:', message.type);
    } else {
        console.warn('Não foi possível enviar a mensagem para o Service Worker. Controller não encontrado.');
    }
}
