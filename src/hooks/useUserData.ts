
import { useUI } from '../context/UIContext';
// 1. A importação problemática de 'defaultLeavingHomeItems' foi removida.
import { initialRoutines, initialTaskTemplates, defaultTags } from '../constants';
import { supabase } from '../supabaseClient';
import { User } from '@supabase/supabase-js';

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

const BACKUP_VERSION = '2.1.0';

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
                console.warn(`Could not parse localStorage item ${key}:`, value, e);
            }
        }
    });
    return backupData;
};

const restoreLocalStorageFromBackupObject = (data: { [key: string]: any }) => {
    localStorage.clear();

    const userRoutines = data['focusfrog_routines'] || [];
    data['focusfrog_routines'] = [...initialRoutines, ...userRoutines.filter((r: any) => !r.isDefault)];

    const userTemplates = data['focusfrog_taskTemplates'] || [];
    data['focusfrog_taskTemplates'] = [...initialTaskTemplates, ...userTemplates.filter((t: any) => !t.isDefault)];
    
    if (!data['focusfrog_tags']) data['focusfrog_tags'] = defaultTags;
    
    // 2. A linha que usava a variável inexistente foi removida.
    // if (!data['focusfrog_leavingHomeItems']) data['focusfrog_leavingHomeItems'] = defaultLeavingHomeItems;

    Object.keys(data).forEach(key => {
        if (USER_DATA_KEYS.includes(key)) {
            localStorage.setItem(key, JSON.stringify(data[key]));
        }
    });
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
            
            backupData['focusfrog_routines'] = (backupData['focusfrog_routines'] || []).filter((item: any) => !item.isDefault);
            backupData['focusfrog_taskTemplates'] = (backupData['focusfrog_taskTemplates'] || []).filter((item: any) => !item.isDefault);

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
                addNotification('Dados importados com sucesso!', '📥', 'success');
                
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

    return { 
        exportData, 
        importDataFromFile, 
        resetData, 
        downloadAndRestoreFromSupabase,
        syncLocalToSupabase
    };
};
