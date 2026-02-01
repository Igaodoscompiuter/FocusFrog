import { useUI } from '../context/UIContext';
import { initialRoutines, initialTaskTemplates, defaultTags } from '../constants';
import { supabase } from '../supabaseClient';
import { User } from '@supabase/supabase-js';

// A LISTA DE CHAVES ATUALIZADA
const USER_DATA_KEYS = [
    'focusfrog_tasks',
    'focusfrog_tags',
    'focusfrog_frogTaskId',
    'focusfrog_onboardingCompleted', // Corrigido de 'onboarding_completed'
    'focusfrog_routines',
    'focusfrog_taskTemplates',
    'focusfrog_leavingHomeItems',
    'focusfrog_userName',
    'focusfrog_theme',
    'focusfrog_sound',
    'focusfrog_ui_settings',
    'focusfrog_collectedFregs', // <-- ADICIONADO
    'focusfrog_pomodorosCompleted' // <-- ADICIONADO
];

const BACKUP_VERSION = '2.2.0'; // Versão incrementada

const createBackupObjectFromLocalStorage = () => {
    const backupData: { [key: string]: any } = {
        backupVersion: BACKUP_VERSION,
        exportedAt: new Date().toISOString(),
    };

    USER_DATA_KEYS.forEach(key => {
        const value = localStorage.getItem(key);
        if (value !== null) {
            try {
                 backupData[key] = JSON.parse(value);
            } catch (e) {
                // Se não for JSON, apenas armazena como string
                backupData[key] = value;
            }
        }
    });
    return backupData;
};

const restoreLocalStorageFromBackupObject = (data: { [key: string]: any }) => {
    // Limpa apenas as chaves gerenciadas antes de restaurar
    USER_DATA_KEYS.forEach(key => localStorage.removeItem(key));

    Object.keys(data).forEach(key => {
        // Restaura apenas chaves que fazem parte do nosso sistema
        if (USER_DATA_KEYS.includes(key)) {
            const value = typeof data[key] === 'string' ? data[key] : JSON.stringify(data[key]);
            localStorage.setItem(key, value);
        }
    });

    // Garante que os dados de onboarding sejam tratados corretamente
    if (data['focusfrog_onboardingCompleted']) {
        localStorage.setItem('focusfrog_onboardingCompleted', JSON.stringify(true));
    }
};

export const useUserData = () => {
    const { addNotification } = useUI();

    const syncLocalToSupabase = async (user: User) => {
        if (!user) return;
        addNotification('Sincronizando com a nuvem...', '☁️', 'info');
        try {
            const localBackup = createBackupObjectFromLocalStorage();
            const userName = JSON.parse(localStorage.getItem('focusfrog_userName') || '""');

            const { error } = await supabase.from('profiles').upsert({
                id: user.id,
                updated_at: new Date().toISOString(),
                username: userName,
                data: localBackup
            });

            if (error) throw error;

            addNotification('Backup salvo na nuvem!', '✅', 'success');

        } catch (error: any) {
            console.error("Falha ao sincronizar com a nuvem:", error);
            addNotification(`Erro na nuvem: ${error.message}`, '❌', 'error');
        }
    };

    const downloadAndRestoreFromSupabase = async (user: User) => {
        addNotification('Buscando seu backup na nuvem...', '☁️', 'info');
        try {
            const { data: profile, error } = await supabase
                .from('profiles')
                .select('data')
                .eq('id', user.id)
                .single();

            if (error) throw error;

            if (!profile || !profile.data) {
                addNotification('Nenhum backup encontrado na nuvem.', '🤷', 'info');
                return;
            }

            restoreLocalStorageFromBackupObject(profile.data);

            addNotification('Backup da nuvem restaurado! Reiniciando...', '📥', 'success');
            setTimeout(() => window.location.reload(), 1500);

        } catch (error: any) {
            console.error("Falha ao restaurar da nuvem:", error);
            addNotification(`Erro na nuvem: ${error.message}`, '❌', 'error');
        }
    }; 
    
    const exportData = () => {
        try {
            const backupData = createBackupObjectFromLocalStorage();
            
            const dataStr = JSON.stringify(backupData, null, 2);
            const blob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            const userName = backupData['focusfrog_userName'] || 'usuario';
            const sanitizedUserName = String(userName).replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '').toLowerCase();
            const dateStamp = new Date().toISOString().split('T')[0];
            a.download = `focusfrog_backup_${sanitizedUserName}_${dateStamp}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            addNotification('Backup local criado com sucesso', '📤', 'success');
        } catch (error) {
            console.error("Falha ao criar backup local:", error);
            addNotification('Erro ao criar backup local.', '❌', 'error');
        }
    };

    const importDataFromFile = (file: File, user: User | null) => {
        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const data = JSON.parse(e.target?.result as string);
                if (typeof data !== 'object' || data === null || !data.backupVersion) {
                    throw new Error('Arquivo de backup inválido.');
                }

                restoreLocalStorageFromBackupObject(data);
                addNotification('Dados importados com sucesso! Reiniciando...', '📥', 'success');
                
                if (user) {
                    await syncLocalToSupabase(user);
                }

                setTimeout(() => window.location.reload(), user ? 2500 : 1500);

            } catch (error: any) {
                console.error("Falha ao importar arquivo:", error);
                addNotification(error.message, '📄', 'error');
            }
        };
        reader.readAsText(file);
    };
    
    // A FUNÇÃO RESETDATA CORRIGIDA
    const resetData = () => {
        try {
            // Remove apenas as chaves que o aplicativo gerencia
            USER_DATA_KEYS.forEach(key => {
                localStorage.removeItem(key);
            });
            addNotification('Dados locais apagados. Reiniciando...', '🗑️', 'info');
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        } catch (error) {
            console.error("Falha ao apagar os dados:", error);
            addNotification('Ocorreu um erro ao apagar os dados', '❌', 'error');
        }
    };

    return { 
        exportData, 
        importDataFromFile, 
        resetData, 
        downloadAndRestoreFromSupabase,
        syncLocalToSupabase
    };
};