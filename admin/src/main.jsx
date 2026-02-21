	import { StrictMode } from 'react'
	import { createRoot } from 'react-dom/client'
	import './index.css'
	import { RouterProvider } from 'react-router-dom'
	import router from './router/index' // 引入刚才配置的路由
	createRoot(document.getElementById('root')).render(
	  <StrictMode>
	    <RouterProvider router={router} />
	  </StrictMode>,
	)
