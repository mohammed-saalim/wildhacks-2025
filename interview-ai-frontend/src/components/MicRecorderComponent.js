import React, { useState, useRef } from 'react';
import MicRecorder from 'mic-recorder-to-mp3';
import { Button, IconButton, CircularProgress } from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import StopIcon from '@mui/icons-material/Stop';

const recorder = new MicRecorder({ bitRate: 128 });

const MicRecorderComponent = ({ onTranscript }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [loading, setLoading] = useState(false);

  const startRecording = () => {
    recorder.start()
      .then(() => setIsRecording(true))
      .catch(console.error);
  };

  const stopRecording = () => {
    setLoading(true);
    recorder.stop()
      .getMp3()
      .then(async ([buffer, blob]) => {
        const file = new File(buffer, 'audio.mp3', { type: blob.type });
        const uploadUrl = await uploadToAssemblyAI(file);
        const transcript = await requestTranscript(uploadUrl);
        onTranscript(transcript);
        setLoading(false);
        setIsRecording(false);
      })
      .catch(console.error);
  };

  const uploadToAssemblyAI = async (file) => {
    const res = await fetch('https://api.assemblyai.com/v2/upload', {
      method: 'POST',
      headers: { 'authorization': process.env.REACT_APP_ASSEMBLYAI_API_KEY },
      body: file,
    });

    const data = await res.json();
    return data.upload_url;
  };

  const requestTranscript = async (uploadUrl) => {
    const transcriptRes = await fetch('https://api.assemblyai.com/v2/transcript', {
      method: 'POST',
      headers: {
        'authorization': process.env.REACT_APP_ASSEMBLYAI_API_KEY,
        'content-type': 'application/json'
      },
      body: JSON.stringify({ audio_url: uploadUrl })
    });

    const transcriptData = await transcriptRes.json();
    const transcriptId = transcriptData.id;

    let transcriptResult = null;
    while (true) {
      const pollingRes = await fetch(`https://api.assemblyai.com/v2/transcript/${transcriptId}`, {
        headers: { 'authorization': process.env.REACT_APP_ASSEMBLYAI_API_KEY }
      });
      const pollingData = await pollingRes.json();
      if (pollingData.status === 'completed') {
        transcriptResult = pollingData.text;
        break;
      } else if (pollingData.status === 'error') {
        throw new Error(pollingData.error);
      }
      await new Promise(resolve => setTimeout(resolve, 3000)); // Wait 3 sec
    }

    return transcriptResult;
  };

  return (
    <div style={{ marginTop: '1rem' }}>
      {loading ? (
        <CircularProgress />
      ) : isRecording ? (
        <IconButton color="error" onClick={stopRecording} sx={{ border: '1px solid #ccc', p: 1 }}>
          <StopIcon />
        </IconButton>
      ) : (
        <IconButton color="primary" onClick={startRecording} sx={{ border: '1px solid #ccc', p: 1 }}>
          <MicIcon />
        </IconButton>
      )}
    </div>
  );
};

export default MicRecorderComponent;
