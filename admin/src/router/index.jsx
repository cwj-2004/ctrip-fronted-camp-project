	import { createBrowserRouter } from 'react-router-dom';
	import Login from '../pages/Login';
	import AdminLayout from '../layouts/AdminLayout';
	import Dashboard from '../pages/Dashboard';
	const router = createBrowserRouter([
	  {
	    path: '/',
	    element: <Login />,
	  },
	  {
	    path: '/login',
	    element: <Login />,
	  },
	  {
	    // 后台管理系统的父路由
	    path: '/admin',
	    element: <AdminLayout />,
	    children: [
	      // 子路由：首页
	      {
	        path: 'dashboard',
	        element: <Dashboard />,
	      },
	      // 预留：商户录入页
	      {
	        path: 'add',
	        element: <Dashboard />, // 暂时先用首页占位
	      },
	      // 预留：管理员审核页
	      {
	        path: 'audit',
	        element: <Dashboard />, // 暂时先用首页占位
	      },
	    ],
	  },
	]);
	export default router;