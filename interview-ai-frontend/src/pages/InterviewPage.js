import React, { useState, useRef, useEffect } from 'react';
import { Box, Button, Container, Typography, Paper, Stack, TextField } from '@mui/material';
import EmotionRecorder from './EmotionRecorder';
import { generateQuestions, evaluateAnswers } from '../utils/gemini';
import { useLocation, useNavigate } from 'react-router-dom';

const InterviewPage = () => {
  const location = useLocation();

  // 👇 Use passed role or default to React Developer
  const role = location.state?.role || "React Developer";
  const [conversation, setConversation] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [interviewEnded, setInterviewEnded] = useState(false);
  const [evaluation, setEvaluation] = useState(null);
  const [qaPairs, setQaPairs] = useState([]);


  const recorderRef = useRef(null);
  const containerRef = useRef(null);
  const navigate = useNavigate();

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

  

  const handleStartInterview = () => {
    setInterviewStarted(true);
    recorderRef.current?.start();
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
      setInterviewEnded(true); // ✅ Let user manually click "Finish Interview"
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
  
    await recorderRef.current?.stop();
    const result = recorderRef.current?.getResult?.();
  
    let geminiEvaluation = null;
    try {
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
   
    
   

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleNextQuestion();
    }
  };

  return (
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

        {interviewStarted && !interviewEnded && (
          <Box mt={3}>
            <TextField
              fullWidth
              multiline
              rows={3}
              placeholder="Type your answer..."
              variant="outlined"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={handleKeyDown}
            />
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
              {currentQuestionIndex < questions.length && (
                <Button variant="contained" onClick={handleNextQuestion}>Next Question</Button>
              )}
              {answers.length >= 3 && (
                <Button variant="outlined" color="error" onClick={handleFinishInterview}>
                  Finish Interview
                </Button>
              )}
            </>
          )}
        </Stack>
      </Container>
    </Box>
  );
};

export default InterviewPage;
