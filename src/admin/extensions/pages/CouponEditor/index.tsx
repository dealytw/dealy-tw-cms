import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  Flex,
  Card,
  TextInput,
  Select,
  Option,
  Textarea,
  Badge,
  IconButton,
  Table,
  Thead,
  Tbody,
  Tr,
  Td,
  Th,
} from '@strapi/strapi/admin';
import { Plus, Pencil, Trash, Check, Cross } from '@strapi/icons';

interface Coupon {
  id: number;
  coupon_uid: string;
  title: string;
  description: string;
  merchant: string;
  market: string;
  priority: number;
  display_count: number;
  user_count: number;
  coupon_status: string;
  expires_at: string;
  created_at: string;
}

const CouponEditor: React.FC = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingData, setEditingData] = useState<Partial<Coupon>>({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCoupon, setNewCoupon] = useState<Partial<Coupon>>({});

  // Mock data for development
  useEffect(() => {
    const mockCoupons: Coupon[] = [
      {
        id: 1,
        coupon_uid: 'merchant-20241201-ABC12345',
        title: '20% Off Electronics',
        description: 'Get 20% off all electronics',
        merchant: 'TechStore',
        market: 'TW',
        priority: 1,
        display_count: 45,
        user_count: 150,
        coupon_status: 'active',
        expires_at: '2024-12-31',
        created_at: '2024-12-01',
      },
      {
        id: 2,
        coupon_uid: 'merchant-20241201-DEF67890',
        title: 'Free Shipping',
        description: 'Free shipping on orders over $50',
        merchant: 'FashionHub',
        market: 'TW',
        priority: 2,
        display_count: 38,
        user_count: 89,
        coupon_status: 'active',
        expires_at: '2024-12-15',
        created_at: '2024-12-01',
      },
    ];
    setCoupons(mockCoupons);
  }, []);

  const handleEdit = (coupon: Coupon) => {
    setEditingId(coupon.id);
    setEditingData({ ...coupon });
  };

  const handleSave = () => {
    if (editingId) {
      setCoupons(coupons.map(c => 
        c.id === editingId ? { ...c, ...editingData } : c
      ));
      setEditingId(null);
      setEditingData({});
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditingData({});
  };

  const handleDelete = (id: number) => {
    setCoupons(coupons.filter(c => c.id !== id));
  };

  const handleAdd = () => {
    if (newCoupon.title && newCoupon.merchant) {
      const coupon: Coupon = {
        id: Date.now(),
        coupon_uid: `coupon-${Date.now()}-${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
        title: newCoupon.title || '',
        description: newCoupon.description || '',
        merchant: newCoupon.merchant || '',
        market: newCoupon.market || 'TW',
        priority: newCoupon.priority || 0,
        display_count: 0,
        user_count: 0,
        coupon_status: 'active',
        expires_at: newCoupon.expires_at || '',
        created_at: new Date().toISOString().split('T')[0],
      };
      setCoupons([...coupons, coupon]);
      setNewCoupon({});
      setShowAddForm(false);
    }
  };

  const renderCell = (coupon: Coupon, field: keyof Coupon) => {
    if (editingId === coupon.id) {
      switch (field) {
        case 'title':
        case 'description':
        case 'merchant':
          return (
            <TextInput
              value={editingData[field] || ''}
              onChange={(e: any) => setEditingData({ ...editingData, [field]: e.target.value })}
            />
          );
        case 'market':
          return (
            <Select
              value={editingData[field] || ''}
              onChange={(value: string) => setEditingData({ ...editingData, [field]: value })}
            >
              <Option value="TW">TW</Option>
              <Option value="HK">HK</Option>
              <Option value="SG">SG</Option>
            </Select>
          );
        case 'priority':
        case 'display_count':
        case 'user_count':
          return (
            <TextInput
              type="number"
              value={editingData[field] || ''}
              onChange={(e: any) => setEditingData({ ...editingData, [field]: parseInt(e.target.value) || 0 })}
            />
          );
        case 'coupon_status':
          return (
            <Select
              value={editingData[field] || ''}
              onChange={(value: string) => setEditingData({ ...editingData, [field]: value })}
            >
              <Option value="active">Active</Option>
              <Option value="inactive">Inactive</Option>
              <Option value="expired">Expired</Option>
            </Select>
          );
        case 'expires_at':
          return (
            <TextInput
              type="date"
              value={editingData[field] || ''}
              onChange={(e: any) => setEditingData({ ...editingData, [field]: e.target.value })}
            />
          );
        default:
          return coupon[field];
      }
    }
    return coupon[field];
  };

  const renderActions = (coupon: Coupon) => {
    if (editingId === coupon.id) {
      return (
        <Flex gap={1}>
          <IconButton
            icon={<Check />}
            onClick={handleSave}
            label="Save"
          />
          <IconButton
            icon={<Cross />}
            onClick={handleCancel}
            label="Cancel"
          />
        </Flex>
      );
    }
    return (
      <Flex gap={1}>
        <IconButton
          icon={<Pencil />}
          onClick={() => handleEdit(coupon)}
          label="Edit"
        />
        <IconButton
          icon={<Trash />}
          onClick={() => handleDelete(coupon.id)}
          label="Delete"
        />
      </Flex>
    );
  };

  return (
    <Box padding={8}>
      <Typography variant="alpha" as="h1">Coupon Editor</Typography>
      <Typography variant="epsilon" as="p" textColor="neutral600">
        Spreadsheet-style editing for coupon management
      </Typography>

      <Box marginTop={6}>
        <Flex justifyContent="space-between" alignItems="center" marginBottom={4}>
          <Typography variant="beta">Coupons ({coupons.length})</Typography>
          <Button
            onClick={() => setShowAddForm(!showAddForm)}
            startIcon={<Plus />}
          >
            Add Coupon
          </Button>
        </Flex>

        {showAddForm && (
          <Card padding={4} marginBottom={4}>
            <Typography variant="beta" marginBottom={3}>Add New Coupon</Typography>
            <Flex gap={3} wrap="wrap">
              <TextInput
                label="Title"
                value={newCoupon.title || ''}
                onChange={(e: any) => setNewCoupon({ ...newCoupon, title: e.target.value })}
              />
              <TextInput
                label="Merchant"
                value={newCoupon.merchant || ''}
                onChange={(e: any) => setNewCoupon({ ...newCoupon, merchant: e.target.value })}
              />
              <Select
                label="Market"
                value={newCoupon.market || 'TW'}
                onChange={(value: string) => setNewCoupon({ ...newCoupon, market: value })}
              >
                <Option value="TW">TW</Option>
                <Option value="HK">HK</Option>
                <Option value="SG">SG</Option>
              </Select>
              <TextInput
                label="Priority"
                type="number"
                value={newCoupon.priority || 0}
                onChange={(e: any) => setNewCoupon({ ...newCoupon, priority: parseInt(e.target.value) || 0 })}
              />
              <TextInput
                label="Expires At"
                type="date"
                value={newCoupon.expires_at || ''}
                onChange={(e: any) => setNewCoupon({ ...newCoupon, expires_at: e.target.value })}
              />
              <Textarea
                label="Description"
                value={newCoupon.description || ''}
                onChange={(e: any) => setNewCoupon({ ...newCoupon, description: e.target.value })}
              />
            </Flex>
            <Flex gap={2} marginTop={3}>
              <Button onClick={handleAdd}>Add Coupon</Button>
              <Button variant="tertiary" onClick={() => setShowAddForm(false)}>Cancel</Button>
            </Flex>
          </Card>
        )}

        <Card>
          <Table colCount={12} rowCount={coupons.length}>
            <Thead>
              <Tr>
                <Th>ID</Th>
                <Th>UID</Th>
                <Th>Title</Th>
                <Th>Merchant</Th>
                <Th>Market</Th>
                <Th>Priority</Th>
                <Th>Display Count</Th>
                <Th>User Count</Th>
                <Th>Status</Th>
                <Th>Expires</Th>
                <Th>Created</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {coupons.map((coupon) => (
                <Tr key={coupon.id}>
                  <Td>{coupon.id}</Td>
                  <Td>{coupon.coupon_uid}</Td>
                  <Td>{renderCell(coupon, 'title')}</Td>
                  <Td>{renderCell(coupon, 'merchant')}</Td>
                  <Td>{renderCell(coupon, 'market')}</Td>
                  <Td>{renderCell(coupon, 'priority')}</Td>
                  <Td>{renderCell(coupon, 'display_count')}</Td>
                  <Td>{renderCell(coupon, 'user_count')}</Td>
                  <Td>
                    {editingId === coupon.id ? (
                      renderCell(coupon, 'coupon_status')
                    ) : (
                      <Badge textColor={coupon.coupon_status === 'active' ? 'success600' : 'neutral600'}>
                        {coupon.coupon_status}
                      </Badge>
                    )}
                  </Td>
                  <Td>{renderCell(coupon, 'expires_at')}</Td>
                  <Td>{coupon.created_at}</Td>
                  <Td>{renderActions(coupon)}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Card>
      </Box>
    </Box>
  );
};

export default CouponEditor;
