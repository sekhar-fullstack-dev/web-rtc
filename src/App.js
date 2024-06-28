import './App.css';
import React, { useState, useEffect } from 'react';
import { auth } from './utils/firebase-config';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import VideoCall from './components/VideoCall';

function App() {
  const [user, setUser] = useState(null);
  const [recipientId, setRecipientId] = useState(null);
  const [isCaller, setIsCaller] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(currentUser => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div>
      {!user && <Login />}
      {user && !recipientId && (
        <Dashboard 
          setRecipientId={setRecipientId} 
          setIsCaller={setIsCaller} 
          user={user} 
        />
      )}
      {user && recipientId && (
        <VideoCall 
          user={user} 
          recipientId={recipientId} 
          setRecipientId={setRecipientId}
          isCaller={isCaller} 
        />
      )}
    </div>
  );
}

export default App;
