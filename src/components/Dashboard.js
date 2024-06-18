import React, { useState, useEffect } from 'react';
import { firestore } from '../utils/firebase-config';
import { doc, onSnapshot } from 'firebase/firestore';

const Dashboard = ({ user, setRecipientId, setIsCaller }) => {
  const [inputRecipientId, setInputRecipientId] = useState('');

  useEffect(() => {
    const callDoc = doc(firestore, 'calls', user.uid);
    const unsubscribe = onSnapshot(callDoc, (snapshot) => {
      const data = snapshot.data();
      if (data && data.type === 'offer') {
        console.log('Incoming call offer:', data);
        setRecipientId(data.userId);
        setIsCaller(false);
      }
    });

    return () => unsubscribe();
  }, [user, setRecipientId, setIsCaller]);

  const handleStartCall = () => {
    console.log('Start Call button clicked');
    setRecipientId(inputRecipientId);
    setIsCaller(true);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
        <p className="mb-4">Your User ID: <strong>{user.uid}</strong></p>
        <input
          type="text"
          placeholder="Enter Recipient ID"
          value={inputRecipientId}
          onChange={(e) => setInputRecipientId(e.target.value)}
          className="mb-4 p-2 border rounded w-full"
        />
        <button
          onClick={handleStartCall}
          className="bg-blue-500 text-white py-2 px-4 rounded w-full"
        >
          Start Call
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
