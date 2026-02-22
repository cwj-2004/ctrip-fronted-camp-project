	import { Table, Button, Space, Tag, message, Popconfirm, Card } from 'antd';
	import { useEffect, useState, useCallback } from 'react';
	import { useNavigate } from 'react-router-dom';
	const Dashboard = () => {
	  const [hotels, setHotels] = useState([]);
	  const [loading, setLoading] = useState(true);
	  const navigate = useNavigate();
	  // 1. 安全获取当前登录用户信息
	  let currentUser = null;
	  try {
	    const userStr = window.sessionStorage.getItem('user');
	    if (userStr) {
	      currentUser = JSON.parse(userStr);
	    }
	  } catch (e) {
	    console.error('Dashboard解析用户失败', e);
	  }
	  // 2. 获取酒店列表
	  const fetchHotels = useCallback(async () => {
	    if (!currentUser) return;
	    setLoading(true);
	    try {
	      const response = await fetch('http://localhost:3001/hotels');
	      const data = await response.json();
	      if (currentUser.role === 'merchant') {
	        setHotels(data.filter(item => item.createdBy === currentUser.username));
	      } else {
	        setHotels(data);
	      }
	    } catch (error) {
	      console.error('获取列表失败:', error); // 修复：使用 error
	      message.error('获取酒店列表失败');
	    } finally {
	      setLoading(false);
	    }
	  }, [currentUser]);
	  useEffect(() => {
	    fetchHotels();
	  }, [fetchHotels]);
	  // --- 管理员操作：审核通过 ---
	  const handleApprove = async (id) => {
	    try {
	      await fetch(`http://localhost:3001/hotels/${id}`, {
	        method: 'PATCH',
	        headers: { 'Content-Type': 'application/json' },
	        body: JSON.stringify({ status: 'published' }),
	      });
	      message.success('审核通过，已发布');
	      fetchHotels();
	    } catch (error) {
	      console.error('审核操作失败:', error); // 修复：使用 error
	      message.error('操作失败');
	    }
	  };
	  // --- 管理员操作：审核驳回 ---
	  const handleReject = async (id) => {
	    try {
	      await fetch(`http://localhost:3001/hotels/${id}`, {
	        method: 'PATCH',
	        headers: { 'Content-Type': 'application/json' },
	        body: JSON.stringify({ status: 'rejected', rejectReason: '信息不符或资料不全' }),
	      });
	      message.warning('已驳回申请');
	      fetchHotels();
	    } catch (error) {
	      console.error('驳回操作失败:', error); // 修复：使用 error
	      message.error('操作失败');
	    }
	  };
	  // --- 管理员操作：下线 ---
	  const handleOffline = async (id) => {
	    try {
	      await fetch(`http://localhost:3001/hotels/${id}`, {
	        method: 'PATCH',
	        headers: { 'Content-Type': 'application/json' },
	        body: JSON.stringify({ status: 'offline' }),
	      });
	      message.info('酒店已下线');
	      fetchHotels();
	    } catch (error) {
	      console.error('下线操作失败:', error); // 修复：使用 error
	      message.error('操作失败');
	    }
	  };
	  // --- 管理员操作：恢复上线 ---
	  const handleOnline = async (id) => {
	    try {
	      await fetch(`http://localhost:3001/hotels/${id}`, {
	        method: 'PATCH',
	        headers: { 'Content-Type': 'application/json' },
	        body: JSON.stringify({ status: 'published' }),
	      });
	      message.success('酒店已恢复上线');
	      fetchHotels();
	    } catch (error) {
	      console.error('恢复上线操作失败:', error); // 修复：使用 error
	      message.error('操作失败');
	    }
	  };
	  // 3. 定义表格列
	  const columns = [
	    {
	      title: '酒店名称',
	      dataIndex: 'name_zh',
	      key: 'name_zh',
	      width: 200,
	    },
	    {
	      title: '创建者',
	      dataIndex: 'createdBy',
	      key: 'createdBy',
	      render: (text) => text || '未知',
	    },
	    {
	      title: '状态',
	      dataIndex: 'status',
	      key: 'status',
	      render: (status) => {
	        const colorMap = {
	          published: 'green',
	          pending: 'orange',
	          rejected: 'red',
	          offline: 'default',
	        };
	        const textMap = {
	          published: '已发布',
	          pending: '待审核',
	          rejected: '已驳回',
	          offline: '已下线',
	        };
	        return <Tag color={colorMap[status]}>{textMap[status]}</Tag>;
	      },
	    },
	    {
	      title: '操作',
	      key: 'action',
	      width: 300,
	      render: (_, record) => {
	        if (!currentUser) return null;
	        const isMerchant = currentUser.role === 'merchant';
	        const isAdmin = currentUser.role === 'admin';
	        return (
	          <Space size="small" wrap>
	            <Button 
	              type="link" 
	              size="small"
	              onClick={() => navigate(`/admin/edit/${record.id}`)}
	            >
	              编辑
	            </Button>
	            {isMerchant && record.status === 'rejected' && (
	              <span style={{ color: 'red', fontSize: 12 }}>
	                原因: {record.rejectReason || '无'}
	              </span>
	            )}
	            {isAdmin && record.status === 'pending' && (
	              <>
	                <Popconfirm title="确定通过审核吗？" onConfirm={() => handleApprove(record.id)}>
	                  <Button type="link" size="small" style={{ color: 'green' }}>通过</Button>
	                </Popconfirm>
	                <Popconfirm title="确定驳回吗？" onConfirm={() => handleReject(record.id)}>
	                  <Button type="link" size="small" danger>驳回</Button>
	                </Popconfirm>
	              </>
	            )}
	            {isAdmin && record.status === 'published' && (
	              <Popconfirm title="确定下线该酒店吗？" onConfirm={() => handleOffline(record.id)}>
	                <Button type="link" size="small">下线</Button>
	              </Popconfirm>
	            )}
	            {isAdmin && record.status === 'offline' && (
	              <Popconfirm title="确定恢复上线吗？" onConfirm={() => handleOnline(record.id)}>
	                <Button type="link" size="small" style={{ color: 'green' }}>恢复上线</Button>
	              </Popconfirm>
	            )}
	          </Space>
	        );
	      },
	    },
	  ];
	  if (!currentUser) {
	    return <div style={{ padding: 20 }}>用户信息获取失败，请重新登录。</div>;
	  }
	  return (
	    <div>
	      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
	        <h2>
	          {currentUser.role === 'admin' ? '酒店审核管理' : '我的酒店'}
	        </h2>
	        {currentUser.role === 'merchant' && (
	          <Button type="primary" onClick={() => navigate('/admin/add')}>
	            + 录入新酒店
	          </Button>
	        )}
	      </div>
	      <Card>
	        <Table 
	          dataSource={hotels} 
	          columns={columns} 
	          rowKey="id" 
	          loading={loading}
	          pagination={{ pageSize: 10 }}
	        />
	      </Card>
	    </div>
	  );
	};
	export default Dashboard;