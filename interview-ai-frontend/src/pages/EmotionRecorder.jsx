import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';

const EmotionRecorder = forwardRef((props, ref) => {
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const intervalRef = useRef(null);
  const recordedVideoUrlRef = useRef(null);
  const [latestEmotion, setLatestEmotion] = useState(null);
  const emotionSnapshots = useRef([]);

  const [recorderReady, setRecorderReady] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [initAttempts, setInitAttempts] = useState(0);
  const backendBaseUrl = process.env.REACT_APP_BACKEND_URL || "http://localhost:8000";
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);


  useImperativeHandle(ref, () => ({
    start: startInterview,
    stop: () => stopInterview(),
    getResult: getFinalResult
  }));

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    let retryTimer;
  
    const initCamera = async (attempt = 0) => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (videoRef.current) videoRef.current.srcObject = stream;
  
        const mimeTypes = [
          'video/webm;codecs=vp9',
          'video/webm;codecs=vp8',
          'video/webm',
          'video/mp4'
        ];
  
        let recorder;
        for (const type of mimeTypes) {
          if (MediaRecorder.isTypeSupported(type)) {
            recorder = new MediaRecorder(stream, { mimeType: type });
            break;
          }
        }
  
        if (!recorder) {
          console.error('No supported MediaRecorder types found.');
          return;
        }
  
        recorder.ondataavailable = (event) => {
          if (event.data.size > 0) recordedChunksRef.current.push(event.data);
        };
  
        mediaRecorderRef.current = recorder;
        setRecorderReady(true);
        setCameraActive(true);
      } catch (err) {
        console.error('Camera/mic access error:', err);
        if (attempt < 5) {
          console.warn(`Retrying camera init... (${attempt + 1})`);
          retryTimer = setTimeout(() => initCamera(attempt + 1), 5000);
        } else {
          alert("Unable to access camera/mic after multiple attempts. Please check your browser settings.");
        }
      }
    };
  
    initCamera();
  
    return () => {
      clearTimeout(retryTimer);
      clearInterval(intervalRef.current);
    };
  }, []);
  
  const captureAndSendFrame = async () => {
    const video = videoRef.current;
    if (!video) return;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const blob = await new Promise((res) => canvas.toBlob(res, 'image/jpeg'));
    if (!blob) return;

    const formData = new FormData();
    formData.append('video', blob, 'frame.jpg');

    try {
      const res = await fetch(`${backendBaseUrl}/analyze-emotion/`, {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      emotionSnapshots.current.push(data);
      setLatestEmotion(data);
      console.log("📸 Emotion response:", data);
    } catch (err) {
      console.error('Backend error:', err);
    }
  };

  const startInterview = () => {
    if (!recorderReady || !mediaRecorderRef.current) {
      alert('MediaRecorder not ready.');
      return;
    }

    recordedChunksRef.current = [];
    emotionSnapshots.current = [];
    mediaRecorderRef.current.start();
    intervalRef.current = setInterval(() => captureAndSendFrame(), 1000);
  };

  const stopInterview = () => {
    return new Promise((resolve) => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.onstop = async () => {
          const blob = new Blob(recordedChunksRef.current, {
            type: mediaRecorderRef.current.mimeType,
          });
          const videoUrl = URL.createObjectURL(blob);
          recordedVideoUrlRef.current = videoUrl;
  
          await new Promise(r => setTimeout(r, 500));
          await captureAndSendFrame();
  
          // ✅ Stop the webcam stream
          const stream = videoRef.current?.srcObject;
          if (stream) {
            stream.getTracks().forEach(track => track.stop());
            videoRef.current.srcObject = null; // 🔁 release camera feed
          }
  
          setCameraActive(false); // 🔴 Hide red dot
          resolve();
        };
  
        clearInterval(intervalRef.current);
        mediaRecorderRef.current.stop();
      } else {
        // In case recorder was never started but camera is on
        const stream = videoRef.current?.srcObject;
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
          videoRef.current.srcObject = null;
        }
  
        setCameraActive(false);
        resolve();
      }
    });
  };
  

  const getFinalResult = () => {
    const presentFrames = emotionSnapshots.current.filter(e => e?.candidate_present);

    if (presentFrames.length === 0) {
      return {
        emotionData: {
          candidate_present: false,
          emotion_scores: {},
          stress_level: 0.0,
          is_confused: false,
          is_confident: false,
          focus_score: 0.0
        },
        videoUrl: recordedVideoUrlRef.current
      };
    }

    const last = presentFrames[presentFrames.length - 1];

    return {
      emotionData: last,
      videoUrl: recordedVideoUrlRef.current
    };
  };

  return (
    <>
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        style={{
          position: 'fixed',
          top: 100,
          right: 30,
          width: windowWidth < 600 ? '150px' : '250px',
          height: windowWidth < 600 ? '120px' : '200px',
          objectFit: 'cover',
          borderRadius: '12px',
          zIndex: 1000,
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          backgroundColor: '#000'
        }}
      />
      {cameraActive && (
        <div style={{
          position: 'fixed',
          top: windowWidth < 600 ? 100 + 8 : 100 + 12,
          right: windowWidth < 600 ? 30 + 8 : 30 + 12,
          width: windowWidth < 600 ? '10px' : '16px',
          height: windowWidth < 600 ? '10px' : '16px',
          backgroundColor: 'red',
          borderRadius: '50%',
          animation: 'blinker 1s linear infinite',
          zIndex: 1001
        }} />
      )}

      <style>
        {`@keyframes blinker {
          50% { opacity: 0; }
        }`}
      </style>
    </>
  );
});

export default EmotionRecorder;
