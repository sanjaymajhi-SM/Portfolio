const express = require('express');
const router = express.Router();

// In a real app, this would come from a database
const PROJECTS = [
  {
    id: 1,
    title: 'Smart Restaurant Management System',
    shortTitle: 'SRMS',
    description: 'A full-stack research project proposing a QR-based ordering system with real-time kitchen display, table management, and analytics dashboard — addressing inefficiencies in traditional restaurant workflows.',
    tags: ['Research', 'Node.js', 'React', 'MongoDB', 'UX Design'],
    category: 'Full Stack',
    year: 2024,
    status: 'In Progress',
    highlight: true,
  },
  {
    id: 2,
    title: 'Nagarik App UX Redesign',
    shortTitle: 'Nagarik UX',
    description: 'UX/UI redesign of Nepal\'s official government citizen portal, featuring improved information architecture, Bikram Sambat calendar integration, and accessibility improvements for the local context.',
    tags: ['Figma', 'UX Research', 'UI Design', 'User Testing'],
    category: 'UX/UI',
    year: 2024,
    status: 'Completed',
    highlight: true,
  },
  {
    id: 3,
    title: 'Portfolio Website',
    shortTitle: 'This Site',
    description: 'This portfolio — a full-stack web app built with Node.js, Express, and vanilla JavaScript, featuring an AI-powered chatbot assistant, contact form with email notifications, and dark minimalist design.',
    tags: ['Node.js', 'Express', 'JavaScript', 'AI Integration'],
    category: 'Full Stack',
    year: 2025,
    status: 'Live',
    highlight: false,
  },
];

// GET /api/projects
router.get('/', (req, res) => {
  const { category, limit } = req.query;
  let result = [...PROJECTS];

  if (category) {
    result = result.filter(
      (p) => p.category.toLowerCase() === category.toLowerCase()
    );
  }

  if (limit) {
    const n = parseInt(limit, 10);
    if (!isNaN(n) && n > 0) result = result.slice(0, n);
  }

  res.json({ projects: result, total: result.length });
});

// GET /api/projects/:id
router.get('/:id', (req, res) => {
  const project = PROJECTS.find((p) => p.id === parseInt(req.params.id, 10));
  if (!project) {
    return res.status(404).json({ error: 'Project not found.' });
  }
  res.json(project);
});

module.exports = router;
