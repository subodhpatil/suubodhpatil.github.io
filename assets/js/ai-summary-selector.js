/**
 * AI Platform Summary Selector
 * Allows users to open their preferred AI platform with a pre-filled summary prompt
 */

(function() {
  const platforms = {
    claude: { name: 'Claude', url: 'https://claude.ai' },
    chatgpt: { name: 'ChatGPT', url: 'https://chat.openai.com' },
    gemini: { name: 'Gemini', url: 'https://gemini.google.com/chat' },
    perplexity: { name: 'Perplexity', url: 'https://www.perplexity.ai' },
    copilot: { name: 'Copilot', url: 'https://copilot.microsoft.com' }
  };

  function showFeedback(message) {
    const feedback = document.createElement('div');
    feedback.className = 'ai-selector-feedback';
    feedback.textContent = message;
    document.body.appendChild(feedback);

    setTimeout(() => {
      feedback.classList.add('fade-out');
      setTimeout(() => feedback.remove(), 300);
    }, 2000);
  }

  async function handlePlatformSelect(event) {
    const platformKey = event.target.value;
    if (!platformKey) return;

    const platform = platforms[platformKey];
    const promptElement = document.querySelector('[data-ai-prompt]');

    if (!promptElement) {
      console.error('No prompt element found');
      return;
    }

    const prompt = promptElement.getAttribute('data-ai-prompt');

    try {
      // Copy prompt to clipboard
      await navigator.clipboard.writeText(prompt);
      showFeedback('Prompt copied! Opening ' + platform.name + '...');

      // Open platform in new tab
      setTimeout(() => {
        window.open(platform.url, '_blank');
      }, 300);

      // Reset dropdown
      event.target.value = '';
    } catch (err) {
      console.error('Clipboard failed:', err);
      showFeedback('Failed to copy. Paste manually or try another method.');
      window.open(platform.url, '_blank');
    }
  }

  // Initialize when DOM is ready
  function init() {
    const selectors = document.querySelectorAll('.ai-selector-dropdown');
    console.log('Found ' + selectors.length + ' AI selector dropdowns');

    selectors.forEach((select) => {
      select.addEventListener('change', handlePlatformSelect);
    });
  }

  // Run on DOMContentLoaded and also as fallback
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Also try to init on window load
  window.addEventListener('load', init);
})();
