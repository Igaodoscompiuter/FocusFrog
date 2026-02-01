import { useCallback } from 'react';
import { useUI } from '../context/UIContext';
import { supabase } from '../supabaseClient';
import { User } from '@supabase/supabase-js';
import { frogSpecies } from '../utils/frogSpecies';

const USER_DATA_KEYS = [
    'focusfrog_tasks',
    'focusfrog_tags',
    'focusfrog_frogTaskId',
    'focusfrog_onboardingCompleted',
    'focusfrog_routines',
    'focusfrog_taskTemplates',
    'focusfrog_leavingHomeItems',
    'focusfrog_userName',
    'focusfrog_theme',
    'focusfrog_sound',
    'focusfrog_ui_settings',
    'focusfrog_collectedFrogs',
    'focusfrog_pomodorosCompleted'
];

const BACKUP_VERSION = '2.2.0';

const createBackupObjectFromLocalStorage = () => {
    const backup: { [key: string]: any } = { version: BACKUP_VERSION };
    USER_DATA_KEYS.forEach(key => {
        const data = localStorage.getItem(key);
        if (data) {
            try {
                backup[key] = JSON.parse(data);
            } catch (e) {
                backup[key] = data; // Store as raw string if not JSON
            }
        }
    });
    return backup;
};

const restoreLocalStorageFromBackupObject = (data: { [key: string]: any }) => {
    Object.keys(data).forEach(key => {
        if (key !== 'version') {
            const value = typeof data[key] === 'object' ? JSON.stringify(data[key]) : data[key];
            localStorage.setItem(key, value);
        }
    });
};

export const useUserData = () => {
    const { addNotification } = useUI();

    const getCollectedFrogs = useCallback((): string[] => {
        const rawData = localStorage.getItem('focusfrog_collectedFrogs');
        if (!rawData) return [];

        try {
            let parsedData = JSON.parse(rawData);
            if (Array.isArray(parsedData) && parsedData.length > 0 && typeof parsedData[0] === 'object' && parsedData[0] !== null && 'speciesId' in parsedData[0]) {
                const migratedData = parsedData.map(frog => frog.speciesId);
                localStorage.setItem('focusfrog_collectedFrogs', JSON.stringify(migratedData));
                return migratedData;
            }
            return Array.isArray(parsedData) ? parsedData : [];
        } catch (error) {
            console.error("Erro ao processar dados de sapos coletados:", error);
            return [];
        }
    }, []);

    const addFrogToCollection = useCallback((speciesId: string) => {
        try {
            const collectedFrogs = getCollectedFrogs();
            if (!collectedFrogs.includes(speciesId)) {
                const newCollection = [...collectedFrogs, speciesId];
                localStorage.setItem('focusfrog_collectedFrogs', JSON.stringify(newCollection));
                const speciesName = frogSpecies[speciesId]?.name || 'um novo sapo';
                addNotification(`Novo Sapo Coletado!`, `Você descobriu o ${speciesName}!`, 'success');
            }
        } catch (error) {
            console.error("Falha ao adicionar sapo à coleção:", error);
            addNotification('Erro ao salvar seu novo sapo.', '❌', 'error');
        }
    }, [getCollectedFrogs, addNotification]);

    const exportData = useCallback(() => {
        try {
            const backupData = createBackupObjectFromLocalStorage();
            const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            const date = new Date().toISOString().split('T')[0];
            link.href = url;
            link.download = `focusfrog_backup_${date}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            addNotification('Dados exportados com sucesso!', '👍', 'success');
        } catch (error) {
            addNotification('Falha na exportação.', 'Ocorreu um erro ao criar o arquivo de backup.', 'error');
            console.error(error);
        }
    }, [addNotification]);

    const importDataFromFile = useCallback((file: File, user: User | null) => {
        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const data = JSON.parse(event.target?.result as string);
                restoreLocalStorageFromBackupObject(data);
                addNotification('Importação Concluída', 'Seus dados foram restaurados. A página será recarregada.', 'success');
                setTimeout(() => window.location.reload(), 2000);
            } catch (error) {
                addNotification('Arquivo Inválido', 'O arquivo selecionado não parece ser um backup válido do FocusFrog.', 'error');
                console.error(error);
            }
        };
        reader.readAsText(file);
    }, [addNotification]);

    const resetData = useCallback(() => {
        USER_DATA_KEYS.forEach(key => localStorage.removeItem(key));
        addNotification('Dados Resetados', 'Suas informações locais foram apagadas. A página será recarregada.', 'success');
        setTimeout(() => window.location.reload(), 1500);
    }, [addNotification]);
    
    const syncLocalToSupabase = useCallback(async (user: User) => { /* Implementação omitida para brevidade */ }, []);
    const downloadAndRestoreFromSupabase = useCallback(async (user: User) => { /* Implementação omitida para brevidade */ }, []);

    return {
        exportData,
        importDataFromFile,
        resetData,
        downloadAndRestoreFromSupabase,
        syncLocalToSupabase,
        addFrogToCollection,
        getCollectedFrogs,
    };
};