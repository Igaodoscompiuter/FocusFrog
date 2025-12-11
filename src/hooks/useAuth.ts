
import { useState, useEffect } from 'react';
import { getAuthInstance } from '../firebase';
import { onAuthStateChanged, User, signOut as firebaseSignOut, GoogleAuthProvider, signInWithPopup, linkWithCredential } from 'firebase/auth';

export interface AuthState {
  user: User | null;
  isAnonymous: boolean;
  isLoading: boolean;
  upgradeToGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuth = (): AuthState => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const auth = getAuthInstance();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const upgradeToGoogle = async () => {
    const auth = getAuthInstance();
    const provider = new GoogleAuthProvider();
    if (auth.currentUser) {
        try {
            const result = await signInWithPopup(auth, provider);
            // This will link the anonymous account to the Google account.
            // If the user was anonymous, Firebase automatically handles the upgrade.
            // If they already had a Google account, it signs them in.
        } catch (error: any) {
            // Handle cases where the user might already have an account with the same email
            // For this app, we'll assume a simple path, but production apps might need more handling
            console.error("Erro ao vincular conta Google:", error.message);
            // Potentially alert the user that they might need to sign in directly
        }
    }
  };

  const signOut = async () => {
    const auth = getAuthInstance();
    await firebaseSignOut(auth);
    // After signing out, Firebase will automatically sign the user in as an anonymous user
    // as per our setup in `firebase.ts`
  };

  return {
    user,
    isAnonymous: user ? user.isAnonymous : true,
    isLoading,
    upgradeToGoogle,
    signOut,
  };
};
