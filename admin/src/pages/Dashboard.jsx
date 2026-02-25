	// src/pages/Dashboard.jsx
	// 仪表盘页面：展示酒店列表、统计数据及审核操作入口
	import { Table, Button, Space, Tag, message, Popconfirm, Card, Modal, Input, Form, Row, Col, Statistic, Empty, Select, Breadcrumb, Skeleton, Descriptions } from 'antd';
	import { 
	  AuditOutlined, CheckCircleOutlined, CloseCircleOutlined, FileSearchOutlined, HomeOutlined, 
	  EditOutlined, StopOutlined, ReloadOutlined, EnvironmentOutlined, 
	  StarFilled, StarOutlined, CrownTwoTone, UserOutlined 
	} from '@ant-design/icons';
	import { useEffect, useState, useCallback, useMemo } from 'react';
	import { useNavigate, Link } from 'react-router-dom';
	import dayjs from 'dayjs';
	import { Pie } from '@ant-design/plots';
	import { API_BASE_URL } from '../config'; 
	// 统计卡片样式
	const cardStyles = [
	  { background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: '#fff' },
	  { background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: '#fff' },
	  { background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: '#fff' },
	  { background: 'linear-gradient(135deg, #ff9a9e 0%, #fad0c4 100%)', color: '#fff' },
	];
	// 星级图标渲染
	const renderStarIcon = (star) => {
	  switch (star) {
	    case 5: return <CrownTwoTone twoToneColor="#722ed1" style={{ fontSize: 18 }} />;
	    case 4: return <StarFilled style={{ color: '#faad14', fontSize: 16 }} />;
	    default: return <StarOutlined style={{ color: '#8c8c8c', fontSize: 16 }} />;
	  }
	};
	const Dashboard = () => {
	  const [hotels, setHotels] = useState([]);
	  const [loading, setLoading] = useState(true);
	  const [isModalVisible, setIsModalVisible] = useState(false);
	  const [currentRejectId, setCurrentRejectId] = useState(null);
	  const [form] = Form.useForm();
	  const navigate = useNavigate();
	  const [searchText, setSearchText] = useState('');
	  const [filterStatus, setFilterStatus] = useState('all');
	  const [filterStar, setFilterStar] = useState('all');
	  const [filterCreator, setFilterCreator] = useState('all');
	  const userStr = window.sessionStorage.getItem('user');
	  const currentUser = userStr ? JSON.parse(userStr) : null;
	  // 获取酒店列表
	  const fetchHotels = useCallback(async () => {
	    const localUserStr = window.sessionStorage.getItem('user');
	    const localUser = localUserStr ? JSON.parse(localUserStr) : null;
	    if (!localUser) return;
	    setLoading(true);
	    try {
	      const response = await fetch(`${API_BASE_URL}/hotels`);
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
	  useEffect(() => { fetchHotels(); }, [fetchHotels]);
	  // 创建者筛选选项
	  const creatorOptions = useMemo(() => {
	    const uniqueCreators = [...new Set(hotels.map(h => h.createdBy))];
	    return [
	      { label: '全部创建者', value: 'all' },
	      ...uniqueCreators.map(c => ({ label: c, value: c }))
	    ];
	  }, [hotels]);
	  // 更新酒店状态并记录日志
	  const updateHotelWithLog = async (id, newStatus, operator, actionText, reason = '') => {
	    try {
	      const res = await fetch(`${API_BASE_URL}/hotels/${id}`);
	      const hotelData = await res.json();
	      const newLog = { time: dayjs().format('YYYY-MM-DD HH:mm:ss'), operator, action: actionText, detail: reason || '无' };
	      const updatedHistory = hotelData.operationHistory ? [...hotelData.operationHistory, newLog] : [newLog];
	      const payload = { status: newStatus, rejectReason: reason, operationHistory: updatedHistory };
	      const updateRes = await fetch(`${API_BASE_URL}/hotels/${id}`, {
	        method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
	      });
	      return updateRes.ok;
	    } catch (error) {
	      console.error(error);
	      return false;
	    }
	  };
	  const handleApprove = async (id) => {
	    const success = await updateHotelWithLog(id, 'published', currentUser.username, '审核通过');
	    if (success) { message.success('审核通过'); fetchHotels(); } else { message.error('操作失败'); }
	  };
	  const showRejectModal = (id) => { setCurrentRejectId(id); setIsModalVisible(true); };
	  const handleRejectConfirm = async () => {
	    try {
	      const values = await form.validateFields();
	      const success = await updateHotelWithLog(currentRejectId, 'rejected', currentUser.username, '驳回申请', values.reason);
	      if (success) { message.warning('已驳回'); setIsModalVisible(false); form.resetFields(); fetchHotels(); } 
	      else { message.error('操作失败'); }
	    } catch (e) { console.error(e); }
	  };
	  const handleOffline = async (id) => {
	    const success = await updateHotelWithLog(id, 'offline', currentUser.username, '强制下线');
	    if (success) { message.info('已下线'); fetchHotels(); } else { message.error('操作失败'); }
	  };
	  const handleOnline = async (id) => {
	    const success = await updateHotelWithLog(id, 'published', currentUser.username, '重新上线');
	    if (success) { message.success('已上线'); fetchHotels(); } else { message.error('操作失败'); }
	  };
	  // 统计数据
	  const stats = {
	    total: hotels.length, pending: hotels.filter(h => h.status === 'pending').length,
	    published: hotels.filter(h => h.status === 'published').length, rejected: hotels.filter(h => h.status === 'rejected').length,
	    offline: hotels.filter(h => h.status === 'offline').length,
	  };
	  // 饼图数据配置
	  const pieData = [
	    { type: '待审核', value: stats.pending }, { type: '已发布', value: stats.published },
	    { type: '已驳回', value: stats.rejected }, { type: '已下线', value: stats.offline },
	  ].filter(item => item.value > 0);
	  const pieConfig = {
	    appendPadding: 10,
	    data: pieData,
	    angleField: 'value',
	    colorField: 'type',
	    radius: 0.8,
	    innerRadius: 0.6,
	    label: {
	      position: 'inside',
	      offset: '-50%',
	      content: ({ value }) => value > 0 ? value : '',
	      style: {
	        textAlign: 'center',
	        fontSize: 12,
	        fill: '#fff',
	      },
	    },
	    statistic: {
	      title: {
	        offsetY: -8,
	        style: { fontSize: '14px', color: '#999' },
	        content: '总计',
	      },
	      content: {
	        offsetY: 4,
	        style: { fontSize: '24px', fontWeight: 'bold' },
	        content: stats.total,
	      },
	    },
	    color: ({ type }) => ({ '待审核': '#faad14', '已发布': '#52c41a', '已驳回': '#ff4d4f', '已下线': '#d9d9d9' }[type]),
	  };
	  // 列表筛选逻辑
	  const displayData = hotels.filter(h => {
	    const matchSearch = h.name_zh.toLowerCase().includes(searchText.toLowerCase());
	    const matchStatus = filterStatus === 'all' || h.status === filterStatus;
	    const matchStar = filterStar === 'all' || String(h.star) === filterStar;
	    const matchCreator = filterCreator === 'all' || h.createdBy === filterCreator;
	    return matchSearch && matchStatus && matchStar && matchCreator;
	  });
	  // 表格列定义
	  const columns = [
	    { title: '酒店名称', dataIndex: 'name_zh', key: 'name_zh', width: 220, fixed: 'left', render: (text, record) => (<Space>{renderStarIcon(record.star)}<Link to={`/admin/edit/${record.id}`} style={{ color: '#333', fontWeight: '500' }}>{text}</Link></Space>) },
	    { title: '创建者', dataIndex: 'createdBy', key: 'createdBy' },
	    { title: '状态', dataIndex: 'status', key: 'status', width: 150, render: (status, record) => {
	      const colorMap = { published: 'green', pending: 'orange', rejected: 'red', offline: 'default' };
	      const textMap = { published: '已发布', pending: '待审核', rejected: '已驳回', offline: '已下线' };
	      return (<div><Tag color={colorMap[status]}>{textMap[status]}</Tag>{status === 'rejected' && record.rejectReason && <div style={{ color: 'red', fontSize: 12, marginTop: 4 }}>原因：{record.rejectReason}</div>}</div>);
	    }},
	    { title: '创建时间', dataIndex: 'createdAt', key: 'createdAt', render: (text) => text ? dayjs(text).format('YYYY-MM-DD HH:mm') : '-', sorter: (a, b) => dayjs(a.createdAt).unix() - dayjs(b.createdAt).unix(), defaultSortOrder: 'descend' },
	    { title: '操作', key: 'action', width: 280, fixed: 'right', render: (_, record) => {
	      const isMerchant = currentUser?.role === 'merchant'; const isAdmin = currentUser?.role === 'admin';
	      return (
	        <Space size="small" wrap>
	          {isMerchant && (record.status === 'pending' || record.status === 'rejected' || record.status === 'published') && (<Button type="link" size="small" icon={<EditOutlined />} onClick={() => navigate(`/admin/edit/${record.id}`)}>编辑</Button>)}
	          {isMerchant && record.status === 'rejected' && (<span style={{ color: 'red', fontSize: 12 }}>请修改后重提</span>)}
	          {isAdmin && record.status === 'pending' && (<><Popconfirm title="确定通过?" onConfirm={() => handleApprove(record.id)}><Button type="link" size="small" style={{ color: 'green' }}>通过</Button></Popconfirm><Button type="link" size="small" danger onClick={() => showRejectModal(record.id)}>驳回</Button></>)}
	          {isAdmin && record.status === 'published' && (<Popconfirm title="确定下线?" onConfirm={() => handleOffline(record.id)}><Button type="link" size="small" danger icon={<StopOutlined />}>下线</Button></Popconfirm>)}
	          {isAdmin && record.status === 'offline' && (<Popconfirm title="确定上线?" onConfirm={() => handleOnline(record.id)}><Button type="link" size="small" style={{ color: 'green' }}>上线</Button></Popconfirm>)}
	        </Space>
	      );
	    }},
	  ];
	  if (!currentUser) return <div style={{ padding: 20 }}>用户信息获取失败</div>;
	  return (
	    <div className="dashboard-container">
	      {/* 页面头部 */}
	      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
	        <Breadcrumb items={[{ href: '/admin/dashboard', title: <><HomeOutlined /><span>首页</span></> }, { title: currentUser.role === 'admin' ? '审核管理' : '我的酒店' }]} />
	        <Button icon={<ReloadOutlined />} onClick={fetchHotels} loading={loading}>刷新数据</Button>
	      </div>
	      <h2 style={{ marginBottom: 20 }}>{currentUser.role === 'admin' ? '酒店审核管理' : '我的酒店'}</h2>
	      {/* 统计卡片 */}
	      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
	        <Col xs={12} sm={12} md={6}><Card hoverable style={{ ...cardStyles[0], borderRadius: 8 }} loading={loading}><Statistic title={<span style={{ color: 'rgba(255,255,255,0.9)' }}>总数</span>} value={stats.total} styles={{ content: { color: '#fff', fontWeight: 'bold' } }} /></Card></Col>
	        <Col xs={12} sm={12} md={6}><Card hoverable style={{ ...cardStyles[1], borderRadius: 8 }} loading={loading}><Statistic title={<span style={{ color: 'rgba(255,255,255,0.9)' }}>待审核</span>} value={stats.pending} prefix={<AuditOutlined />} styles={{ content: { color: '#fff', fontWeight: 'bold' } }} /></Card></Col>
	        <Col xs={12} sm={12} md={6}><Card hoverable style={{ ...cardStyles[2], borderRadius: 8 }} loading={loading}><Statistic title={<span style={{ color: 'rgba(255,255,255,0.9)' }}>已发布</span>} value={stats.published} prefix={<CheckCircleOutlined />} styles={{ content: { color: '#fff', fontWeight: 'bold' } }} /></Card></Col>
	        <Col xs={12} sm={12} md={6}><Card hoverable style={{ ...cardStyles[3], borderRadius: 8 }} loading={loading}><Statistic title={<span style={{ color: 'rgba(255,255,255,0.9)' }}>已驳回</span>} value={stats.rejected} prefix={<CloseCircleOutlined />} styles={{ content: { color: '#fff', fontWeight: 'bold' } }} /></Card></Col>
	      </Row>
	      {/* 管理员视图：图表与指引 */}
	      {currentUser.role === 'admin' && (
	        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
	          <Col xs={24} lg={12}>
	            <Card title="状态分布图" variant="borderless" style={{ borderRadius: 8, minHeight: 280 }} extra={<Tag color="blue">实时数据</Tag>}>
	              {loading ? (
	                <Skeleton active paragraph={{ rows: 5 }} />
	              ) : pieData.length > 0 ? (
	                <Pie {...pieConfig} style={{ height: 220 }} />
	              ) : (
	                <Empty description="暂无数据" style={{ marginTop: 60 }} />
	              )}
	            </Card>
	          </Col>
	          <Col xs={24} lg={12}><Card title="快速操作指引" variant="borderless" style={{ borderRadius: 8, height: '100%' }}><div style={{ padding: '10px 0', lineHeight: '2em', color: '#666' }}><p>💡 <strong>待审核 ({stats.pending})</strong>：请及时处理商户提交的新酒店申请。</p><p>🚫 <strong>已驳回 ({stats.rejected})</strong>：请关注商户是否修改并重新提交。</p><p>✅ <strong>已发布 ({stats.published})</strong>：前台用户可见，如有违规可执行下线操作。</p></div>{stats.pending > 0 && (<Button type="primary" block onClick={() => setFilterStatus('pending')}>立即审核 ({stats.pending})</Button>)}</Card></Col>
	        </Row>
	      )}
	      {/* 筛选栏 */}
	      <Card style={{ marginBottom: 16, borderRadius: 8 }} styles={{ body: { padding: '12px 24px' } }}>
	        <Space wrap size="middle">
	          <Input.Search placeholder="搜索酒店名称" allowClear onChange={(e) => setSearchText(e.target.value)} style={{ width: 240 }} prefix={<FileSearchOutlined />} />
	          <Select value={filterStatus} style={{ width: 120 }} onChange={(value) => setFilterStatus(value)}>
	            <Select.Option value="all">全部状态</Select.Option>
	            <Select.Option value="pending"><Tag color="orange">待审核</Tag></Select.Option>
	            <Select.Option value="published"><Tag color="green">已发布</Tag></Select.Option>
	            <Select.Option value="rejected"><Tag color="red">已驳回</Tag></Select.Option>
	            <Select.Option value="offline"><Tag color="default">已下线</Tag></Select.Option>
	          </Select>
	          <Select value={filterStar} style={{ width: 120 }} onChange={(value) => setFilterStar(value)}>
	            <Select.Option value="all">全部星级</Select.Option>
	            <Select.Option value="3"><Space><StarOutlined /> 三星级</Space></Select.Option>
	            <Select.Option value="4"><Space><StarFilled style={{color: '#faad14'}}/> 四星级</Space></Select.Option>
	            <Select.Option value="5"><Space><CrownTwoTone twoToneColor="#722ed1"/> 五星级</Space></Select.Option>
	          </Select>
	          {currentUser.role === 'admin' && (
	            <Select value={filterCreator} style={{ width: 140 }} onChange={(value) => setFilterCreator(value)}>
	              {creatorOptions.map(opt => (<Select.Option key={opt.value} value={opt.value}>{opt.value === 'all' ? '全部创建者' : <><UserOutlined /> {opt.label}</>}</Select.Option>))}
	            </Select>
	          )}
	          {currentUser.role === 'merchant' && ( <Button type="primary" icon={<EditOutlined />} onClick={() => navigate('/admin/add')}>录入新酒店</Button> )}
	        </Space>
	      </Card>
	      {/* 数据表格 */}
	      <Card variant="borderless" style={{ borderRadius: 8 }}>
	        <Table 
	          dataSource={displayData} columns={columns} rowKey="id" 
	          loading={loading} scroll={{ x: 1000 }} 
	          pagination={{ pageSize: 10, showSizeChanger: false, showQuickJumper: true, showTotal: (total) => `共 ${total} 条记录` }} 
	          locale={{ emptyText: <Empty description="暂无数据" image={Empty.PRESENTED_IMAGE_SIMPLE} /> }}
	          expandable={{
	            expandedRowRender: (record) => (
	              <div style={{ padding: '16px', background: '#f8f9fa', borderRadius: '8px', border: '1px solid #f0f0f0' }}>
	                <Row gutter={24}>
	                  <Col span={14}><Descriptions column={1} size="small" colon={false}>
	                    <Descriptions.Item label={<span style={{fontWeight:'bold', color:'#666'}}><EnvironmentOutlined /> 地址</span>}>{record.address || '暂无地址'}</Descriptions.Item>
	                    <Descriptions.Item label={<span style={{fontWeight:'bold', color:'#666'}}>周边</span>}>{record.surroundings || '暂无周边信息'}</Descriptions.Item>
	                    <Descriptions.Item label={<span style={{fontWeight:'bold', color:'#666'}}>开业时间</span>}>{record.openDate ? dayjs(record.openDate).format('YYYY-MM-DD') : '暂无'}</Descriptions.Item>
	                  </Descriptions></Col>
	                  <Col span={10}>
	                    <div style={{fontWeight:'bold', color:'#666', marginBottom: 8}}>房型列表 ({record.rooms?.length || 0}间)</div>
	                    <div style={{ maxHeight: 120, overflow: 'auto' }}>
	                      {record.rooms && record.rooms.length > 0 ? (<Space direction="vertical" size="small" style={{ width: '100%' }}>{record.rooms.map(r => (<div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', background: '#fff', padding: '6px 12px', borderRadius: 4 }}><span>{r.name}</span><Tag color="gold">¥{r.price}</Tag></div>))}</Space>) : <span style={{color:'#999'}}>暂无房型数据</span>}
	                    </div>
	                  </Col>
	                </Row>
	              </div>
	            ),
	            rowExpandable: () => true,
	          }}
	        />
	      </Card>
	      {/* 驳回弹窗 */}
	      <Modal title="驳回原因" open={isModalVisible} onOk={handleRejectConfirm} onCancel={() => setIsModalVisible(false)} okText="确认" forceRender>
	        <Form form={form} layout="vertical"><Form.Item name="reason" label="理由" rules={[{ required: true, message: '必填' }]}><Input.TextArea rows={4} placeholder="请输入驳回的具体原因，方便商户修改..." /></Form.Item></Form>
	      </Modal>
	    </div>
	  );
	};
	export default Dashboard;