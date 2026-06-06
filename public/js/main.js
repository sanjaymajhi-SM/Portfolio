/* ============================================
   NABIN PORTFOLIO — Main JS
   ============================================ */

'use strict';

// ── Nav scroll effect ─────────────────────────────
const nav = document.getElementById('nav');
const handleScroll = () => {
  nav.classList.toggle('scrolled', window.scrollY > 20);
};
window.addEventListener('scroll', handleScroll, { passive: true });

// ── Active nav link ───────────────────────────────
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a[data-section]');

const observerOptions = { rootMargin: '-40% 0px -55% 0px', threshold: 0 };
const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      navLinks.forEach((a) => {
        a.classList.toggle('active', a.dataset.section === entry.target.id);
      });
    }
  });
}, observerOptions);

sections.forEach((s) => sectionObserver.observe(s));

// ── Mobile nav toggle ─────────────────────────────
const navToggle = document.getElementById('nav-toggle');
const navMenu = document.getElementById('nav-menu');

navToggle?.addEventListener('click', () => {
  const open = navMenu.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', open);
  document.body.style.overflow = open ? 'hidden' : '';
});

navMenu?.querySelectorAll('a').forEach((a) => {
  a.addEventListener('click', () => {
    navMenu.classList.remove('open');
    navToggle.setAttribute('aria-expanded', false);
    document.body.style.overflow = '';
  });
});

// ── Reveal on scroll ──────────────────────────────
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('visible'), i * 80);
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 }
);

document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));

// ── Contact Form ──────────────────────────────────
const contactForm = document.getElementById('contact-form');
const formFeedback = document.getElementById('form-feedback');
const submitBtn = document.getElementById('form-submit');

contactForm?.addEventListener('submit', async (e) => {
  e.preventDefault();

  // Clear previous errors
  document.querySelectorAll('.form-error').forEach((el) => {
    el.style.display = 'none';
    el.textContent = '';
  });
  formFeedback.style.display = 'none';

  const name = contactForm.name.value.trim();
  const email = contactForm.email.value.trim();
  const message = contactForm.message.value.trim();

  // Client-side validation
  let hasError = false;
  if (!name) {
    showFieldError('name-error', 'Name is required.');
    hasError = true;
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showFieldError('email-error', 'Valid email is required.');
    hasError = true;
  }
  if (!message || message.length < 10) {
    showFieldError('message-error', 'Message must be at least 10 characters.');
    hasError = true;
  }
  if (hasError) return;

  submitBtn.disabled = true;
  submitBtn.textContent = 'Sending...';

  try {
    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, message }),
    });

    const data = await res.json();

    if (res.ok && data.success) {
      formFeedback.className = 'form-feedback success';
      formFeedback.textContent = data.message;
      formFeedback.style.display = 'block';
      contactForm.reset();
    } else if (data.errors) {
      data.errors.forEach((err) => {
        const fieldMap = { name: 'name-error', email: 'email-error', message: 'message-error' };
        if (fieldMap[err.path]) showFieldError(fieldMap[err.path], err.msg);
      });
    } else {
      throw new Error(data.error || 'Something went wrong');
    }
  } catch (err) {
    formFeedback.className = 'form-feedback error';
    formFeedback.textContent = err.message || 'Failed to send message. Please try again.';
    formFeedback.style.display = 'block';
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Send Message →';
  }
});

function showFieldError(id, msg) {
  const el = document.getElementById(id);
  if (el) { el.textContent = msg; el.style.display = 'block'; }
}

