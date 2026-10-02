import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, googleProvider, testFirestoreConnection, handleFirestoreError, OperationType } from './config';

export interface AppUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  role: 'admin' | 'executive' | 'operations_manager' | 'store_partner';
  isDemo?: boolean;
}

interface AuthContextType {
  currentUser: AppUser | null;
  firebaseUser: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  logOut: () => Promise<void>;
  enableDemoUser: (role?: AppUser['role']) => void;
  error: string | null;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  firebaseUser: null,
  loading: true,
  signInWithGoogle: async () => {},
  logOut: async () => {},
  enableDemoUser: () => {},
  error: null,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [currentUser, setCurrentUser] = useState<AppUser | null>({
    uid: 'demo-executive-01',
    email: 'executive@novacart.internal',
    displayName: 'Executive Turnaround Lead',
    photoURL: null,
    role: 'executive',
    isDemo: true,
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    testFirestoreConnection();

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (user) {
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userDocRef);
          
          let role: AppUser['role'] = user.email === 'kosuruavinay@gmail.com' ? 'admin' : 'executive';
          
          if (!userDoc.exists()) {
            await setDoc(userDocRef, {
              uid: user.uid,
              email: user.email || 'user@novacart.in',
              displayName: user.displayName || 'NOVA CART Leader',
              role: role,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            });
          } else {
            const data = userDoc.data();
            if (data?.role) {
              role = data.role;
            }
          }

          setCurrentUser({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName || 'Authorized User',
            photoURL: user.photoURL,
            role,
            isDemo: false,
          });
        } catch (err) {
          console.warn('Could not sync user profile with Firestore:', err);
          // Fallback to local profile with the authenticated user
          setCurrentUser({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName || 'Authorized User',
            photoURL: user.photoURL,
            role: user.email === 'kosuruavinay@gmail.com' ? 'admin' : 'executive',
            isDemo: false,
          });
        }
      } else {
        // Keep default demo user for frictionless immediate review
        setCurrentUser((prev) => {
          if (prev && !prev.isDemo) {
            return {
              uid: 'demo-executive-01',
              email: 'executive@novacart.internal',
              displayName: 'Executive Turnaround Lead',
              photoURL: null,
              role: 'executive',
              isDemo: true,
            };
          }
          return prev;
        });
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    setError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
      console.error('Google Sign In Error:', err);
    }
  };

  const logOut = async () => {
    try {
      await signOut(auth);
      setCurrentUser({
        uid: 'demo-executive-01',
        email: 'executive@novacart.internal',
        displayName: 'Executive Turnaround Lead',
        photoURL: null,
        role: 'executive',
        isDemo: true,
      });
    } catch (err) {
      console.error('Sign Out Error:', err);
    }
  };

  const enableDemoUser = (role: AppUser['role'] = 'executive') => {
    setCurrentUser({
      uid: 'demo-executive-01',
      email: `${role}@novacart.internal`,
      displayName: role === 'admin' ? 'Super Admin (Demo)' : 'Executive Turnaround Lead',
      photoURL: null,
      role,
      isDemo: true,
    });
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        firebaseUser,
        loading,
        signInWithGoogle,
        logOut,
        enableDemoUser,
        error,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
