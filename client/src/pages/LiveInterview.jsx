// LIVESTREAM INTERVIEW - BASIC EXAMPLE
// This shows how to access camera/microphone and display video

import { useState, useRef, useEffect } from 'react';
import { Video, VideoOff, Mic, MicOff, Phone, Loader2 } from 'lucide-react';
import Navbar from '../components/navbar';

const LiveInterview = () => {
  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [status, setStatus] = useState('idle'); // idle, connecting, connected, ended

  // Request camera/microphone access
  const startMedia = async () => {
    setIsConnecting(true);
    try {
      // This is the key WebRTC function - requests access to camera & mic
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,    // Enable camera
        audio: true     // Enable microphone
      });
      
      setStream(mediaStream);
      
      // Display video in the video element
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      
      setStatus('connected');
    } catch (err) {
      console.error('Error accessing media devices:', err);
      alert('Could not access camera/microphone. Please grant permissions.');
    }
    setIsConnecting(false);
  };

  // Stop all media tracks
  const stopMedia = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setStatus('ended');
  };

  // Toggle video on/off
  const toggleVideo = () => {
    if (stream) {
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOn(videoTrack.enabled);
      }
    }
  };

  // Toggle audio on/off
  const toggleAudio = () => {
    if (stream) {
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioOn(audioTrack.enabled);
      }
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  return (
    <div className="bg-black min-h-screen">
      <Navbar />
      
      <div className="pt-24 px-4 pb-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-white text-center mb-8">
            Live AI Interview Demo
          </h1>

          {/* Video Container */}
          <div className="relative bg-gray-900 rounded-2xl overflow-hidden aspect-video mb-6">
            {status === 'connected' && stream ? (
              <>
                {/* Main video (self-view) */}
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                
                {/* AI Interviewer overlay (placeholder) */}
                <div className="absolute bottom-4 left-4 bg-black/70 rounded-xl p-3 flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#EFBF04] rounded-full flex items-center justify-center">
                    <span className="text-black font-bold">AI</span>
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">AI Interviewer</p>
                    <p className="text-green-400 text-xs">Listening...</p>
                  </div>
                </div>
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                {isConnecting ? (
                  <div className="text-center">
                    <Loader2 className="w-12 h-12 text-[#EFBF04] animate-spin mx-auto mb-4" />
                    <p className="text-gray-400">Connecting to camera & microphone...</p>
                  </div>
                ) : status === 'ended' ? (
                  <div className="text-center">
                    <p className="text-gray-400">Interview ended</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <Video className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400 mb-4">
                      Click below to enable camera & microphone
                    </p>
                    <button
                      onClick={startMedia}
                      className="bg-[#EFBF04] text-black font-bold py-3 px-6 rounded-xl hover:bg-yellow-400 transition"
                    >
                      Start Interview
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Controls */}
          {status === 'connected' && (
            <div className="flex justify-center gap-4">
              <button
                onClick={toggleVideo}
                className={`p-4 rounded-full ${isVideoOn ? 'bg-gray-800 text-white' : 'bg-red-600 text-white'}`}
              >
                {isVideoOn ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
              </button>
              
              <button
                onClick={toggleAudio}
                className={`p-4 rounded-full ${isAudioOn ? 'bg-gray-800 text-white' : 'bg-red-600 text-white'}`}
              >
                {isAudioOn ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
              </button>
              
              <button
                onClick={stopMedia}
                className="p-4 rounded-full bg-red-600 text-white"
              >
                <Phone className="w-6 h-6 rotate-[135deg]" />
              </button>
            </div>
          )}

          {/* Info */}
          <div className="mt-8 bg-gray-900/50 rounded-xl p-6">
            <h3 className="text-white font-bold mb-4">How it works:</h3>
            <ol className="text-gray-400 space-y-2">
              <li>1. <strong className="text-white">getUserMedia()</strong> - Requests camera & mic access from browser</li>
              <li>2. <strong className="text-white">WebRTC stream</strong> - Creates real-time video/audio stream</li>
              <li>3. <strong className="text-white">Speech-to-Text</strong> - Convert mic input to text (Whisper API)</li>
              <li>4. <strong className="text-white">AI Processing</strong> - LLM analyzes answer and generates response</li>
              <li>5. <strong className="text-white">Text-to-Speech</strong> - AI speaks questions (ElevenLabs/Google TTS)</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveInterview;
