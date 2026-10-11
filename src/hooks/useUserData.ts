import { supabase } from '../supabaseClient';
import type { User } from '@supabase/supabase-js';
import { useCallback } from 'react';
import { useUI } from '../context/UIContext';
import { frogSpecies } from '../utils/frogSpecies';
import { USER_DATA_KEYS, collectSnapshot, applySnapshot, UserSnapshot } from '../sync/userDataKeys';

// Arquivo de backup = mesmo formato da nuvem (ver src/sync/userDataKeys.ts).
const createBackupObjectFromLocalStorage = () => ({ ...collectSnapshot(), exportedAt: new Date().toISOString() });

const restoreLocalStorageFromBackupObject = (data: UserSnapshot) => {
    if (!data || typeof data !== 'object' || !USER_DATA_KEYS.some(k => k in data)) throw new Error('backup inválido');
    applySnapshot(data);
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
            const isNewDiscovery = !collectedFrogs.includes(speciesId);

            // Adiciona o novo sapo à coleção, permitindo duplicatas.
            const newCollection = [...collectedFrogs, speciesId];
            localStorage.setItem('focusfrog_collectedFrogs', JSON.stringify(newCollection));
            
            const speciesName = frogSpecies[speciesId]?.name || 'sapo desconhecido';

            // Notifica o usuário com base em ser uma nova descoberta ou uma duplicata.
            if (isNewDiscovery) {
                addNotification(`Você descobriu o ${speciesName}!`, '🐸', 'success');
            } else {
                addNotification(`Mais um ${speciesName} coletado!`, '🐸', 'success');
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
            addNotification('Falha na exportação — erro ao criar o arquivo de backup.', '❌', 'error');
            console.error(error);
        }
    }, [addNotification]);

    const importDataFromFile = useCallback((file: File, user: User | null) => {
        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const data = JSON.parse(event.target?.result as string);
                restoreLocalStorageFromBackupObject(data);
                addNotification('Importação concluída — seus dados foram restaurados. Recarregando...', '✅', 'success');
                setTimeout(() => window.location.reload(), 2000);
            } catch (error) {
                addNotification('Arquivo inválido — isso não parece um backup do FocusFrog.', '❌', 'error');
                console.error(error);
            }
        };
        reader.readAsText(file);
    }, [addNotification]);

    const resetData = useCallback(() => {
        // [CORREÇÃO] Antes só apagava 13 chaves fixas — lagoa, viveiro,
        // sessão de foco em andamento, configurações etc. SOBREVIVIAM ao
        // reset (por isso sapos antigos reapareciam depois de "apagar os
        // dados"). Agora apaga toda chave do app, inclusive as que forem
        // criadas no futuro, sem depender de lembrar de atualizar a lista.
        supabase.auth.signOut().catch(() => {});
        Object.keys(localStorage)
            .filter(key => key.startsWith('focusfrog_'))
            .forEach(key => localStorage.removeItem(key));
        addNotification('Dados resetados — suas informações locais foram apagadas. Recarregando...', '🗑️', 'success');
        setTimeout(() => window.location.reload(), 1500);
    }, [addNotification]);
    

    return {
        exportData,
        importDataFromFile,
        resetData,
        addFrogToCollection,
        getCollectedFrogs,
    };
};