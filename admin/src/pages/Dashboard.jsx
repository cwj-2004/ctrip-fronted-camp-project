	import { Table, Button, Space, Tag, message, Popconfirm, Card, Modal, Input, Form, Row, Col, Statistic, Empty, Select, Breadcrumb } from 'antd';
	import { AuditOutlined, CheckCircleOutlined, CloseCircleOutlined, FileSearchOutlined, HomeOutlined } from '@ant-design/icons';
	import { useEffect, useState, useCallback } from 'react';
	import { useNavigate } from 'react-router-dom';
	const Dashboard = () => {
	  const [hotels, setHotels] = useState([]);
	  const [loading, setLoading] = useState(true);
	  const [isModalVisible, setIsModalVisible] = useState(false);
	  const [currentRejectId, setCurrentRejectId] = useState(null);
	  const [form] = Form.useForm();
	  const navigate = useNavigate();
	  const [searchText, setSearchText] = useState('');
	  const [filterStatus, setFilterStatus] = useState('all');
	  // 获取用户信息 - 这里只用于渲染，不作为 useEffect 的依赖
	  const userStr = window.sessionStorage.getItem('user');
	  const currentUser = userStr ? JSON.parse(userStr) : null;
	  // 【关键修复】
	  // 1. 将 fetchHotels 的依赖设为空数组 []，确保函数引用不变
	  // 2. 在函数内部读取 sessionStorage，而不是闭包中的 currentUser
	  const fetchHotels = useCallback(async () => {
	    // 内部重新获取用户信息，避免依赖外部变化的引用
	    const localUserStr = window.sessionStorage.getItem('user');
	    const localUser = localUserStr ? JSON.parse(localUserStr) : null;
	    if (!localUser) return;
	    setLoading(true);
	    try {
	      const response = await fetch('http://localhost:3001/hotels');
	      const data = await response.json();
	      // 使用内部获取的 localUser 进行判断
	      const filteredData = localUser.role === 'merchant' 
	        ? data.filter(item => item.createdBy === localUser.username) 
	        : data;
	      setHotels(filteredData);
	    } catch (error) {
	      console.error(error);
	      message.error('获取酒店列表失败');
	    } finally {
	      setLoading(false);
	    }
	  }, []); // 依赖为空，函数永远不变
	  useEffect(() => { 
	    fetchHotels(); 
	  }, [fetchHotels]); // fetchHotels 不变，useEffect 只会在挂载时执行一次
	  // --- 操作逻辑 ---
	  const handleApprove = async (id) => {
	    await fetch(`http://localhost:3001/hotels/${id}`, { 
	      method: 'PATCH', 
	      headers: { 'Content-Type': 'application/json' }, 
	      body: JSON.stringify({ status: 'published' }) 
	    });
	    message.success('审核通过'); 
	    fetchHotels();
	  };
	  const showRejectModal = (id) => { 
	    setCurrentRejectId(id); 
	    setIsModalVisible(true); 
	  };
	  const handleRejectConfirm = async () => {
	    try {
	      const values = await form.validateFields();
	      await fetch(`http://localhost:3001/hotels/${currentRejectId}`, { 
	        method: 'PATCH', 
	        headers: { 'Content-Type': 'application/json' }, 
	        body: JSON.stringify({ status: 'rejected', rejectReason: values.reason }) 
	      });
	      message.warning('已驳回'); 
	      setIsModalVisible(false); 
	      form.resetFields(); 
	      fetchHotels();
	    } catch (e) { 
	      console.error(e); 
	    }
	  };
	  const handleOffline = async (id) => {
	    await fetch(`http://localhost:3001/hotels/${id}`, { 
	      method: 'PATCH', 
	      headers: { 'Content-Type': 'application/json' }, 
	      body: JSON.stringify({ status: 'offline' }) 
	    });
	    message.info('已下线'); 
	    fetchHotels();
	  };
	  const handleOnline = async (id) => {
	    await fetch(`http://localhost:3001/hotels/${id}`, { 
	      method: 'PATCH', 
	      headers: { 'Content-Type': 'application/json' }, 
	      body: JSON.stringify({ status: 'published' }) 
	    });
	    message.success('已上线'); 
	    fetchHotels();
	  };
	  // --- 统计数据计算 ---
	  const stats = {
	    total: hotels.length,
	    pending: hotels.filter(h => h.status === 'pending').length,
	    published: hotels.filter(h => h.status === 'published').length,
	    rejected: hotels.filter(h => h.status === 'rejected').length,
	  };
	  // --- 前端筛选逻辑 ---
	  const displayData = hotels.filter(h => {
	    const matchSearch = h.name_zh.toLowerCase().includes(searchText.toLowerCase());
	    const matchStatus = filterStatus === 'all' || h.status === filterStatus;
	    return matchSearch && matchStatus;
	  });
	  // 【修复 API 警告】操作列按钮
	  const columns = [
	    { title: '酒店名称', dataIndex: 'name_zh', key: 'name_zh', width: 200, fixed: 'left' },
	    { title: '创建者', dataIndex: 'createdBy', key: 'createdBy' },
	    {
	      title: '状态', dataIndex: 'status', key: 'status',
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
	      title: '操作', key: 'action', width: 300, fixed: 'right',
	      render: (_, record) => {
	        // 这里的 currentUser 是渲染作用域的，用于 UI 判断没问题
	        const isMerchant = currentUser?.role === 'merchant';
	        const isAdmin = currentUser?.role === 'admin';
	        return (
	          <Space size="small" wrap>
	            {isMerchant && (record.status === 'pending' || record.status === 'rejected') && (
	              <Button type="link" size="small" onClick={() => navigate(`/admin/edit/${record.id}`)}>编辑</Button>
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
	      {/* 面包屑导航 */}
	      <Breadcrumb
	        items={[
	          { href: '/admin/dashboard', title: <><HomeOutlined /><span>首页</span></> },
	          { title: currentUser.role === 'admin' ? '审核管理' : '我的酒店' },
	        ]}
	        style={{ marginBottom: 16 }}
	      />
	      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
	        <h2>{currentUser.role === 'admin' ? '酒店审核管理' : '我的酒店'}</h2>
	        {currentUser.role === 'merchant' && (
	          <Button type="primary" onClick={() => navigate('/admin/add')}>+ 录入新酒店</Button>
	        )}
	      </div>
	      {/* 统计卡片区域 - 修复 Statistic API 警告 */}
	      <Row gutter={16} style={{ marginBottom: 24 }}>
	        <Col xs={12} sm={6}>
	          <Card hoverable>
	            <Statistic 
	              title="总数" 
	              value={stats.total} 
	              valueStyle={{ color: '#1890ff' }} 
	            />
	          </Card>
	        </Col>
	        <Col xs={12} sm={6}>
	          <Card hoverable>
	            <Statistic 
	              title="待审核" 
	              value={stats.pending} 
	              prefix={<AuditOutlined style={{ color: '#faad14' }} />} 
	            />
	          </Card>
	        </Col>
	        <Col xs={12} sm={6}>
	          <Card hoverable>
	            <Statistic 
	              title="已发布" 
	              value={stats.published} 
	              prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />} 
	            />
	          </Card>
	        </Col>
	        <Col xs={12} sm={6}>
	          <Card hoverable>
	            <Statistic 
	              title="已驳回" 
	              value={stats.rejected} 
	              prefix={<CloseCircleOutlined style={{ color: '#ff4d4f' }} />} 
	            />
	          </Card>
	        </Col>
	      </Row>
	      {/* 搜索筛选区域 */}
	      <Card style={{ marginBottom: 16 }}>
	        <Space>
	          <Input.Search
	            placeholder="搜索酒店名称"
	            allowClear
	            onChange={(e) => setSearchText(e.target.value)}
	            style={{ width: 240 }}
	            prefix={<FileSearchOutlined />}
	          />
	          <Select defaultValue="all" style={{ width: 120 }} onChange={(value) => setFilterStatus(value)}>
	            <Select.Option value="all">全部状态</Select.Option>
	            <Select.Option value="pending">待审核</Select.Option>
	            <Select.Option value="published">已发布</Select.Option>
	            <Select.Option value="rejected">已驳回</Select.Option>
	          </Select>
	        </Space>
	      </Card>
	      {/* 表格区域 */}
	      <Card>
	        <Table 
	          dataSource={displayData} 
	          columns={columns} 
	          rowKey="id" 
	          loading={loading} 
	          scroll={{ x: 1000 }}
	          pagination={{ pageSize: 10, showSizeChanger: false }}
	          locale={{ emptyText: <Empty description="暂无数据，请尝试添加或修改筛选条件" /> }}
	        />
	      </Card>
	      {/* 驳回弹窗 */}
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