
import { useState, useEffect } from 'react';
import { getAuthInstance } from '../firebase';
import { 
  onAuthStateChanged, 
  User, 
  signOut as firebaseSignOut, 
  GoogleAuthProvider, 
  signInWithRedirect,
  getRedirectResult // 1. IMPORTAR A FUNÇÃO ESSENCIAL
} from 'firebase/auth';

export interface AuthState {
  user: User | null;
  isAnonymous: boolean;
  isLoading: boolean; // Renomeado de isAuthLoading para consistência
  isGoogleUser: boolean; // Adicionado para clareza no roteamento
  upgradeToGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuth = (): AuthState => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const auth = getAuthInstance();

    // 2. PROCESSAR O RESULTADO DO REDIRECIONAMENTO AO CARREGAR O APP
    // Isso captura os dados do login do Google quando o usuário retorna.
    getRedirectResult(auth)
      .catch((error) => {
        // Lidar com erros que podem ocorrer durante o processo de login
        console.error("Erro ao processar o resultado do redirecionamento do Google:", error);
      });

    // O `onAuthStateChanged` agora será acionado com o usuário correto (Google ou anônimo)
    // porque `getRedirectResult` resolveu o login pendente.
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const upgradeToGoogle = async () => {
    const auth = getAuthInstance();
    const provider = new GoogleAuthProvider();
    // Inicia o fluxo de redirecionamento. O código acima cuidará do resultado.
    await signInWithRedirect(auth, provider);
  };

  const signOut = async () => {
    const auth = getAuthInstance();
    await firebaseSignOut(auth);
    // Firebase irá automaticamente fazer o login anônimo após o logout,
    // conforme nossa configuração em `firebase.ts`.
  };

  // 3. DERIVAR isGoogleUser DO ESTADO DO USUÁRIO
  // Um usuário do Google não é anônimo e seu provedor é 'google.com'.
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
