import React, { useState, useEffect } from 'react';
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors
  closestCenter,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useCouponApi } from './useCouponApi';

interface Coupon {
  id: number;
  coupon_uid: string;
  coupon_title: string;
  value: string;
  code: string;
  coupon_type: string;
  affiliate_link: string;
  description: string;
  editor_tips: string;
  priority: number;
  starts_at: string;
  expires_at: string;
  coupon_status: string;
  user_count: number;
  last_click_at: string;
  display_count: number;
  site: string;
  merchant: {
    id: number;
    merchant_name: string;
    slug: string;
  };
  market: string;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
}

interface ColumnConfig {
  key: keyof Coupon;
  label: string;
  visible: boolean;
  width: number;
  type: 'text' | 'number' | 'date' | 'select' | 'relation' | 'enum' | 'readonly';
  options?: string[];
}

// Sortable Row Component
function SortableRow({ coupon, index, onEdit, onDelete, columns, merchants }: { 
  coupon: Coupon; 
  index: number; 
  onEdit: (id: number, field: keyof Coupon, value: any) => void;
  onDelete: (id: number) => void;
  columns: ColumnConfig[];
  merchants: any[];
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: coupon.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
    outline: isDragging ? '2px dashed #3b82f6' : undefined,
    cursor: 'grab',
  };

  const renderCell = (column: ColumnConfig) => {
    const value = coupon[column.key];
    
    switch (column.type) {
      case 'text':
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => onEdit(coupon.id, column.key, e.target.value)}
            style={{ 
              width: '100%', 
              padding: '6px', 
              border: '1px solid rgba(255,255,255,0.2)', 
              borderRadius: '4px', 
              fontSize: '12px',
              height: '30px',
              boxSizing: 'border-box',
              background: 'rgba(255,255,255,0.1)',
              color: '#e8e8e8',
              transition: 'all 0.2s ease'
            }}
          />
        );
      case 'number':
        return (
          <input
            type="number"
            value={value || ''}
            onChange={(e) => onEdit(coupon.id, column.key, parseInt(e.target.value) || 0)}
            style={{ 
              width: '100%', 
              padding: '6px', 
              border: '1px solid rgba(255,255,255,0.2)', 
              borderRadius: '4px', 
              fontSize: '12px',
              height: '30px',
              boxSizing: 'border-box',
              background: 'rgba(255,255,255,0.1)',
              color: '#e8e8e8',
              transition: 'all 0.2s ease'
            }}
          />
        );
      case 'date':
        return (
          <input
            type="date"
            value={value ? new Date(value).toISOString().split('T')[0] : ''}
            onChange={(e) => onEdit(coupon.id, column.key, e.target.value)}
            style={{ 
              width: '100%', 
              padding: '6px', 
              border: '1px solid rgba(255,255,255,0.2)', 
              borderRadius: '4px', 
              fontSize: '12px',
              height: '30px',
              boxSizing: 'border-box',
              background: 'rgba(255,255,255,0.1)',
              color: '#e8e8e8',
              transition: 'all 0.2s ease'
            }}
          />
        );
      case 'select':
      case 'enum':
        return (
          <select
            value={value || ''}
            onChange={(e) => onEdit(coupon.id, column.key, e.target.value)}
            style={{ 
              width: '100%', 
              padding: '6px', 
              border: '1px solid rgba(255,255,255,0.2)', 
              borderRadius: '4px', 
              fontSize: '12px',
              height: '30px',
              boxSizing: 'border-box',
              background: 'rgba(255,255,255,0.1)',
              color: '#e8e8e8',
              transition: 'all 0.2s ease'
            }}
          >
            <option value="">Select...</option>
            {column.options?.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        );
      case 'relation':
        if (column.key === 'merchant') {
          return (
            <select
              value={value?.id || ''}
              onChange={(e) => {
                const merchantId = parseInt(e.target.value);
                const merchant = merchants.find(m => m.id === merchantId);
                onEdit(coupon.id, column.key, merchant ? {
                  id: merchant.id,
                  merchant_name: merchant.merchant_name,
                  slug: merchant.slug
                } : null);
              }}
              style={{ 
                width: '100%', 
                padding: '6px', 
                border: '1px solid rgba(255,255,255,0.2)', 
                borderRadius: '4px', 
                fontSize: '12px',
                height: '30px',
                boxSizing: 'border-box',
                background: '#333',
                color: 'white'
              }}
            >
              <option value="">Select Merchant...</option>
              {merchants.map(merchant => (
                <option key={merchant.id} value={merchant.id}>
                  {merchant.merchant_name}
                </option>
              ))}
            </select>
          );
        }
        return value;
      case 'readonly':
      default:
        return <span style={{ fontSize: '12px' }}>{value}</span>;
    }
  };

  return (
    <tr 
      ref={setNodeRef} 
      style={{ 
        ...style,
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        background: index % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent',
        height: '42px',
        position: 'relative',
      }}
      {...attributes} 
      {...listeners}
    >
      {/* Drag Handle */}
      <td 
        style={{ 
          padding: '8px', 
          width: '40px', 
          textAlign: 'center',
          verticalAlign: 'middle',
          height: '42px',
          background: 'rgba(255,255,255,0.05)',
          borderRight: '1px solid rgba(255,255,255,0.1)',
          cursor: 'grab'
        }}
      >
        ⋮⋮
      </td>
      
      {columns.filter(col => col.visible).map(column => (
        <td 
          key={column.key}
          style={{ 
            padding: '6px 8px', 
            minWidth: column.width,
            maxWidth: column.width,
            verticalAlign: 'middle',
            height: '42px',
            borderRight: '1px solid rgba(255,255,255,0.1)'
          }}
        >
          {renderCell(column)}
        </td>
      ))}
      
      <td style={{ 
        padding: '6px 8px', 
        width: '80px',
        verticalAlign: 'middle',
        height: '42px'
      }}>
        <button
          onClick={() => onDelete(coupon.id)}
          style={{ 
            background: '#dc3545', 
            color: 'white', 
            border: 'none', 
            padding: '4px 8px', 
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '11px'
          }}
        >
          Delete
        </button>
      </td>
    </tr>
  );
}

