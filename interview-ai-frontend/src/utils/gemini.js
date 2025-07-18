const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY;
const BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

export const generateQuestions = async (role) => {
  try {
    const prompt = `Generate 6 interview questions for the role of a ${role}. 
      Each question should be clear and relevant to assess a candidate’s practical understanding. Just give the questions so that I can use them for my AI Interview App, Also include emotion behind words using special characters like exclamatory, (...), UPPER CASE (if necessary) so the AI voice can use them to give good voice, I dont think its needed for technical questions.`;

//     const prompt = `Generate exactly 6 precise and relevant interview questions for the role of a ${role}. 
// Each question should assess the candidate’s practical understanding and real-world skills, and it should not be too long. 

// Format the output as a plain array of questions (no numbering or bullets), so I can render each question in each iteration.

// Also, include emotional cues (like excitement, curiosity, or seriousness) using exclamatory marks, pauses (...), or emphasis where appropriate. These cues will help the AI voice sound expressive and realistic during delivery. (dont send emotions/signs in words just special characters like ! and (...) )`;

    const response = await fetch(`${BASE_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
      }),
    });

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const questions = text
      .split("\n")
      .filter((line) => line.trim())
      .map((q) => q.replace(/^\d+\.\s*/, "").trim());

    console.log("📩 Questions from Gemini:", questions);
    return questions;
  } catch (error) {
    console.error("❌ Gemini generateQuestions error:", error);
    return [];
  }
};

export async function evaluateAnswers(pairs, role) {
  if (!Array.isArray(pairs)) {
    console.error("❌ Gemini: evaluateAnswers received invalid pairs:", pairs);
    return { summary: "Invalid data for evaluation.", score: 0 };
  }

  console.log("Final QA pairs sent to Gemini:", JSON.stringify(pairs, null, 2));

  const prompt = `Evaluate the following answers for a ${role} interview. 
  Provide your evaluation in two parts:
  1. A paragraph summary about the candidate's performance.
  2. A final score out of 100 (as a number) based on correctness, clarity, and completeness.

  Format your response like this:
  **Summary:** Your paragraph summary here.
  **Score:** Numeric value here

  ${pairs.map((pair, i) => `Q${i + 1}: ${pair.question}\nA${i + 1}: ${pair.answer}`).join('\n\n')}
  `;

  try {
    const response = await fetch(`${BASE_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    const text = response.ok
      ? await response.json().then(data =>
          data?.candidates?.[0]?.content?.parts?.[0]?.text || "")
      : "No evaluation returned.";

    // Extract score from the response using regex
    const scoreMatch = text.match(/\*\*Score:\*\*\s*(\d+)/i);
    const numericScore = scoreMatch ? parseInt(scoreMatch[1], 10) : 0;

    const summaryText = text.replace(/\*\*Score:\*\*\s*\d+/i, '').replace("**Summary:**", '').trim();

    return {
      summary: summaryText,
      score: numericScore
    };
  } catch (error) {
    console.error("❌ Gemini evaluateAnswers error:", error);
    return {
      summary: "Evaluation failed due to an API error.",
      score: 0
    };
  }
}
      
