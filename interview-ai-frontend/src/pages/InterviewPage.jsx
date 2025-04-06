// InterviewPage.jsx
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

const InterviewPage = () => {
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const intervalRef = useRef(null);
  const [emotionData, setEmotionData] = useState(null);
  const [recorderReady, setRecorderReady] = useState(false);
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const initCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        const types = [
          "video/webm;codecs=vp9",
          "video/webm;codecs=vp8",
          "video/webm",
          "video/mp4", // for Safari
        ];

        let recorder;
        for (const type of types) {
          if (MediaRecorder.isTypeSupported(type)) {
            recorder = new MediaRecorder(stream, { mimeType: type });
            break;
          }
        }

        if (!recorder) {
          setErrorMsg("MediaRecorder: No supported MIME type. Try Chrome or Firefox.");
          return;
        }

        recorder.ondataavailable = (event) => {
          if (event.data.size > 0) recordedChunksRef.current.push(event.data);
        };

        mediaRecorderRef.current = recorder;
        setRecorderReady(true);
      } catch (err) {
        console.error("Camera/mic access error:", err);
        setErrorMsg("Failed to access camera or microphone.");
      }
    };

    initCamera();
    return () => intervalRef.current && clearInterval(intervalRef.current);
  }, []);

  const captureAndSendFrame = async () => {
    const video = videoRef.current;
    if (!video) return;

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const blob = await new Promise((resolve) =>
      canvas.toBlob(resolve, "image/jpeg")
    );
    if (!blob) return;

    const formData = new FormData();
    formData.append("video", blob, "frame.jpg");

    try {
      const res = await fetch("http://127.0.0.1:8000/analyze-emotion/", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      setEmotionData(data);
    } catch (err) {
      console.error("Backend error:", err);
    }
  };

  const startInterview = () => {
    if (!recorderReady || !mediaRecorderRef.current) {
      alert("MediaRecorder not ready.");
      return;
    }

    recordedChunksRef.current = [];
    mediaRecorderRef.current.start();
    intervalRef.current = setInterval(() => captureAndSendFrame(), 1000);
    setInterviewStarted(true);
  };

  const finishInterview = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
      clearInterval(intervalRef.current);

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, {
          type: mediaRecorderRef.current.mimeType,
        });
        const videoUrl = URL.createObjectURL(blob);
        navigate("/feedback", { state: { emotionData, videoUrl } });
      };
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Live Interview Emotion Detection 🎥</h1>
      {errorMsg && (
        <div className="bg-red-100 text-red-700 p-4 mb-4 rounded">{errorMsg}</div>
      )}
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className="rounded-lg border shadow-md w-full max-w-xl"
      />
      {!interviewStarted ? (
        <button
          onClick={startInterview}
          disabled={!recorderReady}
          className={`mt-4 px-4 py-2 rounded text-white ${
            recorderReady
              ? "bg-green-600 hover:bg-green-700"
              : "bg-gray-400 cursor-not-allowed"
          }`}
        >
          {recorderReady ? "Start Interview" : "Loading..."}
        </button>
      ) : (
        <button
          onClick={finishInterview}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Finish Interview
        </button>
      )}
    </div>
  );
};

export default InterviewPage;
