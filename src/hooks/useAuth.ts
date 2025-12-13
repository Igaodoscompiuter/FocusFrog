
import { useState, useEffect } from 'react';
import { getAuthInstance } from '../firebase';
import { 
  onAuthStateChanged, 
  User, 
  signOut as firebaseSignOut, 
  GoogleAuthProvider, 
  signInWithPopup // Alterado de redirect para popup
} from 'firebase/auth';

export interface AuthState {
  user: User | null;
  isAnonymous: boolean;
  isLoading: boolean;
  isGoogleUser: boolean;
  upgradeToGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuth = (): AuthState => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const auth = getAuthInstance();
    // A lógica de getRedirectResult foi removida, pois não é necessária com o signInWithPopup.
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const upgradeToGoogle = async () => {
    const auth = getAuthInstance();
    const provider = new GoogleAuthProvider();
    try {
      // A função foi alterada para usar o fluxo de popup.
      await signInWithPopup(auth, provider);
      // O onAuthStateChanged tratará da atualização do estado do usuário após o login.
    } catch (error) { 
      // É uma boa prática tratar erros, como o utilizador fechar o popup.
      console.error("Erro durante o login com o popup do Google:", error);
    }
  };

  const signOut = async () => {
    const auth = getAuthInstance();
    await firebaseSignOut(auth);
    // O Firebase fará o login anônimo automaticamente após o logout.
  };

  const isGoogleUser = user ? !user.isAnonymous && user.providerData.some(p => p.providerId === 'google.com') : false;

  return {
    user,
    isAnonymous: user ? user.isAnonymous : true,
    isLoading,
    isGoogleUser,
    upgradeToGoogle,
    signOut,
  };
};