const CouponEditorNew: React.FC = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [editingData, setEditingData] = useState<{ [key: number]: Partial<Coupon> }>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [merchants, setMerchants] = useState<any[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  
  const api = useCouponApi();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  // Column configuration
  const [columns] = useState<ColumnConfig[]>([
    { key: 'merchant', label: 'Merchant', visible: true, width: 150, type: 'relation' },
    { key: 'coupon_title', label: 'Title', visible: true, width: 200, type: 'text' },
    { key: 'value', label: 'Value', visible: true, width: 120, type: 'text' },
    { key: 'code', label: 'Code', visible: true, width: 120, type: 'text' },
    { key: 'coupon_type', label: 'Type', visible: true, width: 120, type: 'enum', options: ['promo_code', 'coupon', 'discount'] },
    { key: 'affiliate_link', label: 'Affiliate Link', visible: true, width: 200, type: 'text' },
    { key: 'description', label: 'Description', visible: true, width: 200, type: 'text' },
    { key: 'editor_tips', label: 'Editor Tips', visible: true, width: 200, type: 'text' },
    { key: 'priority', label: 'Priority', visible: true, width: 80, type: 'number' },
    { key: 'starts_at', label: 'Starts At', visible: true, width: 120, type: 'date' },
    { key: 'expires_at', label: 'Expires At', visible: true, width: 120, type: 'date' },
    { key: 'coupon_status', label: 'Status', visible: true, width: 100, type: 'enum', options: ['active', 'expired', 'scheduled', 'archived'] },
    { key: 'user_count', label: 'User Count', visible: true, width: 100, type: 'number' },
    { key: 'last_click_at', label: 'Last Click', visible: true, width: 150, type: 'date' },
    { key: 'display_count', label: 'Display Count', visible: true, width: 120, type: 'number' },
    { key: 'site', label: 'Site', visible: true, width: 120, type: 'text' },
    { key: 'market', label: 'Market', visible: true, width: 80, type: 'enum', options: ['TW', 'HK'] },
    { key: 'coupon_uid', label: 'UID', visible: true, width: 180, type: 'readonly' },
  ]);

  // Load data
  useEffect(() => {
    loadCoupons();
    loadMerchants();
  }, []);

  const loadCoupons = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/coupon?status=all&populate[merchant][fields][0]=merchant_name&populate[merchant][fields][1]=slug', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        credentials: 'same-origin'
      });
      
      if (response.ok) {
        const data = await response.json();
        const formattedCoupons = data.data.map((item: any) => ({
          id: item.id,
          coupon_uid: item.coupon_uid || '',
          coupon_title: item.coupon_title || '',
          value: item.value || '',
          code: item.code || '',
          coupon_type: item.coupon_type || 'coupon',
          affiliate_link: item.affiliate_link || '',
          description: item.description || '',
          editor_tips: item.editor_tips || '',
          priority: item.priority || 0,
          starts_at: item.starts_at || '',
          expires_at: item.expires_at || '',
          coupon_status: item.coupon_status || 'active',
          user_count: item.user_count || 0,
          last_click_at: item.last_click_at || '',
          display_count: item.display_count || 0,
          site: item.site || '',
          merchant: item.merchant && typeof item.merchant === 'object' && item.merchant.id ? {
            id: item.merchant.id,
            merchant_name: item.merchant.merchant_name || '',
            slug: item.merchant.slug || ''
          } : null,
          market: item.market || 'TW',
          publishedAt: item.publishedAt || '',
          createdAt: item.createdAt || '',
          updatedAt: item.updatedAt || ''
        }));
        setCoupons(formattedCoupons);
      }
    } catch (error) {
      console.error('Error loading coupons:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMerchants = async () => {
    try {
      const response = await fetch('/api/merchants?pagination[pageSize]=100', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        credentials: 'same-origin'
      });
      
      if (response.ok) {
        const data = await response.json();
        setMerchants(data.results || []);
      }
    } catch (error) {
      console.error('Error loading merchants:', error);
    }
  };

  // Handle data changes
  const handleDataChange = (couponId: number, field: keyof Coupon, value: any) => {
    setEditingData(prev => ({
      ...prev,
      [couponId]: {
        ...prev[couponId],
        [field]: value
      }
    }));
  };

  // Save all changes
  const handleSaveAll = async () => {
    if (Object.keys(editingData).length === 0) return;

    try {
      setSaving(true);
      const updatePromises = Object.entries(editingData).map(async ([couponId, changes]) => {
        const id = parseInt(couponId);
        return api.update(id.toString(), changes);
      });

      await Promise.all(updatePromises);
      await loadCoupons();
      setEditingData({});
    } catch (error) {
      console.error('Error saving changes:', error);
      alert(`Error saving changes: ${error}`);
    } finally {
      setSaving(false);
    }
  };

  // Handle delete
  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this coupon?')) return;

    try {
      await api.remove(id.toString());
      setCoupons(coupons.filter(c => c.id !== id));
    } catch (error) {
      console.error('Error deleting coupon:', error);
      alert('Error deleting coupon');
    }
  };

  // Drag and drop handlers
  const handleDragEnd = async (event: any) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = coupons.findIndex(c => c.id === active.id);
    const newIndex = coupons.findIndex(c => c.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    // Optimistically update local state
    const newCoupons = arrayMove(coupons, oldIndex, newIndex).map((c, i) => ({
      ...c,
      priority: i + 1,
    }));
    setCoupons(newCoupons);

    try {
      console.log('Attempting to reorder with IDs:', newCoupons.map(c => c.coupon_uid));
      
      // Update priorities on server using documentIds
      const result = await api.reorder(newCoupons.map(c => c.coupon_uid));
      console.log('Reorder API response:', result);
      
      // If successful, no need to revert
    } catch (error) {
      console.error('Reorder failed, reverting', error);
      console.error('Error details:', {
        message: error.message,
        status: error.status,
        response: error.response
      });
      
      // Revert on error
      setCoupons(coupons);
      alert('Failed to update priorities. Please try again.');
    }
  };

  // Sort coupons by priority
  const sortedCoupons = [...coupons].sort((a, b) => a.priority - b.priority);

  if (loading) {
    return (
      <div style={{ padding: '20px', color: 'white', textAlign: 'center' }}>
        <h2>Loading coupons...</h2>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', color: 'white', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <h1 style={{ color: 'white', marginBottom: '8px' }}>Coupon Editor - New Version</h1>
      <p style={{ color: '#aaa', marginBottom: '20px' }}>
        Smooth drag & drop with proper Strapi v5 integration
      </p>

      {/* Controls */}
      <div style={{ 
        background: '#333', 
        padding: '15px', 
        borderRadius: '8px', 
        marginBottom: '20px',
        display: 'flex',
        gap: '20px',
        alignItems: 'center',
        flexWrap: 'wrap'
      }}>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          style={{ 
            background: '#28a745', 
            color: 'white', 
            border: 'none', 
            padding: '8px 16px', 
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          {showAddForm ? 'Cancel Add' : 'Add Coupon'}
        </button>

        <button
          onClick={handleSaveAll}
          disabled={saving || Object.keys(editingData).length === 0}
          style={{ 
            background: saving ? '#6c757d' : '#007bff', 
            color: 'white', 
            border: 'none', 
            padding: '8px 16px', 
            borderRadius: '4px',
            cursor: saving ? 'not-allowed' : 'pointer',
            opacity: saving ? 0.6 : 1
          }}
        >
          {saving ? 'Saving...' : `Save All Changes (${Object.keys(editingData).length})`}
        </button>

        <button
          onClick={loadCoupons}
          style={{ 
            background: '#17a2b8', 
            color: 'white', 
            border: 'none', 
            padding: '8px 16px', 
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Refresh Data
        </button>

        <span style={{ color: '#aaa' }}>
          Showing {sortedCoupons.length} coupons
        </span>
      </div>

      {/* Table */}
      <div style={{ 
        background: '#333', 
        borderRadius: '8px', 
        overflow: 'hidden',
        flex: 1,
        minHeight: '400px'
      }}>
        <div style={{ overflowX: 'auto', width: '100%' }}>
          <DndContext 
            sensors={sensors} 
            collisionDetection={closestCenter} 
            onDragEnd={handleDragEnd}
          >
            <table style={{ 
              width: 'max-content', 
              borderCollapse: 'collapse',
              color: '#e8e8e8',
              minWidth: '100%',
              background: '#2a2d3d'
            }}>
              <thead>
                <tr style={{ 
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
                  color: 'white', 
                  fontSize: '12px',
                  fontWeight: 'bold',
                  height: '42px'
                }}>
                  <th style={{ 
                    padding: '8px', 
                    textAlign: 'center', 
                    width: '40px',
                    height: '42px',
                    verticalAlign: 'middle',
                    background: 'rgba(255,255,255,0.1)',
                    borderRight: '1px solid rgba(255,255,255,0.2)'
                  }}>
                    ⋮⋮
                  </th>
                  {columns.filter(col => col.visible).map(column => (
                    <th 
                      key={column.key}
                      style={{ 
                        padding: '8px', 
                        minWidth: column.width,
                        maxWidth: column.width,
                        height: '42px',
                        verticalAlign: 'middle',
                        borderRight: '1px solid rgba(255,255,255,0.2)'
                      }}
                    >
                      {column.label}
                    </th>
                  ))}
                  <th style={{ 
                    padding: '8px', 
                    textAlign: 'center', 
                    width: '80px',
                    height: '42px',
                    verticalAlign: 'middle'
                  }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                <SortableContext items={sortedCoupons.map(c => c.id)} strategy={verticalListSortingStrategy}>
                  {sortedCoupons.map((coupon, index) => (
                    <SortableRow
                      key={coupon.id}
                      coupon={coupon}
                      index={index}
                      onEdit={handleDataChange}
                      onDelete={handleDelete}
                      columns={columns}
                      merchants={merchants}
                    />
                  ))}
                </SortableContext>
              </tbody>
            </table>
          </DndContext>
        </div>
      </div>

      {/* Instructions */}
      <div style={{ 
        background: '#444', 
        padding: '15px', 
        borderRadius: '8px', 
        marginTop: '20px',
        fontSize: '12px',
        color: '#aaa'
      }}>
        <strong>Instructions:</strong>
        <ul style={{ margin: '10px 0', paddingLeft: '20px' }}>
          <li><strong>Drag & Drop:</strong> Drag rows by the ⋮⋮ handle to reorder priorities</li>
          <li><strong>Edit:</strong> Click any cell to edit directly</li>
          <li><strong>Save:</strong> Click "Save All Changes" to persist edits</li>
          <li><strong>Priority:</strong> Priorities automatically update based on row order</li>
        </ul>
      </div>
    </div>
  );
};

export default CouponEditorNew;
