import React from 'react';
import { auth } from '../utils/firebase-config';
import {GoogleAuthProvider, signInWithPopup} from 'firebase/auth';

const Login = () => {
  const signInWithGoogle = () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-sm">
        <h1 className="text-2xl font-bold mb-6 text-center">Login</h1>
        <button
          onClick={signInWithGoogle}
          className="w-full bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded transition duration-200"
        >
          Sign in with Google
        </button>
      </div>
    </div>
  );
};

export default Login;
