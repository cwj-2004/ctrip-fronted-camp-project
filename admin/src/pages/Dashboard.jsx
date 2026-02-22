	import { Table, Button, Space, Tag, message, Popconfirm, Card, Modal, Input, Form } from 'antd';
	import { useEffect, useState, useCallback } from 'react';
	import { useNavigate } from 'react-router-dom';
	const Dashboard = () => {
	  const [hotels, setHotels] = useState([]);
	  const [loading, setLoading] = useState(true);
	  const [isModalVisible, setIsModalVisible] = useState(false); // 驳回弹窗
	  const [currentRejectId, setCurrentRejectId] = useState(null);
	  const [form] = Form.useForm();
	  const navigate = useNavigate();
	  const [currentUser] = useState(() => {
	    const userStr = window.sessionStorage.getItem('user');
	    if (userStr) {
	      try {
	        return JSON.parse(userStr);
	      } catch (e) {
	        console.error('解析用户信息失败:', e); // 修复：打印错误信息
	        return null;
	      }
	    }
	    return null;
	  });
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
	      console.error('获取酒店列表失败:', error); // 修复：打印错误信息
	      message.error('获取酒店列表失败');
	    } finally {
	      setLoading(false);
	    }
	  }, [currentUser]);
	  useEffect(() => {
	    fetchHotels();
	  }, [fetchHotels]);
	  // --- 管理员操作逻辑 ---
	  // 通过审核
	  const handleApprove = async (id) => {
	    await fetch(`http://localhost:3001/hotels/${id}`, {
	      method: 'PATCH',
	      headers: { 'Content-Type': 'application/json' },
	      body: JSON.stringify({ status: 'published' }),
	    });
	    message.success('审核通过，已发布');
	    fetchHotels();
	  };
	  // 打开驳回弹窗
	  const showRejectModal = (id) => {
	    setCurrentRejectId(id);
	    setIsModalVisible(true);
	  };
	  // 确认驳回
	  const handleRejectConfirm = async () => {
	    try {
	      const values = await form.validateFields();
	      await fetch(`http://localhost:3001/hotels/${currentRejectId}`, {
	        method: 'PATCH',
	        headers: { 'Content-Type': 'application/json' },
	        body: JSON.stringify({ status: 'rejected', rejectReason: values.reason }),
	      });
	      message.warning('已驳回申请');
	      setIsModalVisible(false);
	      form.resetFields();
	      fetchHotels();
	    } catch (error) {
	      console.error('Validation failed:', error);
	    }
	  };
	  // 下线
	  const handleOffline = async (id) => {
	    await fetch(`http://localhost:3001/hotels/${id}`, {
	      method: 'PATCH',
	      headers: { 'Content-Type': 'application/json' },
	      body: JSON.stringify({ status: 'offline' }),
	    });
	    message.info('酒店已下线');
	    fetchHotels();
	  };
	  // 恢复上线
	  const handleOnline = async (id) => {
	    await fetch(`http://localhost:3001/hotels/${id}`, {
	      method: 'PATCH',
	      headers: { 'Content-Type': 'application/json' },
	      body: JSON.stringify({ status: 'published' }),
	    });
	    message.success('酒店已恢复上线');
	    fetchHotels();
	  };
	  // --- 表格列定义 ---
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
	    },
	    {
	      title: '状态',
	      dataIndex: 'status',
	      key: 'status',
	      render: (status, record) => {
	        const colorMap = { published: 'green', pending: 'orange', rejected: 'red', offline: 'default' };
	        const textMap = { published: '已发布', pending: '待审核', rejected: '已驳回', offline: '已下线' };
	        // 如果是驳回状态，需要在Tag下方显示原因
	        return (
	          <div>
	            <Tag color={colorMap[status]}>{textMap[status]}</Tag>
	            {status === 'rejected' && record.rejectReason && (
	              <div style={{ color: 'red', fontSize: 12, marginTop: 4 }}>
	                原因：{record.rejectReason}
	              </div>
	            )}
	          </div>
	        );
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
	            {/* 商户：只有待审核、已驳回、已下线(暂不允许改)时可以编辑 */}
	            {isMerchant && (record.status === 'pending' || record.status === 'rejected') && (
	              <Button type="link" size="small" onClick={() => navigate(`/admin/edit/${record.id}`)}>
	                编辑
	              </Button>
	            )}
	            {/* 商户：查看驳回原因的提示（已在状态列显示，此处可作为补充按钮） */}
	            {isMerchant && record.status === 'rejected' && (
	               <span style={{ color: 'red', fontSize: 12 }}>请修改后重新提交</span>
	            )}
	            {/* 管理员：审核操作 */}
	            {isAdmin && record.status === 'pending' && (
	              <>
	                <Popconfirm title="确定通过审核吗？" onConfirm={() => handleApprove(record.id)}>
	                  <Button type="link" size="small" style={{ color: 'green' }}>通过</Button>
	                </Popconfirm>
	                <Button type="link" size="small" danger onClick={() => showRejectModal(record.id)}>
	                  驳回
	                </Button>
	              </>
	            )}
	            {/* 管理员：上下线操作 */}
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
	            {/* 管理员：查看已驳回项 */}
	            {isAdmin && record.status === 'rejected' && (
	               <Button type="link" size="small" onClick={() => navigate(`/admin/edit/${record.id}`)}>
	                 查看详情
	               </Button>
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
	        <h2>{currentUser.role === 'admin' ? '酒店审核管理' : '我的酒店'}</h2>
	        {currentUser.role === 'merchant' && (
	          <Button type="primary" onClick={() => navigate('/admin/add')}>+ 录入新酒店</Button>
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
	      {/* 驳回原因弹窗 */}
	      <Modal 
	        title="驳回原因" 
	        visible={isModalVisible} 
	        onOk={handleRejectConfirm} 
	        onCancel={() => setIsModalVisible(false)}
	        okText="确认驳回"
	      >
	        <Form form={form} layout="vertical">
	          <Form.Item 
	            name="reason" 
	            label="请输入驳回理由" 
	            rules={[{ required: true, message: '驳回理由不能为空' }]}
	          >
	            <Input.TextArea rows={4} placeholder="例如：资质不全、图片模糊" />
	          </Form.Item>
	        </Form>
	      </Modal>
	    </div>
	  );
	};
	export default Dashboard;