// ── Load Projects ─────────────────────────────────
async function loadProjects() {
  const container = document.getElementById('projects-container');
  if (!container) return;

  try {
    const res = await fetch('/api/projects');
    const data = await res.json();

    container.innerHTML = data.projects.map((p, i) => {
      const isFeatured = p.highlight && i === 0;
      const statusClass = p.status === 'Live' ? 'live' : p.status === 'In Progress' ? 'progress' : 'done';
      return `
        <article class="project-card${isFeatured ? ' featured' : ''} reveal">
          <div>
            <div class="project-meta">
              <span class="project-num mono">0${i + 1}</span>
              <span class="project-status ${statusClass}">${p.status}</span>
            </div>
            <h3>${p.title}</h3>
            <p class="project-desc">${p.description}</p>
            <div class="project-tags">
              ${p.tags.map((t) => `<span class="tag">${t}</span>`).join('')}
            </div>
            <a href="#contact" class="project-link">View details →</a>
          </div>
          ${isFeatured ? `<div class="project-card-visual" aria-hidden="true">
            <div style="width:100%;height:200px;background:var(--bg-primary);border:1px solid var(--border);border-radius:12px;display:flex;align-items:center;justify-content:center;">
              <span style="font-family:var(--font-mono);font-size:12px;color:var(--text-muted);">${p.shortTitle}</span>
            </div>
          </div>` : ''}
        </article>`;
    }).join('');

    // Re-observe new reveal elements
    container.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));
  } catch (err) {
    container.innerHTML = '<p style="color:var(--text-secondary);font-size:14px;">Could not load projects.</p>';
  }
}

loadProjects();

// ── Chatbot ───────────────────────────────────────
const chatTrigger = document.getElementById('chat-trigger');
const chatPanel = document.getElementById('chat-panel');
const chatClose = document.getElementById('chat-close');
const chatMessages = document.getElementById('chat-messages');
const chatInput = document.getElementById('chat-input');
const chatSend = document.getElementById('chat-send');

let chatHistory = []; // { role: 'user'|'assistant', content: string }
let chatInitialized = false;

chatTrigger?.addEventListener('click', () => {
  const open = !chatPanel.classList.contains('open');
  chatPanel.classList.toggle('open', open);
  chatTrigger.setAttribute('aria-expanded', open);
  if (open) {
    if (!chatInitialized) {
      appendBotMessage("Hi! 👋 I'm Nabin's AI assistant. Ask me anything about his skills, projects, or how to get in touch.");
      chatInitialized = true;
    }
    setTimeout(() => chatInput.focus(), 300);
  }
});

chatClose?.addEventListener('click', () => {
  chatPanel.classList.remove('open');
  chatTrigger.setAttribute('aria-expanded', false);
});

chatSend?.addEventListener('click', sendMessage);
chatInput?.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

// Auto-resize textarea
chatInput?.addEventListener('input', () => {
  chatInput.style.height = 'auto';
  chatInput.style.height = Math.min(chatInput.scrollHeight, 120) + 'px';
});

async function sendMessage() {
  const text = chatInput.value.trim();
  if (!text || chatSend.disabled) return;

  chatInput.value = '';
  chatInput.style.height = 'auto';
  chatSend.disabled = true;

  appendUserMessage(text);
  chatHistory.push({ role: 'user', content: text });

  const typingEl = appendTyping();

  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: chatHistory }),
    });

    typingEl.remove();

    const data = await res.json();

    if (res.ok && data.reply) {
      appendBotMessage(data.reply);
      chatHistory.push({ role: 'assistant', content: data.reply });
    } else {
      appendBotMessage(data.error || 'Sorry, something went wrong. Please try again.');
    }
  } catch {
    typingEl.remove();
    appendBotMessage('Network error. Please check your connection and try again.');
  } finally {
    chatSend.disabled = false;
    chatInput.focus();
  }
}

function appendUserMessage(text) {
  const el = document.createElement('div');
  el.className = 'chat-msg user';
  el.innerHTML = `<div class="chat-bubble">${escapeHtml(text)}</div>`;
  chatMessages.appendChild(el);
  scrollChat();
}

function appendBotMessage(text) {
  const el = document.createElement('div');
  el.className = 'chat-msg assistant';
  el.innerHTML = `<div class="chat-bubble">${escapeHtml(text)}</div>`;
  chatMessages.appendChild(el);
  scrollChat();
}

function appendTyping() {
  const el = document.createElement('div');
  el.className = 'chat-typing';
  el.setAttribute('aria-label', 'Typing...');
  el.innerHTML = '<span></span><span></span><span></span>';
  chatMessages.appendChild(el);
  scrollChat();
  return el;
}

function scrollChat() {
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
