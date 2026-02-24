	// src/pages/Dashboard.jsx
	import { Table, Button, Space, Tag, message, Popconfirm, Card, Modal, Input, Form, Row, Col, Statistic, Empty, Select, Breadcrumb } from 'antd';
	import { AuditOutlined, CheckCircleOutlined, CloseCircleOutlined, FileSearchOutlined, HomeOutlined, EditOutlined } from '@ant-design/icons';
	import { useEffect, useState, useCallback } from 'react';
	import { useNavigate, Link } from 'react-router-dom';
	import dayjs from 'dayjs';
	const Dashboard = () => {
	  const [hotels, setHotels] = useState([]);
	  const [loading, setLoading] = useState(true);
	  const [isModalVisible, setIsModalVisible] = useState(false);
	  const [currentRejectId, setCurrentRejectId] = useState(null);
	  const [form] = Form.useForm();
	  const navigate = useNavigate();
	  const [searchText, setSearchText] = useState('');
	  const [filterStatus, setFilterStatus] = useState('all');
	  const userStr = window.sessionStorage.getItem('user');
	  const currentUser = userStr ? JSON.parse(userStr) : null;
	  const fetchHotels = useCallback(async () => {
	    const localUserStr = window.sessionStorage.getItem('user');
	    const localUser = localUserStr ? JSON.parse(localUserStr) : null;
	    if (!localUser) return;
	    setLoading(true);
	    try {
	      const response = await fetch('http://localhost:3001/hotels');
	      const data = await response.json();
	      const sortedData = data.sort((a, b) => (dayjs(b.createdAt).isAfter(dayjs(a.createdAt)) ? 1 : -1));
	      const filteredData = localUser.role === 'merchant' ? sortedData.filter(item => item.createdBy === localUser.username) : sortedData;
	      setHotels(filteredData);
	    } catch (error) {
	      console.error(error);
	      message.error('获取酒店列表失败');
	    } finally {
	      setLoading(false);
	    }
	  }, []);
	  useEffect(() => {
	    fetchHotels();
	  }, [fetchHotels]);
	  // 【新增】通用操作日志记录函数
	  const updateHotelWithLog = async (id, newStatus, operator, actionText, reason = '') => {
	    try {
	      // 1. 先获取现有数据，防止覆盖
	      const res = await fetch(`http://localhost:3001/hotels/${id}`);
	      const hotelData = await res.json();
	      // 2. 构造历史记录条目
	      const newLog = {
	        time: dayjs().format('YYYY-MM-DD HH:mm:ss'),
	        operator: operator,
	        action: actionText, // 如：审核通过、驳回、下线
	        detail: reason || '无'
	      };
	      // 3. 合并历史记录 (如果没有历史记录数组则新建)
	      const updatedHistory = hotelData.operationHistory ? [...hotelData.operationHistory, newLog] : [newLog];
	      // 4. 发送更新请求
	      const payload = {
	        status: newStatus,
	        rejectReason: reason,
	        operationHistory: updatedHistory
	      };
	      const updateRes = await fetch(`http://localhost:3001/hotels/${id}`, {
	        method: 'PATCH',
	        headers: { 'Content-Type': 'application/json' },
	        body: JSON.stringify(payload),
	      });
	      if (updateRes.ok) return true;
	      return false;
	    } catch (error) {
	      console.error(error);
	      return false;
	    }
	  };
	  // --- 操作逻辑修改 ---
	  const handleApprove = async (id) => {
	    const success = await updateHotelWithLog(id, 'published', currentUser.username, '审核通过');
	    if (success) {
	      message.success('审核通过');
	      fetchHotels();
	    } else {
	      message.error('操作失败');
	    }
	  };
	  const showRejectModal = (id) => {
	    setCurrentRejectId(id);
	    setIsModalVisible(true);
	  };
	  const handleRejectConfirm = async () => {
	    try {
	      const values = await form.validateFields();
	      const success = await updateHotelWithLog(currentRejectId, 'rejected', currentUser.username, '驳回申请', values.reason);
	      if (success) {
	        message.warning('已驳回');
	        setIsModalVisible(false);
	        form.resetFields();
	        fetchHotels();
	      } else {
	        message.error('操作失败');
	      }
	    } catch (e) {
	      console.error(e);
	    }
	  };
	  const handleOffline = async (id) => {
	    const success = await updateHotelWithLog(id, 'offline', currentUser.username, '强制下线');
	    if (success) {
	      message.info('已下线');
	      fetchHotels();
	    } else {
	      message.error('操作失败');
	    }
	  };
	  const handleOnline = async (id) => {
	    const success = await updateHotelWithLog(id, 'published', currentUser.username, '重新上线');
	    if (success) {
	      message.success('已上线');
	      fetchHotels();
	    } else {
	      message.error('操作失败');
	    }
	  };
	  const stats = {
	    total: hotels.length,
	    pending: hotels.filter(h => h.status === 'pending').length,
	    published: hotels.filter(h => h.status === 'published').length,
	    rejected: hotels.filter(h => h.status === 'rejected').length,
	  };
	  const displayData = hotels.filter(h => {
	    const matchSearch = h.name_zh.toLowerCase().includes(searchText.toLowerCase());
	    const matchStatus = filterStatus === 'all' || h.status === filterStatus;
	    return matchSearch && matchStatus;
	  });
	  const columns = [
	    {
	      title: '酒店名称',
	      dataIndex: 'name_zh',
	      key: 'name_zh',
	      width: 200,
	      fixed: 'left',
	      render: (text, record) => (
	        <Link to={`/admin/edit/${record.id}`} style={{ color: '#1890ff', fontWeight: '500' }}>
	          {text}
	        </Link>
	      )
	    },
	    { title: '创建者', dataIndex: 'createdBy', key: 'createdBy' },
	    {
	      title: '状态',
	      dataIndex: 'status',
	      key: 'status',
	      render: (status, record) => {
	        const colorMap = { published: 'green', pending: 'orange', rejected: 'red', offline: 'default' };
	        const textMap = { published: '已发布', pending: '待审核', rejected: '已驳回', offline: '已下线' };
	        return (
	          <div>
	            <Tag color={colorMap[status]}>{textMap[status]}</Tag>
	            {status === 'rejected' && record.rejectReason && <div style={{ color: 'red', fontSize: 12, marginTop: 4 }}>原因：{record.rejectReason}</div>}
	          </div>
	        );
	      },
	    },
	    {
	      title: '创建时间',
	      dataIndex: 'createdAt',
	      key: 'createdAt',
	      render: (text) => text ? dayjs(text).format('YYYY-MM-DD HH:mm') : '-',
	      sorter: (a, b) => dayjs(a.createdAt).unix() - dayjs(b.createdAt).unix(),
	      defaultSortOrder: 'descend',
	    },
	    {
	      title: '操作',
	      key: 'action',
	      width: 300,
	      fixed: 'right',
	      render: (_, record) => {
	        const isMerchant = currentUser?.role === 'merchant';
	        const isAdmin = currentUser?.role === 'admin';
	        return (
	          <Space size="small" wrap>
	            {isMerchant && (record.status === 'pending' || record.status === 'rejected' || record.status === 'published') && (
	              <Button type="link" size="small" icon={<EditOutlined />} onClick={() => navigate(`/admin/edit/${record.id}`)}>编辑</Button>
	            )}
	            {isMerchant && record.status === 'rejected' && (
	              <span style={{ color: 'red', fontSize: 12 }}>请修改后重提</span>
	            )}
	            {isAdmin && record.status === 'pending' && (
	              <>
	                <Popconfirm title="确定通过?" onConfirm={() => handleApprove(record.id)}>
	                  <Button type="link" size="small" style={{ color: 'green' }}>通过</Button>
	                </Popconfirm>
	                <Button type="link" size="small" danger onClick={() => showRejectModal(record.id)}>驳回</Button>
	              </>
	            )}
	            {isAdmin && record.status === 'published' && (
	              <Popconfirm title="确定下线?" onConfirm={() => handleOffline(record.id)}>
	                <Button type="link" size="small">下线</Button>
	              </Popconfirm>
	            )}
	            {isAdmin && record.status === 'offline' && (
	              <Popconfirm title="确定上线?" onConfirm={() => handleOnline(record.id)}>
	                <Button type="link" size="small" style={{ color: 'green' }}>上线</Button>
	              </Popconfirm>
	            )}
	          </Space>
	        );
	      },
	    },
	  ];
	  if (!currentUser) return <div style={{ padding: 20 }}>用户信息获取失败</div>;
	  return (
	    <div>
	      <Breadcrumb items={[ { href: '/admin/dashboard', title: <><HomeOutlined /><span>首页</span></> }, { title: currentUser.role === 'admin' ? '审核管理' : '我的酒店' }, ]} style={{ marginBottom: 16 }} />
	      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
	        <h2>{currentUser.role === 'admin' ? '酒店审核管理' : '我的酒店'}</h2>
	        {currentUser.role === 'merchant' && ( <Button type="primary" onClick={() => navigate('/admin/add')}>+ 录入新酒店</Button> )}
	      </div>
	      <Row gutter={16} style={{ marginBottom: 24 }}>
	        <Col xs={12} sm={6}><Card hoverable><Statistic title="总数" value={stats.total} valueStyle={{ color: '#1890ff' }} /></Card></Col>
	        <Col xs={12} sm={6}><Card hoverable><Statistic title="待审核" value={stats.pending} prefix={<AuditOutlined style={{ color: '#faad14' }} />} /></Card></Col>
	        <Col xs={12} sm={6}><Card hoverable><Statistic title="已发布" value={stats.published} prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />} /></Card></Col>
	        <Col xs={12} sm={6}><Card hoverable><Statistic title="已驳回" value={stats.rejected} prefix={<CloseCircleOutlined style={{ color: '#ff4d4f' }} />} /></Card></Col>
	      </Row>
	      <Card style={{ marginBottom: 16 }}>
	        <Space>
	          <Input.Search placeholder="搜索酒店名称" allowClear onChange={(e) => setSearchText(e.target.value)} style={{ width: 240 }} prefix={<FileSearchOutlined />} />
	          <Select defaultValue="all" style={{ width: 120 }} onChange={(value) => setFilterStatus(value)}>
	            <Select.Option value="all">全部状态</Select.Option>
	            <Select.Option value="pending">待审核</Select.Option>
	            <Select.Option value="published">已发布</Select.Option>
	            <Select.Option value="rejected">已驳回</Select.Option>
	          </Select>
	        </Space>
	      </Card>
	      <Card>
	        <Table dataSource={displayData} columns={columns} rowKey="id" loading={loading} scroll={{ x: 1000 }} pagination={{ pageSize: 10, showSizeChanger: false }} locale={{ emptyText: <Empty description="暂无数据" /> }} />
	      </Card>
	      <Modal title="驳回原因" open={isModalVisible} onOk={handleRejectConfirm} onCancel={() => setIsModalVisible(false)} okText="确认">
	        <Form form={form} layout="vertical">
	          <Form.Item name="reason" label="理由" rules={[{ required: true, message: '必填' }]}>
	            <Input.TextArea rows={4} />
	          </Form.Item>
	        </Form>
	      </Modal>
	    </div>
	  );
	};
	export default Dashboard;