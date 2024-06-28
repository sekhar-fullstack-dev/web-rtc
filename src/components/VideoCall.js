import React, { useRef, useState, useEffect } from 'react';
import { useWebRTC } from '../utils/WebRTCMsanager';
// import './VideoCall.css'; // Import the CSS file

const VideoCall = ({ user, recipientId, isCaller }) => {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const {
    init,
    createPeerConnection,
    createOffer,
    createAnswer,
    setRemoteDescription,
    addIceCandidate,
    peerConnection,
    cleanup
  } = useWebRTC(localVideoRef, remoteVideoRef, user.uid, recipientId);
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleStartCall = async () => {
      console.log('Initializing WebRTC...');
      try {
        await init();
        console.log('WebRTC initialized successfully');
        createPeerConnection();
        if (isCaller) {
          
        }
        await createOffer();
      } catch (err) {
        console.error('Error initializing WebRTC:', err);
        setError('Error accessing media devices. Please check your permissions and try again.');
      }
    };

    handleStartCall();
  }, [isCaller]);

  const handleEndCall = () => {
    cleanup();
  };

  return (
    <div className="relative min-h-screen bg-gray-100 flex items-center justify-center">
      {error && <div className="error-message">{error}</div>}
      <div className="relative w-full h-full flex items-center justify-center">
        <video ref={remoteVideoRef} className="max-w-full h-full object-contain z-0" autoPlay></video>
      </div>
      <div className="absolute top-4 right-4 w-1/4 h-auto border-2 border-white z-10">
        <video ref={localVideoRef} className="w-full h-auto object-cover" autoPlay muted></video>
      </div>
      <button
        onClick={handleEndCall}
        className="absolute bottom-4 left-4 bg-red-500 text-white py-2 px-4 rounded z-10"
      >
        End Call
      </button>
    </div>
  );
};

export default VideoCall;
