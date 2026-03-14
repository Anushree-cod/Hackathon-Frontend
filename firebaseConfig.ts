
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey:            'AIzaSyCgxU8AnzyVzTgHRPHozTPO_lgHdYZUb3Y',
  authDomain:        'nuerlearn.firebaseapp.com',
  projectId:         'nuerlearn',
  storageBucket:     'nuerlearn.firebasestorage.app',
  messagingSenderId: '651183106481',
  appId:             '1:651183106481:web:1a342fb791b9cd11f6b590',
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export default app;