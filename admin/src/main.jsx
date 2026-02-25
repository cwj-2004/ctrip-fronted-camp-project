	// src/main.jsx
	// 应用入口文件：挂载 React 根节点
	import { StrictMode } from 'react';
	import { createRoot } from 'react-dom/client';
	import './index.css';
	import App from './App';
	createRoot(document.getElementById('root')).render(
	  <StrictMode>
	    <App />
	  </StrictMode>,
	);
