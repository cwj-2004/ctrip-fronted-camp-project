	import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
	import Login from './pages/Login';
	import AdminLayout from './layouts/AdminLayout';
	import Dashboard from './pages/Dashboard';
	import AddHotel from './pages/AddHotel';
	import EditHotel from './pages/EditHotel';
	function App() {
	  return (
	    <BrowserRouter>
	      <Routes>
	        {/* 1. 默认跳转：访问 / 自动跳转到登录页 */}
	        <Route path="/" element={<Navigate to="/login" />} />
	        {/* 2. 登录页 */}
	        <Route path="/login" element={<Login />} />
	        {/* 3. 后台管理页（嵌套路由） */}
	        <Route path="/admin" element={<AdminLayout />}>
	          {/* 索引路由：访问 /admin 自动跳转到 dashboard */}
	          <Route index element={<Navigate to="dashboard" />} />
	          <Route path="dashboard" element={<Dashboard />} />
	          <Route path="add" element={<AddHotel />} />
	          <Route path="edit/:id" element={<EditHotel />} />
	        </Route>
	        {/* 4. 404 兜底 (可选加分项) */}
	        <Route path="*" element={<div style={{textAlign: 'center', marginTop: 100}}>404 页面走丢了</div>} />
	      </Routes>
	    </BrowserRouter>
	  );
	}
	export default App;
