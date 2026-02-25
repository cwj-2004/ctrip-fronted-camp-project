	// src/pages/AddHotel.jsx
	// 酒店录入页面：用于商户提交新酒店信息
	import { Card, message, Form } from 'antd';
	import { useNavigate } from 'react-router-dom';
	import { useState } from 'react';
	import HotelForm from '../components/HotelForm';
	import dayjs from 'dayjs';
	import { API_BASE_URL } from '../config';
	const AddHotel = () => {
	  const navigate = useNavigate();
	  const [form] = Form.useForm();
	  const [loading, setLoading] = useState(false);
	  const onFinish = async (values) => {
	    const userStr = window.sessionStorage.getItem('user');
	    if (!userStr) {
	      message.error('您未登录，请先登录');
	      navigate('/login');
	      return;
	    }
	    const currentUser = JSON.parse(userStr);
	    const hotelData = {
	      ...values,
	      openDate: values.openDate ? dayjs(values.openDate).format('YYYY-MM-DD') : '',
	      status: 'pending',
	      createdBy: currentUser.username,
	      createdAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
	      rooms: values.rooms ? values.rooms.map((room, index) => ({
	        id: Date.now() + index,
	        name: room.name,
	        price: room.price
	      })) : []
	    };
	    setLoading(true);
	    try {
	      const response = await fetch(`${API_BASE_URL}/hotels`, {
	        method: 'POST',
	        headers: { 'Content-Type': 'application/json' },
	        body: JSON.stringify(hotelData),
	      });
	      if (response.ok) {
	        message.success('酒店提交成功，请等待管理员审核！');
	        form.resetFields();
	        navigate('/admin/dashboard');
	      } else {
	        message.error('提交失败，请重试');
	      }
	    } catch (error) {
	      console.error(error);
	      message.error('网络错误');
	    } finally {
	      setLoading(false);
	    }
	  };
	  return (
	    <Card title="录入新酒店" bordered={false}>
	      <HotelForm form={form} onFinish={onFinish} loading={loading} />
	    </Card>
	  );
	};
	export default AddHotel;