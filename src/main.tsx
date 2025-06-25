
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

console.log('Starting TextWeaver Pro application...');

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element not found");
}

const root = createRoot(rootElement);
root.render(<App />);

console.log('Application rendered successfully');
