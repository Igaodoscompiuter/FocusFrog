
import { useUI } from '../context/UIContext';
import { initialRoutines, initialTaskTemplates } from '../constants';

// A lista de chaves permanece a mesma
const USER_DATA_KEYS = [
    'focusfrog_tasks',
    'focusfrog_tags',
    'focusfrog_frogTaskId',
    'focusfrog_onboarding_completed',
    'focusfrog_routines',
    'focusfrog_taskTemplates',
    'focusfrog_leavingHomeItems',
    'focusfrog_userName',
    'focusfrog_theme',
    'focusfrog_sound',
    'focusfrog_pontos_foco',
    'focusfrog_unlocked_rewards',
    'focusfrog_ui_settings'
];

const BACKUP_VERSION = '1.0.1'; // Versão incrementada devido à mudança de lógica

export const useUserData = () => {
    const { addNotification } = useUI();

    const exportData = () => {
        try {
            const backupData: { [key: string]: any } = {
                backupVersion: BACKUP_VERSION,
                exportedAt: new Date().toISOString(),
            };

            USER_DATA_KEYS.forEach(key => {
                const value = localStorage.getItem(key);
                if (value === null) return;

                let dataToStore = JSON.parse(value);

                // **AQUI ESTÁ A CORREÇÃO CRÍTICA**
                // Filtra para salvar apenas os itens criados pelo usuário.
                if (key === 'focusfrog_routines' || key === 'focusfrog_taskTemplates') {
                    if (Array.isArray(dataToStore)) {
                        dataToStore = dataToStore.filter(item => !item.isDefault);
                    }
                }
                
                backupData[key] = dataToStore;
            });

            const dataStr = JSON.stringify(backupData, null, 2);
            const blob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.href = url;

            const userNameRaw = localStorage.getItem('focusfrog_userName');
            const userName = userNameRaw ? JSON.parse(userNameRaw) : 'usuario';
            const sanitizedUserName = String(userName).replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '').toLowerCase();
            const dateStamp = new Date().toISOString().split('T')[0];
            a.download = `focusfrog_backup_${sanitizedUserName}_${dateStamp}.json`;

            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            addNotification('Backup criado com sucesso', '📤', 'success');
        } catch (error) {
            console.error("Falha ao criar backup:", error);
            addNotification('Ocorreu um erro ao criar o backup', '❌', 'error');
        }
    };

    const importData = (file: File) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target?.result as string);

                if (typeof data !== 'object' || data === null || !data.backupVersion) {
                    throw new Error('Arquivo de backup inválido ou formato não reconhecido.');
                }

                // Lida com a versão antiga que salvava tudo
                if (data.backupVersion !== BACKUP_VERSION && data.backupVersion !== '1.0.0') {
                    addNotification(`Backup incompatível (v${data.backupVersion})`, '⚠️', 'error');
                    return;
                }

                localStorage.clear();

                // **LÓGICA DE IMPORTAÇÃO MELHORADA**
                // Mescla os dados do backup com os dados padrão do app
                const userRoutines = data['focusfrog_routines'] || [];
                const fullRoutines = [...initialRoutines, ...userRoutines.filter((r: any) => !r.isDefault)];
                data['focusfrog_routines'] = fullRoutines;

                const userTemplates = data['focusfrog_taskTemplates'] || [];
                const fullTemplates = [...initialTaskTemplates, ...userTemplates.filter((t: any) => !t.isDefault)];
                data['focusfrog_taskTemplates'] = fullTemplates;


                Object.keys(data).forEach(key => {
                    if (USER_DATA_KEYS.includes(key) || key === 'focusfrog_tasks_v2_migrated') { // Inclui a chave de migração
                        localStorage.setItem(key, JSON.stringify(data[key]));
                    }
                });

                addNotification('Dados importados com sucesso! Reiniciando...', '📥', 'success');
                setTimeout(() => window.location.reload(), 1500);

            } catch (error) {
                console.error("Falha ao importar dados:", error);
                addNotification('Arquivo de backup inválido ou corrompido.', '📄', 'error');
            }
        };
        reader.readAsText(file);
    };

    const resetData = () => {
        try {
            localStorage.clear();
            addNotification('Dados apagados. Reiniciando o aplicativo...', '🗑️', 'info');
            setTimeout(() => window.location.reload(), 1000);
        } catch (error) {
            console.error("Falha ao apagar os dados:", error);
            addNotification('Ocorreu um erro ao apagar os dados', '❌', 'error');
        }
    };

    return { exportData, importData, resetData };
};
