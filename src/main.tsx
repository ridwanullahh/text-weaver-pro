
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

console.log('Starting TextWeaver Pro application...');

// Clear any previous errors
const clearErrors = () => {
  const errorElements = document.querySelectorAll('[data-error="true"]');
  errorElements.forEach(el => el.remove());
};

try {
  clearErrors();
  
  const rootElement = document.getElementById("root");
  if (!rootElement) {
    throw new Error("Root element not found");
  }

  const root = createRoot(rootElement);
  root.render(<App />);
  
  console.log('Application rendered successfully');
  console.log('Available features: PDF, DOCX, TXT, RTF, CSV, XLSX, HTML, XML, JSON, EPUB support');
} catch (error) {
  console.error('Failed to start application:', error);
  document.body.innerHTML = `
    <div style="display: flex; justify-content: center; align-items: center; height: 100vh; background: #1a1a1a; color: white; font-family: system-ui;" data-error="true">
      <div style="text-align: center; max-width: 500px; padding: 2rem;">
        <h1 style="color: #ef4444; margin-bottom: 1rem;">Application Error</h1>
        <p style="margin-bottom: 1rem;">Failed to start the TextWeaver Pro application.</p>
        <p style="font-size: 0.875rem; color: #94a3b8; margin-bottom: 2rem;">Check console for details: ${error instanceof Error ? error.message : 'Unknown error'}</p>
        <button onclick="window.location.reload()" style="padding: 12px 24px; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 500;">
          Reload Application
        </button>
      </div>
    </div>
  `;
}
