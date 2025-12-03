
import React, { useState } from 'react';
import { useUI } from '../context/UIContext';
import { useTasks } from '../context/TasksContext'; 
import { HomeScreen } from './HomeScreen';
import { FocusScreen } from './FocusScreen';
import { TasksScreen } from './TasksScreen';
import { StatsScreen } from './StatsScreen';
import { RewardsScreen } from './RewardsScreen';
import { MoodboardScreen } from './MoodboardScreen';
import { BottomNav } from '../components/BottomNav';
import { MorningReviewModal } from '../components/modals/MorningReviewModal';
import styles from './DashboardScreen.module.css';

const screenComponents: { [key: string]: React.FC<any> } = {
  dashboard: HomeScreen,
  focus: FocusScreen,
  tasks: TasksScreen,
  stats: StatsScreen,
  rewards: RewardsScreen,
  moodboard: MoodboardScreen,
};

export const DashboardScreen: React.FC = () => {
  // CORRIGIDO: `addNotification` vem do `useUI`, não do `useTasks`.
  const { activeScreen, addNotification } = useUI();
  const { tasks, frogTaskId, setFrogTaskId } = useTasks();

  const [isMorningReviewOpen, setIsMorningReviewOpen] = useState(false);
  const [selectedFrogCandidate, setSelectedFrogCandidate] = useState<string | null>(frogTaskId);

  const frogCandidates = tasks.filter(t => t.status !== 'done');

  const handleConfirmFrog = () => {
    if (selectedFrogCandidate) {
      setFrogTaskId(selectedFrogCandidate);
      // AGORA FUNCIONA: `addNotification` é chamado do contexto correto.
      addNotification('Sapo do Dia definido!', '🐸', 'success');
    }
    setIsMorningReviewOpen(false);
  };
  
  const openMorningReview = () => {
    setSelectedFrogCandidate(frogTaskId);
    setIsMorningReviewOpen(true);
  }

  const ActiveScreenComponent = screenComponents[activeScreen] || HomeScreen;

  const screenProps: { [key: string]: any } = {};
  if (activeScreen === 'dashboard') {
    screenProps.openMorningReview = openMorningReview;
  }

  return (
    <div className={styles.dashboardLayout}>
      <MorningReviewModal
        isOpen={isMorningReviewOpen}
        tasks={frogCandidates}
        selectedTask={selectedFrogCandidate}
        onSelectTask={setSelectedFrogCandidate}
        onConfirm={handleConfirmFrog}
        onClose={() => setIsMorningReviewOpen(false)}
      />
      
      <main className={styles.mainContent}>
        <ActiveScreenComponent {...screenProps} />
      </main>
      
      <footer className={styles.footerNav}>
        <BottomNav />
      </footer>
    </div>
  );
};
