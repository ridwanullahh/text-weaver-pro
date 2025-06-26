
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

console.log('Starting TextWeaver Pro application...');

try {
  const rootElement = document.getElementById("root");
  if (!rootElement) {
    throw new Error("Root element not found");
  }

  const root = createRoot(rootElement);
  root.render(<App />);
  
  console.log('Application rendered successfully');
} catch (error) {
  console.error('Failed to start application:', error);
  document.body.innerHTML = `
    <div style="display: flex; justify-content: center; align-items: center; height: 100vh; background: #1a1a1a; color: white; font-family: system-ui;">
      <div style="text-align: center;">
        <h1>Application Error</h1>
        <p>Failed to start the application. Check console for details.</p>
        <button onclick="window.location.reload()" style="padding: 10px 20px; margin-top: 20px; background: #6366f1; color: white; border: none; border-radius: 5px; cursor: pointer;">
          Reload Page
        </button>
      </div>
    </div>
  `;
}
