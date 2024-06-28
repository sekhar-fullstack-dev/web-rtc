import { useRef, useEffect } from 'react';
import { firestore } from './firebase-config';
import { doc, collection, getDocs,onSnapshot ,deleteDoc, addDoc, setDoc } from 'firebase/firestore';

export const useWebRTC = (localVideoRef, remoteVideoRef, userId, recipientId, setRecipientId) => {
  const peerConnection = useRef(null);
  const localStream = useRef(null);
  const remoteStream = useRef(null);
  const iceCandidatesQueue = useRef([]);

  const servers = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
    ],
  };

  const init = async () => {
    try {
      console.log('Requesting user media...');
      const constraints = { video: true, audio: true };
      console.log('Using constraints:', constraints);

      const getUserMediaPromise = navigator.mediaDevices.getUserMedia(constraints);
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('getUserMedia timeout')), 10000)
      );

      const stream = await Promise.race([getUserMediaPromise, timeoutPromise]);
      console.log('User media obtained:', stream);

      if (stream) {
        localStream.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = localStream.current;
          console.log('Local stream set to video element');
        } else {
          console.error('localVideoRef.current is null');
        }
      } else {
        console.error('No stream returned');
      }
    } catch (err) {
      console.error('Error accessing media devices:', err);
      alert('Could not access your camera and/or microphone. Please check permissions and try again.');
      throw err; // Re-throw the error to handle it in the calling code
    }
  };

  const createPeerConnection = () => {
    if (!localStream.current) {
      console.error('Local stream not initialized');
      return;
    }

    peerConnection.current = new RTCPeerConnection(servers);
    console.log('Peer connection created:', peerConnection.current);

    peerConnection.current.onicecandidate = event => {
      if (event.candidate) {
        console.log('ICE candidate generated:', event.candidate);
        sendIceCandidate(event.candidate);
      }
    };

    peerConnection.current.ontrack = event => {
      if (!remoteStream.current) {
        remoteStream.current = new MediaStream();
        remoteVideoRef.current.srcObject = remoteStream.current;
      }
      remoteStream.current.addTrack(event.track);
      console.log('Remote track added:', event.track);
    };

    localStream.current.getTracks().forEach(track => {
      peerConnection.current.addTrack(track, localStream.current);
      console.log('Local track added:', track);
    });
  };

  const createOffer = async () => {
    if (!peerConnection.current) {
      console.error('Peer connection not initialized');
      return;
    }
    const offer = await peerConnection.current.createOffer();
    await peerConnection.current.setLocalDescription(offer);
    await sendOffer(offer);
    console.log('Offer created and sent:', offer);
  };

  const createAnswer = async () => {
    if (!peerConnection.current) {
      console.error('Peer connection not initialized');
      return;
    }
    const answer = await peerConnection.current.createAnswer();
    await peerConnection.current.setLocalDescription(answer);
    await sendAnswer(answer);
    console.log('Answer created and sent:', answer);
  };

  const setRemoteDescription = async (description) => {
    if (!peerConnection.current) {
      console.error('Peer connection not initialized');
      return;
    }
    await peerConnection.current.setRemoteDescription(new RTCSessionDescription(description));
    console.log('Remote description set:', description);

    // Process any queued ICE candidates
    if (iceCandidatesQueue.current) {
      iceCandidatesQueue.current.forEach(candidate => {
        addIceCandidate(candidate);
      });
      iceCandidatesQueue.current = []; // Clear the queue after processing
    } else {
      console.error('iceCandidatesQueue.current is null or undefined');
    }
  };

  const addIceCandidate = async (candidate) => {
    if (!peerConnection.current) {
      console.error('Peer connection not initialized');
      return;
    }

    if (peerConnection.current.remoteDescription) {
      await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
      console.log('ICE candidate added:', candidate);
    } else {
      // Queue the candidate if the remote description is not set yet
      iceCandidatesQueue.current.push(candidate);
      console.log('ICE candidate queued:', candidate);
    }
  };

  const sendOffer = async (offer) => {
    const offerDoc = doc(firestore, 'calls', recipientId);
    await setDoc(offerDoc, {
      type: 'offer',
      sdp: offer.sdp,
      userId: userId,
    });
    console.log('Offer sent to Firestore:', offer);
  };

  const sendAnswer = async (answer) => {
    const answerDoc = doc(firestore, 'calls', recipientId);
    await setDoc(answerDoc, {
      type: 'answer',
      sdp: answer.sdp,
      userId: userId,
    });
    console.log('Answer sent to Firestore:', answer);
  };

  const sendIceCandidate = async (candidate) => {
    const candidateCollection = collection(firestore, 'calls', recipientId, 'candidates');
    await addDoc(candidateCollection, candidate.toJSON());
    console.log('ICE candidate sent to Firestore:', candidate);
  };

  const cleanup = async () => {
    try {
      console.log('Cleaning up WebRTC connection and Firestore collections...');

    // Close the peer connection
    if (peerConnection.current) {
      peerConnection.current.close();
      peerConnection.current = null;
      console.log('Peer connection closed');
    }

    // Stop all local media tracks
    if (localStream.current) {
      localStream.current.getTracks().forEach(track => track.stop());
      localStream.current = null;
      console.log('Local media tracks stopped');
    }

    // Clear the video elements
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }

      await deleteDoc(doc(firestore, 'calls', userId));
      const candidateCollection = collection(firestore, 'calls', userId, 'candidates');
      const candidateDocs = await getDocs(candidateCollection);
      candidateDocs.forEach(async (doc) => {
        await deleteDoc(doc.ref);
      });
      setRecipientId(null);
      console.log('Cleanup completed');
    } catch (err) {
      console.error('Error during cleanup:', err);
    }
  };

  const initFirestoreListeners = () => {
    const callDoc = doc(firestore, 'calls', userId);
    onSnapshot(callDoc, (snapshot) => {
      const data = snapshot.data();
      if (data) {
        if (data.type === 'offer') {
          console.log('Offer received from Firestore:', data);
          setRemoteDescription({ type: 'offer', sdp: data.sdp });
          createAnswer();
        } else if (data.type === 'answer') {
          console.log('Answer received from Firestore:', data);
          setRemoteDescription({ type: 'answer', sdp: data.sdp });
        }
      }
    });

    const candidateCollection = collection(firestore, 'calls', userId, 'candidates');
    onSnapshot(candidateCollection, (snapshot) => {
      snapshot.docChanges().forEach(change => {
        if (change.type === 'added') {
          const candidate = change.doc.data();
          console.log('ICE candidate received from Firestore:', candidate);
          addIceCandidate(candidate);
        }
      });
    });
  };

  useEffect(() => {
    initFirestoreListeners(); // Initialize Firestore listeners here

    const handleUnload = () => {
      cleanup();
    };

    window.addEventListener('beforeunload', handleUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleUnload);
      cleanup();
    };
  }, []);

  return {
    init,
    createPeerConnection,
    createOffer,
    createAnswer,
    setRemoteDescription,
    addIceCandidate,
    peerConnection,
    cleanup
  };
};
