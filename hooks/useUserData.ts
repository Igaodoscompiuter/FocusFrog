
import { useUI } from '../context/UIContext';

export const useUserData = () => {
    const { addNotification } = useUI();

    const exportData = () => {
        try {
            const data = JSON.stringify(localStorage);
            const blob = new Blob([data], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'focusfrog_backup.json';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            addNotification('Dados exportados com sucesso!', 'success');
        } catch (error) {
            console.error("Falha ao exportar dados:", error);
            addNotification('Ocorreu um erro ao exportar os dados.', 'error');
        }
    };

    const importData = (file: File) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target?.result as string);
                if (typeof data !== 'object' || data === null) throw new Error('Formato inválido');
                
                Object.keys(data).forEach(key => {
                    // Validação básica para segurança
                    if (typeof key === 'string' && typeof data[key] === 'string') {
                         localStorage.setItem(key, data[key]);
                    }
                });
                addNotification('Dados importados com sucesso! Reiniciando...', 'success');
                setTimeout(() => window.location.reload(), 1500);
            } catch (error) {
                console.error("Falha ao importar dados:", error);
                addNotification('Arquivo de backup inválido ou corrompido.', 'error');
            }
        };
        reader.readAsText(file);
    };

    const resetData = () => {
        if (window.confirm('Você tem certeza que deseja apagar TODOS os seus dados? Esta ação não pode ser desfeita.')) {
            try {
                localStorage.clear();
                addNotification('Dados apagados. Reiniciando...', 'info');
                setTimeout(() => window.location.reload(), 1000);
            } catch (error) {
                console.error("Falha ao resetar dados:", error);
                addNotification('Ocorreu um erro ao apagar os dados.', 'error');
            }
        }
    };

    return { exportData, importData, resetData };
};
