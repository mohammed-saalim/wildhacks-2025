import React, { useState, useRef, useEffect } from 'react';
import { Box, Button, Container, Typography, Paper, Stack, TextField } from '@mui/material';
import EmotionRecorder from './EmotionRecorder';
import { generateQuestions, evaluateAnswers } from '../utils/gemini';
import { useLocation, useNavigate } from 'react-router-dom';
import { NavigationGuard }  from '../components/NavigationGuard'; // adjust path as needed
import MicRecorderComponent from '../components/MicRecorderComponent';



const InterviewPage = () => {
  const location = useLocation();

  // 👇 Use passed role or default to React Developer
  const { role = "General Knowledge Interview", useVoice = false } = location.state || {};

  const [conversation, setConversation] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [interviewEnded, setInterviewEnded] = useState(false);
  const [evaluation, setEvaluation] = useState(null);


  const recorderRef = useRef(null);
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  const navigate = useNavigate();


  useEffect(() => {
    if (useVoice) {
      const helloAudio = new Audio('/trump-hello.mp3');
      const timer = setTimeout(() => {
        helloAudio.play().catch((err) => {
          console.error("Audio playback error:", err);
        });
      }, 2000); // 2 seconds delay after page loads
  
      return () => clearTimeout(timer); // Clean up timer on unmount
    }
  }, [useVoice]);
  

  useEffect(() => {
    const fetchQuestions = async () => {
      const qns = await generateQuestions(role);
      setQuestions(qns);
      if (qns.length > 0) {
        setConversation([{ sender: 'llm', message: qns[0] }]);
      }
    };
    fetchQuestions();
  }, [role]);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [conversation]);

  useEffect(() => {
    const lastMsg = conversation[conversation.length - 1];
    if (interviewStarted && useVoice && lastMsg?.sender === 'llm') {
      playTrumpVoice(lastMsg.message);
    }
  }, [conversation, useVoice, interviewStarted]);
  
  

  useEffect(() => {
    return () => {
      // 👋 Component is unmounting — stop the recorder & camera
      recorderRef.current?.stop?.();
      
      // Stop any playing audio
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current.currentTime = 0;
      }
    };
  }, []);

  

  

  const handleStartInterview = () => {
    setInterviewStarted(true);
    recorderRef.current?.start();

    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);


  };

  const handleNextQuestion = () => {
    if (!userInput.trim()) return;
  
    const updatedAnswers = [...answers, userInput];
    console.log("📩 handleNextQuestion() - Updated Answers:", updatedAnswers);
  
    setAnswers(updatedAnswers);
    setConversation(prev => [...prev, { sender: 'user', message: userInput }]);
    setUserInput('');


  
    const nextIndex = currentQuestionIndex + 1;
  
    if (nextIndex < questions.length) {
      setCurrentQuestionIndex(nextIndex);
      setConversation(prev => [...prev, { sender: 'llm', message: questions[nextIndex] }]);
    } else {
      // setInterviewEnded(true); // ✅ Let user manually click "Finish Interview"
      // ⛔️ Don't call handleFinishInterview() automatically here
    }
  };
    
  
  const handleFinishInterview = async (maybeAnswers) => {
    const finalPairs =
      Array.isArray(maybeAnswers) && maybeAnswers.every(p => typeof p === 'object' && p.question)
        ? maybeAnswers
        : answers.map((answer, i) => ({ question: questions[i], answer }));
  
    if (!Array.isArray(finalPairs)) {
      console.error("❌ Invalid finalPairs format:", maybeAnswers);
      return;
    }
  
    console.log("📦 Final QA pairs to evaluate:", finalPairs);

    setInterviewEnded(true);

    // Stop any playing audio when interview ends
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
      console.log("🔇 Stopped audio - interview ended");
    }

    // const audio = new Audio('/god-bless-america.mp3');
    // audio.play().catch((err) => {
    //   console.error("Audio playback error:", err);
    // });

  
    await recorderRef.current?.stop();
    const result = recorderRef.current?.getResult?.();
  
    let geminiEvaluation = null;
    try {
      // geminiEvaluation = await evaluateAnswers(finalPairs, role);
      geminiEvaluation = await evaluateAnswers(finalPairs, role);


      setEvaluation(geminiEvaluation);
      console.log("✅ Evaluation from Gemini:", geminiEvaluation);
    } catch (err) {
      console.error("❌ Evaluation error:", err);
    }
  
    navigate("/feedback", {
      state: {
        emotionData: result?.emotionData || null,
        videoUrl: result?.videoUrl || null,
        evaluation: geminiEvaluation
      }
    });
  };

  // Keep track of current audio to stop it when new question comes
  const currentAudioRef = useRef(null);

  const playTrumpVoice = async (text) => {
    // Stop any currently playing audio
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
      console.log("🔇 Stopped previous audio for new question");
    }

    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/2rAJlOPLNwFC089BJZA1/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': 'sk_0d66951faf24561f682ef4c02b18641189dddb26a1bc9ad4',
      },
      body: JSON.stringify({
        text,
        voice_settings: {
          stability: 0.7,
          similarity_boost: 0.75
        }
      }),
    });
  
    if (!response.ok) {
      console.error("🚨 ElevenLabs error", await response.text());
      return;
    }
  
    const audioBlob = await response.blob();
    const audioURL = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioURL);
    
    // Store reference to current audio
    currentAudioRef.current = audio;
    
    audio.play().catch(console.error);
  };
  
  
   
    
   

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleNextQuestion();
    }
  };

  return (
    <>
<NavigationGuard
  when={interviewStarted && !interviewEnded}
  onLeave={async () => {
    await recorderRef.current?.stop?.();
    console.log("🎥 Camera stopped on navigation");
  }}
/>

    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(to bottom right, #e0e7ff, #f8fafc)', py: 6 }}>
      <Container maxWidth="md">
        <Typography variant="h4" fontWeight={700} textAlign="center" gutterBottom sx={{ color: '#3f3d56' }}>
          Interview Session
        </Typography>

        <Box position="relative">
          <Paper elevation={4} sx={{ p: 3, minHeight: '450px', borderRadius: 4, overflowY: 'auto' }} ref={containerRef}>
            <Box sx={{ mb: 2 }}>
              {conversation.map((msg, idx) => (
                <Box
                  key={idx}
                  sx={{
                    display: 'flex',
                    justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                    mb: 1
                  }}
                >
                  <Box
                    sx={{
                      maxWidth: '75%',
                      bgcolor: msg.sender === 'user' ? '#d8b4fe' : '#f1f5f9',
                      p: 2,
                      borderRadius: 3
                    }}
                  >
                    <Typography variant="body2">
                      {msg.sender === 'llm' ? `Interviewer: ${msg.message}` : `You: ${msg.message}`}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </Paper>
          <EmotionRecorder ref={recorderRef} />
        </Box>

        {interviewStarted && !interviewEnded && currentQuestionIndex < questions.length &&(
          <Box mt={3}>
          <Stack direction="row" spacing={1} alignItems="flex-end" mt={3}>
          <TextField
            fullWidth
            multiline
            rows={3}
            data-testid="answer-input"
            placeholder="Type or speak your answer..."
            variant="outlined"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={handleKeyDown}
            inputRef={inputRef}
          />

          <Box sx={{ display: 'flex', alignItems: 'flex-end', pb: 0.5 }}>
            <MicRecorderComponent
              onTranscript={(transcript) => {
                setUserInput(transcript);
                inputRef.current?.focus();
              }}
            />
          </Box>
        </Stack>
        <Typography
        variant="caption"
        color="text.secondary"
        textAlign="left"
        sx={{ mt: 1, ml: 0.5 }}
      >
        🔊 Answers must be spoken in English for recorder to work correctly.
      </Typography>



          </Box>
        )}
                
        <Stack direction="row" spacing={2} justifyContent="center" mt={4}>
          {!interviewStarted ? (
            <Button
              variant="contained"
              onClick={handleStartInterview}
              sx={{ minWidth: 180, backgroundColor: '#3b82f6', textTransform: 'none' }}
            >
              Start Interview
            </Button>
          ) : (
            <>
              {currentQuestionIndex < questions.length-1 && !interviewEnded && (
                <Button
                  variant="contained"
                  onClick={handleNextQuestion}
                  disabled={!userInput.trim()}
                >
                  Next Question
                </Button>
              )}
              {answers.length >= 1 && !interviewEnded && (
                <Button
                  variant="outlined"
                  color="error"
                  onClick={handleFinishInterview}
                >
                  Finish Interview
                </Button>
              )}
            </>
          )}
        </Stack>

      </Container>
    </Box>
    </>
  );
};

export default InterviewPage;
