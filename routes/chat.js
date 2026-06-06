const express = require('express');
const router = express.Router();

// Portfolio context for the AI assistant
const SYSTEM_PROMPT = `You are Nabin's personal AI assistant on his portfolio website.
Nabin is a Full Stack Developer based in Kathmandu, Nepal.

About Nabin:
- Full Stack Developer with expertise in React, Node.js, Python, and cloud technologies
- Currently pursuing studies in software engineering and UX/UI design
- Passionate about building user-centric applications and solving real-world problems
- Works on academic projects including Smart Restaurant Management System (SRMS)
- Also skilled in UX/UI design (Figma, user research)
- Based in Kathmandu, Nepal

Technical Skills:
- Frontend: React, Next.js, TypeScript, HTML5, CSS3, Tailwind CSS
- Backend: Node.js, Express, Python, Django, REST APIs
- Database: PostgreSQL, MongoDB, MySQL, Redis
- Tools: Git, Docker, Figma, VS Code, Postman
- Cloud: AWS, Vercel, Netlify

Projects:
1. Smart Restaurant Management System (SRMS) - Research project with QR ordering, real-time kitchen display, analytics
2. Nagarik App UX Redesign - UX/UI redesign of Nepal's government citizen app
3. Portfolio Website - This site itself, built with Node.js + Express + AI chatbot

Your role:
- Answer questions about Nabin's skills, experience, and projects warmly and professionally
- Help visitors understand what Nabin can do and how to contact him
- Be concise — keep replies under 3 sentences unless a detailed answer is clearly needed
- If asked about something you don't know, suggest they contact Nabin directly
- Do NOT make up projects, skills, or personal details not mentioned above
- Be friendly, professional, and represent Nabin well

Respond in plain text only, no markdown formatting.`;

router.post('/', async (req, res) => {
  const { messages } = req.body;

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'Messages array is required.' });
  }

  // Validate message structure
  const validMessages = messages.filter(
    (m) => m && typeof m.role === 'string' && typeof m.content === 'string'
  );

  if (validMessages.length === 0) {
    return res.status(400).json({ error: 'No valid messages provided.' });
  }

  // Cap conversation history to last 10 messages to control token usage
  const trimmedMessages = validMessages.slice(-10);

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.json({
      reply: "Hi! I'm Nabin's AI assistant. The AI backend isn't configured yet — please add the ANTHROPIC_API_KEY to your .env file. In the meantime, feel free to use the contact form to reach Nabin directly!",
    });
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 512,
        system: SYSTEM_PROMPT,
        messages: trimmedMessages,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Anthropic API error:', response.status, errorData);
      return res.status(502).json({
        error: 'AI service temporarily unavailable. Please try again shortly.',
      });
    }

    const data = await response.json();
    const reply = data.content?.[0]?.text || 'Sorry, I could not generate a response.';

    res.json({ reply });
  } catch (err) {
    console.error('Chat route error:', err.message);
    res.status(500).json({
      error: 'Something went wrong. Please try again.',
    });
  }
});

module.exports = router;
