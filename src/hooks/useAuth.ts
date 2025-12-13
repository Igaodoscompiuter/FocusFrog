
import { useState, useEffect } from 'react';
import { getAuthInstance } from '../firebase';
import { 
  onAuthStateChanged, 
  User, 
  signOut as firebaseSignOut, 
  GoogleAuthProvider, 
  signInWithPopup,
  signInAnonymously as firebaseSignInAnonymously
} from 'firebase/auth';
import { trackLogin } from '../analytics'; // Importa a nossa função de tracking

export interface AuthState {
  user: User | null;
  isAnonymous: boolean;
  isLoading: boolean;
  isGoogleUser: boolean;
  upgradeToGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  signInAnonymouslyIfNeeded: () => Promise<void>;
}

export const useAuth = (): AuthState => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const auth = getAuthInstance();
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
      await signInWithPopup(auth, provider);
      // Se o login for bem-sucedido, rastreamos o evento!
      trackLogin('google');
    } catch (error) { 
      console.error("Erro durante o login com o popup do Google:", error);
    }
  };

  const signOut = async () => {
    const auth = getAuthInstance();
    await firebaseSignOut(auth);
    // After signing out of a Google account, we now do nothing. The user becomes logged out.
  };

  const signInAnonymouslyIfNeeded = async () => {
    const auth = getAuthInstance();
    if (!auth.currentUser) {
        try {
            await firebaseSignInAnonymously(auth);
        } catch (error) {
            console.error("Anonymous sign-in failed on demand:", error);
        }
    }
  };

  const isGoogleUser = user ? !user.isAnonymous && user.providerData.some(p => p.providerId === 'google.com') : false;

  return {
    user,
    // If there's no user object, they are not anonymous in the firebase sense, they are simply logged-out.
    // We can treat them as "anonymous" in the UI context, but firebase doesn't have a user record for them.
    isAnonymous: user ? user.isAnonymous : false, 
    isLoading,
    isGoogleUser,
    upgradeToGoogle,
    signOut,
    signInAnonymouslyIfNeeded,
  };
};
