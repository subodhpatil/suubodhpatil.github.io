/**
 * AI Platform Summary Selector
 * Allows users to open their preferred AI platform with a pre-filled summary prompt
 */

class AISummarySelector {
  constructor(promptText) {
    this.promptText = promptText;
    this.platforms = {
      claude: {
        name: 'Claude',
        url: 'https://claude.ai',
        icon: '🤖'
      },
      chatgpt: {
        name: 'ChatGPT',
        url: 'https://chat.openai.com',
        icon: '✨'
      },
      gemini: {
        name: 'Gemini',
        url: 'https://gemini.google.com/chat',
        icon: '🔮'
      },
      perplexity: {
        name: 'Perplexity',
        url: 'https://www.perplexity.ai',
        icon: '🌐'
      },
      copilot: {
        name: 'Copilot',
        url: 'https://copilot.microsoft.com',
        icon: '⚡'
      }
    };
  }

  async handleSelection(event) {
    const platformKey = event.target.value;
    if (!platformKey) return;

    const platform = this.platforms[platformKey];

    try {
      // Copy prompt to clipboard
      await navigator.clipboard.writeText(this.promptText);

      // Show feedback
      this.showFeedback('Prompt copied! Opening ' + platform.name + '...');

      // Open platform in new tab
      window.open(platform.url, '_blank');

      // Reset dropdown
      event.target.value = '';
    } catch (err) {
      console.error('Failed to copy prompt:', err);
      this.showFeedback('Failed to copy. Please try again.');
    }
  }

  showFeedback(message) {
    const feedback = document.createElement('div');
    feedback.className = 'ai-selector-feedback';
    feedback.textContent = message;
    document.body.appendChild(feedback);

    setTimeout(() => {
      feedback.classList.add('fade-out');
      setTimeout(() => feedback.remove(), 300);
    }, 2000);
  }
}

// Auto-initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  const promptElement = document.querySelector('[data-ai-prompt]');
  if (promptElement) {
    const prompt = promptElement.getAttribute('data-ai-prompt');
    const selector = new AISummarySelector(prompt);

    // Wire up existing dropdown
    const existingSelect = document.querySelector('.ai-selector-dropdown');
    if (existingSelect) {
      existingSelect.addEventListener('change', (e) => {
        selector.handleSelection(e);
      });
    }
  }
});
