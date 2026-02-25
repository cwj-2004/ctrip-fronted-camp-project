	// src/pages/EditHotel.jsx
	// 酒店编辑与审核页面：商户编辑信息，管理员进行审核操作
	import { useEffect, useState } from 'react';
	import { useParams, useNavigate } from 'react-router-dom';
	import { Card, Divider, Alert, Space, Button, Input, message, Descriptions, Image, Tag, Form, Timeline, Empty } from 'antd';
	import { ArrowLeftOutlined, ClockCircleOutlined } from '@ant-design/icons';
	import HotelForm from '../components/HotelForm';
	import dayjs from 'dayjs';
	import { API_BASE_URL } from '../config'; 
	const EditHotel = () => {
	  const { id } = useParams();
	  const navigate = useNavigate();
	  const [form] = Form.useForm();
	  const [loading, setLoading] = useState(true);
	  const [submitting, setSubmitting] = useState(false);
	  const [hotelData, setHotelData] = useState(null);
	  const userStr = window.sessionStorage.getItem('user');
	  const currentUser = userStr ? JSON.parse(userStr) : null;
	  const isAdmin = currentUser?.role === 'admin';
	  // 获取酒店详情
	  useEffect(() => {
	    const fetchDetail = async () => {
	      try {
	        const res = await fetch(`${API_BASE_URL}/hotels/${id}`);
	        const data = await res.json();
	        if (data.openDate) data.openDate = dayjs(data.openDate);
	        form.setFieldsValue(data);
	        setHotelData(data);
	      } catch (error) {
	        console.error(error);
	        message.error('获取详情失败');
	      } finally {
	        setLoading(false);
	      }
	    };
	    fetchDetail();
	  }, [id, form]);
	  // 商户提交修改
	  const onFinish = async (values) => {
	    setSubmitting(true);
	    const finalCreatedAt = hotelData.createdAt || dayjs().format('YYYY-MM-DD HH:mm:ss');
	    const submitData = {
	      ...values,
	      openDate: values.openDate ? dayjs(values.openDate).format('YYYY-MM-DD') : '',
	      rooms: values.rooms ? values.rooms.map((room, index) => ({
	        id: Date.now() + index,
	        name: room.name,
	        price: room.price
	      })) : [],
	      status: 'pending',
	      rejectReason: '',
	      createdAt: finalCreatedAt
	    };
	    try {
	      const res = await fetch(`${API_BASE_URL}/hotels/${id}`, {
	        method: 'PATCH',
	        headers: { 'Content-Type': 'application/json' },
	        body: JSON.stringify(submitData),
	      });
	      if (res.ok) {
	        message.success('修改已提交，请等待管理员重新审核');
	        navigate('/admin/dashboard');
	      }
	    } catch (error) {
	      console.error(error);
	      message.error('网络错误');
	    } finally {
	      setSubmitting(false);
	    }
	  };
	  // 更新酒店状态
	  const handleStatusChange = async (newStatus, reason = '') => {
	    const actionTextMap = { published: '审核通过', rejected: '驳回申请', offline: '强制下线' };
	    const newLog = {
	      time: dayjs().format('YYYY-MM-DD HH:mm:ss'),
	      operator: currentUser.username,
	      action: actionTextMap[newStatus] || '状态变更',
	      detail: reason || '无'
	    };
	    const currentHistory = hotelData.operationHistory || [];
	    const updatedHistory = [...currentHistory, newLog];
	    const payload = { 
	      status: newStatus, 
	      rejectReason: reason,
	      operationHistory: updatedHistory 
	    };
	    try {
	      const res = await fetch(`${API_BASE_URL}/hotels/${id}`, {
	        method: 'PATCH',
	        headers: { 'Content-Type': 'application/json' },
	        body: JSON.stringify(payload),
	      });
	      if (res.ok) {
	        message.success('状态已更新');
	        setHotelData({ ...hotelData, status: newStatus, operationHistory: updatedHistory });
	      }
	    } catch (error) {
	      console.error(error);
	      message.error('操作失败');
	    }
	  };
	  if (!currentUser) return <div style={{ padding: 20 }}>请登录</div>;
	  // ================== 管理员视图 ==================
	  if (isAdmin) {
	    const statusMap = { published: '已发布', pending: '待审核', rejected: '已驳回', offline: '已下线' };
	    const statusColor = { published: 'green', pending: 'orange', rejected: 'red', offline: 'default' };
	    return (
	      <Card 
	        title={
	          <div style={{ display: 'flex', alignItems: 'center' }}>
	            <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate('/admin/dashboard')}>返回</Button>
	            <span style={{ marginLeft: 10 }}>酒店审核与管理</span>
	          </div>
	        } 
	        loading={loading}
	      >
	        {hotelData && (
	          <>
	            {/* 状态提示 */}
	            <Alert 
	              title={`当前状态: ${statusMap[hotelData.status]}`} 
	              type={hotelData.status === 'published' ? 'success' : hotelData.status === 'rejected' ? 'error' : 'warning'} 
	              style={{ marginBottom: 20 }} 
	              showIcon
	            />
	            {/* 操作面板 */}
	            <Card size="small" title="操作面板" style={{ marginBottom: 20, background: '#fafafa' }}>
	              <Space direction="vertical" style={{ width: '100%' }}>
	                <Button type="primary" onClick={() => handleStatusChange('published')} disabled={hotelData.status === 'published'}>审核通过并发布</Button>
	                <Input.Search placeholder="输入驳回理由" enterButton="驳回" onSearch={(value) => handleStatusChange('rejected', value)} />
	                <Button danger onClick={() => handleStatusChange('offline')} disabled={hotelData.status === 'offline'}>强制下线</Button>
	              </Space>
	            </Card>
	            <Divider>酒店信息详情</Divider>
	            <Descriptions bordered column={2}>
	              <Descriptions.Item label="酒店名称">{hotelData.name_zh} / {hotelData.name_en}</Descriptions.Item>
	              <Descriptions.Item label="星级">{hotelData.star} 星</Descriptions.Item>
	              <Descriptions.Item label="地址">{hotelData.address}</Descriptions.Item>
	              <Descriptions.Item label="底价">¥{hotelData.basePrice}</Descriptions.Item>
	              <Descriptions.Item label="周边信息">{hotelData.surroundings || '暂无'}</Descriptions.Item>
	              <Descriptions.Item label="状态"><Tag color={statusColor[hotelData.status]}>{statusMap[hotelData.status]}</Tag></Descriptions.Item>
	              {hotelData.rejectReason && (<Descriptions.Item label="驳回原因" span={2}><span style={{ color: 'red' }}>{hotelData.rejectReason}</span></Descriptions.Item>)}
	              <Descriptions.Item label="主图" span={2}>{hotelData.mainImage ? <Image width={200} src={hotelData.mainImage} /> : '暂无'}</Descriptions.Item>
	              <Descriptions.Item label="房型信息" span={2}>{hotelData.rooms?.map(r => <Tag key={r.id}>{r.name}: ¥{r.price}</Tag>)}</Descriptions.Item>
	            </Descriptions>
	            <Divider>操作历史记录</Divider>
	            <Card variant="borderless" style={{ background: '#fafafa', maxHeight: 400, overflow: 'auto' }}>
	              {hotelData.operationHistory && hotelData.operationHistory.length > 0 ? (
	                <Timeline
	                  mode="start"
	                  items={hotelData.operationHistory.map(log => ({
	                    color: log.action.includes('通过') ? 'green' : log.action.includes('驳回') ? 'red' : 'blue',
	                    content: (
	                      <>
	                        <p style={{ fontWeight: 'bold', marginBottom: 4 }}>
	                          {log.action} <Tag color="default">{log.operator}</Tag>
	                        </p>
	                        <p style={{ fontSize: 12, color: '#666', marginBottom: 2 }}>
	                          <ClockCircleOutlined /> {log.time}
	                        </p>
	                        {log.detail && log.detail !== '无' && (
	                          <p style={{ fontSize: 12, color: '#999' }}>详情：{log.detail}</p>
	                        )}
	                      </>
	                    )
	                  }))}
	                />
	              ) : (
	                <Empty description="暂无操作历史记录" image={Empty.PRESENTED_IMAGE_SIMPLE} />
	              )}
	            </Card>
	          </>
	        )}
	      </Card>
	    );
	  }
	  // ================== 商户视图 ==================
	  const getStatusAlert = () => {
	    if (!hotelData) return null;
	    switch (hotelData.status) {
	      case 'published':
	        return <Alert message="当前酒店已发布。修改信息后，酒店将重新变为“待审核”状态。" type="info" showIcon style={{ marginBottom: 24 }} />;
	      case 'pending':
	        return <Alert message="当前酒店正在审核中。" type="warning" showIcon style={{ marginBottom: 24 }} />;
	      case 'rejected':
	        return <Alert message={`审核未通过。原因：${hotelData.rejectReason || '无'}`} type="error" showIcon style={{ marginBottom: 24 }} />;
	      default:
	        return null;
	    }
	  };
	  return (
	    <Card 
	      title={
	        <div style={{ display: 'flex', alignItems: 'center' }}>
	          <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate('/admin/dashboard')}>返回</Button>
	          <span style={{ marginLeft: 10 }}>编辑酒店信息</span>
	        </div>
	      } 
	      loading={loading}
	    >
	      {getStatusAlert()}
	      <HotelForm form={form} onFinish={onFinish} loading={submitting} isEdit={true} />
	    </Card>
	  );
	};
	export default EditHotel;