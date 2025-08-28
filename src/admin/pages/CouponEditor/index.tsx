import React, { useState, useEffect } from 'react';

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

const CouponEditor: React.FC = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [editingData, setEditingData] = useState<{ [key: number]: Partial<Coupon> }>({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCoupon, setNewCoupon] = useState<Partial<Coupon>>({});
  const [filters, setFilters] = useState({
    market: '',
    merchant: '',
    status: '',
    type: ''
  });
  const [columnVisibility, setColumnVisibility] = useState(true);
  const [draggedId, setDraggedId] = useState<number | null>(null);
  const [draggedColumnIndex, setDraggedColumnIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [merchants, setMerchants] = useState<any[]>([]);

  // Column configuration with all fields from your schema
  const [columns, setColumns] = useState<ColumnConfig[]>([
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
    { key: 'publishedAt', label: 'Published', visible: false, width: 120, type: 'date' },
    { key: 'createdAt', label: 'Created', visible: false, width: 120, type: 'date' },
    { key: 'updatedAt', label: 'Updated', visible: false, width: 120, type: 'date' }
  ]);

  // Load real data from Strapi API
  useEffect(() => {
    loadCoupons();
    loadMerchants();
  }, []);

  const loadCoupons = async () => {
    try {
      setLoading(true);
      // Use our custom admin API endpoint
      const response = await fetch('/api/coupons/admin', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        credentials: 'same-origin'
      });
      
      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Raw coupon data:', data);
        console.log('First coupon item:', data.results?.[0]);
        const formattedCoupons = data.results.map((item: any) => ({
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
      } else {
        console.error('Failed to load coupons:', response.status, response.statusText);
        const text = await response.text();
        console.error('Response text:', text.substring(0, 200));
      }
    } catch (error: any) {
      console.error('Error loading coupons:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMerchants = async () => {
    try {
      const response = await fetch('/api/merchants/admin', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        credentials: 'same-origin'
      });
      
      console.log('Merchant response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        setMerchants(data.results || []);
      } else {
        console.error('Failed to load merchants:', response.status, response.statusText);
        const text = await response.text();
        console.error('Merchant response text:', text.substring(0, 200));
      }
    } catch (error: any) {
      console.error('Error loading merchants:', error);
    }
  };

  // Handle data changes for any field
  const handleDataChange = (couponId: number, field: keyof Coupon, value: any) => {
    setEditingData(prev => ({
      ...prev,
      [couponId]: {
        ...prev[couponId],
        [field]: value
      }
    }));
  };

  // Save all changes to Strapi
  const handleSaveAll = async () => {
    if (Object.keys(editingData).length === 0) {
      alert('No changes to save');
      return;
    }

    try {
      setSaving(true);
      const updatePromises = Object.entries(editingData).map(async ([couponId, changes]) => {
        const id = parseInt(couponId);
        const response = await fetch(`/admin/content-manager/collection-types/api::coupon.coupon/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(changes),
          credentials: 'same-origin'
        });
        
        if (!response.ok) {
          throw new Error(`Failed to update coupon ${id}: ${response.statusText}`);
        }
        
        return response.json();
      });

      await Promise.all(updatePromises);
      
      // Reload data to get updated values
      await loadCoupons();
      setEditingData({});
      alert('All changes saved successfully!');
    } catch (error) {
      console.error('Error saving changes:', error);
      alert(`Error saving changes: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  // Handle delete from Strapi
  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this coupon?')) return;

    try {
      const response = await fetch(`/admin/content-manager/collection-types/api::coupon.coupon/${id}`, {
        method: 'DELETE',
        credentials: 'same-origin'
      });
      
      if (response.ok) {
        setCoupons(coupons.filter(c => c.id !== id));
        alert('Coupon deleted successfully!');
      } else {
        alert('Failed to delete coupon');
      }
    } catch (error) {
      console.error('Error deleting coupon:', error);
      alert('Error deleting coupon');
    }
  };

  // Handle add new coupon to Strapi
  const handleAdd = async () => {
    if (!newCoupon.coupon_title || !newCoupon.merchant || !newCoupon.affiliate_link) {
      alert('Title, Merchant, and Affiliate Link are required');
      return;
    }

    try {
      setSaving(true);
      const response = await fetch('/api/coupons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: {
            coupon_title: newCoupon.coupon_title,
            value: newCoupon.value || '',
            code: newCoupon.code || '',
            coupon_type: newCoupon.coupon_type || 'coupon',
            affiliate_link: newCoupon.affiliate_link || '',
            description: newCoupon.description || '',
            editor_tips: newCoupon.editor_tips || '',
            priority: newCoupon.priority || 0,
                      starts_at: newCoupon.starts_at || null,
          expires_at: newCoupon.expires_at || null,
            coupon_status: 'active',
            user_count: 0,
            display_count: 0,
            site: newCoupon.site || '',
            merchant: newCoupon.merchant?.id,
            market: newCoupon.market || 'TW'
          }
        }),
        credentials: 'same-origin'
      });

      if (response.ok) {
        await loadCoupons();
        setNewCoupon({});
        setShowAddForm(false);
        alert('Coupon created successfully!');
      } else {
        const errorData = await response.json();
        alert(`Failed to create coupon: ${errorData.error?.message || response.statusText}`);
      }
    } catch (error) {
      console.error('Error creating coupon:', error);
      alert('Error creating coupon');
    } finally {
      setSaving(false);
    }
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, id: number) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, targetId: number) => {
    e.preventDefault();
    if (draggedId === null || draggedId === targetId) return;

    try {
      // Get current filtered and sorted coupons
      const currentOrder = filteredCoupons.map(c => c.id);
      const draggedIndex = currentOrder.indexOf(draggedId);
      const targetIndex = currentOrder.indexOf(targetId);
      
      if (draggedIndex === -1 || targetIndex === -1) return;

      // Create new order array
      const newOrder = [...currentOrder];
      const [draggedItem] = newOrder.splice(draggedIndex, 1);
      newOrder.splice(targetIndex, 0, draggedItem);

      // Group coupons by merchant and update priorities per merchant
      const merchantGroups: { [merchantId: number]: number[] } = {};
      
      // Group the new order by merchant
      newOrder.forEach(couponId => {
        const coupon = filteredCoupons.find(c => c.id === couponId);
        if (coupon && coupon.merchant?.id) {
          if (!merchantGroups[coupon.merchant.id]) {
            merchantGroups[coupon.merchant.id] = [];
          }
          merchantGroups[coupon.merchant.id].push(couponId);
        }
      });

      // Update priorities: first row of each merchant gets priority 1
      const priorityUpdates: { id: number; priority: number }[] = [];
      
      Object.values(merchantGroups).forEach(merchantCoupons => {
        merchantCoupons.forEach((couponId, index) => {
          priorityUpdates.push({
            id: couponId,
            priority: index + 1 // First row = priority 1, second = 2, etc.
          });
        });
      });

      // Update all affected coupons with new priorities
      await Promise.all(
        priorityUpdates.map(update => 
          fetch(`/api/coupons/${update.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ data: { priority: update.priority } }),
            credentials: 'same-origin'
          })
        )
      );

      // Reload coupons to get updated data
      await loadCoupons();
      setDraggedId(null);
    } catch (error) {
      console.error('Error updating priorities:', error);
      alert('Error updating priorities');
    }
  };

  // Column drag handlers
  const handleColumnDragStart = (e: React.DragEvent, index: number) => {
    setDraggedColumnIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleColumnDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleColumnDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedColumnIndex === null || draggedColumnIndex === targetIndex) return;

    const visibleColumns = columns.filter(col => col.visible);
    const newColumns = [...columns];
    
    // Find the actual column indices
    const draggedColumn = visibleColumns[draggedColumnIndex];
    const targetColumn = visibleColumns[targetIndex];
    
    const draggedColIndex = newColumns.findIndex(col => col.key === draggedColumn.key);
    const targetColIndex = newColumns.findIndex(col => col.key === targetColumn.key);
    
    // Reorder columns
    const [removed] = newColumns.splice(draggedColIndex, 1);
    newColumns.splice(targetColIndex, 0, removed);
    
    setColumns(newColumns);
    setDraggedColumnIndex(null);
  };

  // Add hover effect for quick add lines
  useEffect(() => {
    const handleMouseEnter = (e: Event) => {
      const target = e.target as HTMLElement;
      const couponRow = target.closest('tr[draggable="true"]');
      if (couponRow) {
        const couponId = couponRow.getAttribute('data-coupon-id');
        if (couponId) {
          // Show quick add line after this row
          const quickAddLine = document.querySelector(`.quick-add-line[data-coupon-id="${couponId}"]`) as HTMLElement;
          if (quickAddLine) {
            quickAddLine.style.opacity = '1';
          }
          
          // Show quick add line before first row if this is the first row
          const quickAddLineBefore = document.querySelector(`.quick-add-line[data-coupon-id="before-${couponId}"]`) as HTMLElement;
          if (quickAddLineBefore) {
            quickAddLineBefore.style.opacity = '1';
          }
        }
      }
    };

    const handleMouseLeave = (e: Event) => {
      const target = e.target as HTMLElement;
      const couponRow = target.closest('tr[draggable="true"]');
      if (couponRow) {
        const couponId = couponRow.getAttribute('data-coupon-id');
        if (couponId) {
          // Hide quick add line after this row
          const quickAddLine = document.querySelector(`.quick-add-line[data-coupon-id="${couponId}"]`) as HTMLElement;
          if (quickAddLine) {
            quickAddLine.style.opacity = '0';
          }
          
          // Hide quick add line before first row
          const quickAddLineBefore = document.querySelector(`.quick-add-line[data-coupon-id="before-${couponId}"]`) as HTMLElement;
          if (quickAddLineBefore) {
            quickAddLineBefore.style.opacity = '0';
          }
        }
      }
    };

    // Add event listeners to all coupon rows
    const couponRows = document.querySelectorAll('tr[draggable="true"]');
    couponRows.forEach(row => {
      row.addEventListener('mouseenter', handleMouseEnter);
      row.addEventListener('mouseleave', handleMouseLeave);
    });

    // Cleanup
    return () => {
      couponRows.forEach(row => {
        row.removeEventListener('mouseenter', handleMouseEnter);
        row.removeEventListener('mouseleave', handleMouseLeave);
      });
    };
  }, [coupons.length]);

  // Quick add coupon above or below existing coupon
  const handleQuickAdd = async (referenceId: number, position: 'above' | 'below') => {
    try {
      const referenceCoupon = coupons.find(c => c.id === referenceId);
      if (!referenceCoupon) return;

      // Create a new coupon with similar settings
      const newCouponData = {
        coupon_title: `New Coupon ${Date.now()}`,
        affiliate_link: 'https://example.com', // Required field
        merchant: referenceCoupon.merchant?.id || 1,
        market: referenceCoupon.market || 'TW',
        coupon_status: 'active',
        priority: position === 'above' ? referenceCoupon.priority + 1 : referenceCoupon.priority - 1,
        coupon_type: 'coupon',
        value: '',
        code: '',
        description: '',
        editor_tips: '',
        user_count: 0,
        display_count: 0,
        site: ''
      };

      const response = await fetch('/api/coupons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data: newCouponData }),
        credentials: 'same-origin'
      });

      if (response.ok) {
        // Reload coupons to show the new one
        await loadCoupons();
      } else {
        const errorData = await response.json();
        alert(`Error creating coupon: ${errorData.error?.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error adding coupon:', error);
      alert('Error adding coupon');
    }
  };

  // Filter coupons based on current filters
  const filteredCoupons = coupons.filter(coupon => {
    if (filters.market && coupon.market !== filters.market) return false;
            if (filters.merchant && coupon.merchant?.merchant_name?.toLowerCase().includes(filters.merchant.toLowerCase())) return false;
    if (filters.status && coupon.coupon_status !== filters.status) return false;
    if (filters.type && coupon.coupon_type !== filters.type) return false;
    return true;
  }).sort((a, b) => {
    // First sort by merchant (group merchants together)
    if (a.merchant?.id !== b.merchant?.id) {
      return (a.merchant?.id || 0) - (b.merchant?.id || 0);
    }
    // Then by priority within each merchant (priority 1 first)
    if (a.priority !== b.priority) {
      return a.priority - b.priority; // Lower number = higher priority
    }
    // Then by expiry date (earliest first)
    if (a.expires_at && b.expires_at) {
      return new Date(a.expires_at).getTime() - new Date(b.expires_at).getTime();
    }
    return 0;
  });

  // Render cell based on field type
  const renderCell = (coupon: Coupon, column: ColumnConfig) => {
    const value = editingData[coupon.id]?.[column.key] ?? coupon[column.key];
    
    switch (column.type) {
      case 'text':
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => handleDataChange(coupon.id, column.key, e.target.value)}
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
            onChange={(e) => handleDataChange(coupon.id, column.key, parseInt(e.target.value) || 0)}
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
            onChange={(e) => handleDataChange(coupon.id, column.key, e.target.value)}
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
            onChange={(e) => handleDataChange(coupon.id, column.key, e.target.value)}
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
                handleDataChange(coupon.id, column.key, merchant ? {
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

  if (loading) {
    return (
      <div style={{ padding: '20px', color: 'white', textAlign: 'center' }}>
        <h2>Loading coupons from Strapi...</h2>
        <p>Please wait while we fetch your data...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', color: 'white', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <h1 style={{ color: 'white', marginBottom: '8px' }}>Coupon Editor - Real Strapi Data</h1>
      <p style={{ color: '#aaa', marginBottom: '20px' }}>
        Always-on edit mode with real-time Strapi integration. Changes here sync with Content Manager!
      </p>

      {/* Controls Bar */}
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
          + Add Coupon
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
          {saving ? ' Saving...' : ` Save All Changes (${Object.keys(editingData).length})`}
        </button>

        <button
          onClick={() => setColumnVisibility(!columnVisibility)}
          style={{ 
            background: '#6c757d', 
            color: 'white', 
            border: 'none', 
            padding: '8px 16px', 
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          {columnVisibility ? ' Hide Columns' : ' Show Columns'}
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

        <span style={{ color: '#aaa' }}>|</span>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <span style={{ color: '#aaa', fontSize: '14px' }}>Filters:</span>
          
          <select
            value={filters.market}
            onChange={(e) => setFilters(prev => ({ ...prev, market: e.target.value }))}
            style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid #ddd' }}
          >
            <option value="">All Markets</option>
            <option value="TW">TW</option>
            <option value="HK">HK</option>
          </select>

          <input
            type="text"
            placeholder="Filter by merchant..."
            value={filters.merchant}
            onChange={(e) => setFilters(prev => ({ ...prev, merchant: e.target.value }))}
            style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid #ddd', width: '150px' }}
          />

          <select
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid #ddd' }}
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="expired">Expired</option>
            <option value="scheduled">Scheduled</option>
            <option value="archived">Archived</option>
          </select>

          <select
            value={filters.type}
            onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
            style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid #ddd' }}
          >
            <option value="">All Types</option>
            <option value="promo_code">Promo Code</option>
            <option value="coupon">Coupon</option>
            <option value="discount">Discount</option>
          </select>
        </div>

        <span style={{ color: '#aaa' }}>|</span>
        <span style={{ color: '#aaa', fontSize: '14px' }}>
          Showing {filteredCoupons.length} of {coupons.length} coupons
        </span>
      </div>

      {/* Add New Coupon Form */}
      {showAddForm && (
        <div style={{ 
          background: '#333', 
          padding: '20px', 
          borderRadius: '8px', 
          marginBottom: '20px' 
        }}>
          <h3 style={{ color: 'white', marginBottom: '15px' }}>Add New Coupon</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', marginBottom: '15px' }}>
            <div>
              <label style={{ color: 'white', display: 'block', marginBottom: '4px' }}>Title *</label>
              <input
                type="text"
                value={newCoupon.coupon_title || ''}
                onChange={(e) => setNewCoupon({ ...newCoupon, coupon_title: e.target.value })}
                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
              />
            </div>
            <div>
              <label style={{ color: 'white', display: 'block', marginBottom: '4px' }}>Merchant *</label>
              <select
                value={newCoupon.merchant?.id || ''}
                onChange={(e) => {
                  const merchantId = parseInt(e.target.value);
                  const merchant = merchants.find(m => m.id === merchantId);
                  setNewCoupon({ ...newCoupon, merchant: merchant ? {
                    id: merchant.id,
                    merchant_name: merchant.merchant_name,
                    slug: merchant.slug
                  } : null });
                }}
                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
              >
                <option value="">Select Merchant...</option>
                {merchants.map(merchant => (
                  <option key={merchant.id} value={merchant.id}>
                    {merchant.merchant_name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ color: 'white', display: 'block', marginBottom: '4px' }}>Market</label>
              <select
                value={newCoupon.market || 'TW'}
                onChange={(e) => setNewCoupon({ ...newCoupon, market: e.target.value })}
                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
              >
                <option value="TW">TW</option>
                <option value="HK">HK</option>
              </select>
            </div>
            <div>
              <label style={{ color: 'white', display: 'block', marginBottom: '4px' }}>Priority</label>
              <input
                type="number"
                value={newCoupon.priority || 0}
                onChange={(e) => setNewCoupon({ ...newCoupon, priority: parseInt(e.target.value) || 0 })}
                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
              />
            </div>
            <div>
              <label style={{ color: 'white', display: 'block', marginBottom: '4px' }}>Value</label>
              <input
                type="text"
                value={newCoupon.value || ''}
                onChange={(e) => setNewCoupon({ ...newCoupon, value: e.target.value })}
                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
              />
            </div>
            <div>
              <label style={{ color: 'white', display: 'block', marginBottom: '4px' }}>Code</label>
              <input
                type="text"
                value={newCoupon.code || ''}
                onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value })}
                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
              />
            </div>
            <div>
              <label style={{ color: 'white', display: 'block', marginBottom: '4px' }}>Affiliate Link *</label>
              <input
                type="url"
                value={newCoupon.affiliate_link || ''}
                onChange={(e) => setNewCoupon({ ...newCoupon, affiliate_link: e.target.value })}
                placeholder="https://example.com"
                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                required
              />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={handleAdd}
              disabled={saving}
              style={{ 
                background: saving ? '#6c757d' : '#28a745', 
                color: 'white', 
                border: 'none', 
                padding: '8px 16px', 
                borderRadius: '4px',
                cursor: saving ? 'not-allowed' : 'pointer'
              }}
            >
              {saving ? 'Creating...' : 'Add Coupon'}
            </button>
            <button
              onClick={() => setShowAddForm(false)}
              style={{ 
                background: '#6c757d', 
                color: 'white', 
                border: 'none', 
                padding: '8px 16px', 
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Column Visibility Toggle */}
      {columnVisibility && (
        <div style={{ 
          background: '#444', 
          padding: '15px', 
          borderRadius: '8px', 
          marginBottom: '20px',
          display: 'flex',
          gap: '10px',
          flexWrap: 'wrap'
        }}>
          <span style={{ color: 'white', fontSize: '14px', marginRight: '10px' }}>Toggle Columns:</span>
          {columns.map(column => (
            <label key={column.key} style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'white', fontSize: '12px' }}>
              <input
                type="checkbox"
                checked={column.visible}
                onChange={(e) => {
                  const newColumns = columns.map(c => 
                    c.key === column.key ? { ...c, visible: e.target.checked } : c
                  );
                  setColumns(newColumns);
                }}
              />
              {column.label}
            </label>
          ))}
        </div>
      )}

      {/* Spreadsheet Table */}
      <div style={{ 
        background: '#333', 
        borderRadius: '8px', 
        overflow: 'hidden',
        flex: 1,
        minHeight: '400px'
      }}>
        <div style={{ 
          overflowX: 'auto',
          overflowY: 'hidden',
          width: '100%'
        }}>
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
                height: '42px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
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
                {columns.filter(col => col.visible).map((column, index) => (
                  <th 
                    key={column.key}
                    draggable
                    onDragStart={(e) => handleColumnDragStart(e, index)}
                    onDragOver={handleColumnDragOver}
                    onDrop={(e) => handleColumnDrop(e, index)}
                                          style={{ 
                        padding: '8px', 
                        minWidth: column.width,
                        maxWidth: column.width,
                        height: '42px',
                        verticalAlign: 'middle',
                        cursor: 'grab',
                        userSelect: 'none',
                        borderRight: '1px solid rgba(255,255,255,0.2)',
                        background: draggedColumnIndex === index ? 'rgba(255,255,255,0.2)' : 'transparent',
                        transition: 'background 0.2s ease'
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
              {filteredCoupons.map((coupon, index) => (
                <React.Fragment key={coupon.id}>




                  {/* Main Coupon Row */}
                  <tr 
                    style={{ 
                      borderBottom: '1px solid rgba(255,255,255,0.1)',
                      background: draggedId === coupon.id ? 'rgba(102, 126, 234, 0.2)' : (index % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent'),
                      height: '42px',
                      position: 'relative',
                      transition: 'background 0.2s ease'
                    }}
                    data-coupon-id={coupon.id}
                  >
                    {/* Drag Handle */}
                    <td 
                      style={{ 
                        padding: '2px 4px', 
                        width: '40px', 
                        textAlign: 'center',
                        verticalAlign: 'middle',
                        height: '42px',
                        background: 'rgba(255,255,255,0.05)',
                        borderRight: '1px solid rgba(255,255,255,0.1)',
                        position: 'relative'
                      }}
                    >
                      {/* Add Row Above Button */}
                      <div
                        style={{
                          width: '16px',
                          height: '8px',
                          background: '#28a745',
                          borderRadius: '2px',
                          cursor: 'pointer',
                          margin: '1px auto',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '10px',
                          color: 'white',
                          opacity: 0.7,
                          transition: 'all 0.2s ease'
                        }}
                        onClick={() => handleQuickAdd(coupon.id, 'above')}
                        onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                        onMouseLeave={(e) => e.currentTarget.style.opacity = '0.7'}
                        title="Add row above"
                      >
                        +
                      </div>
                      
                      {/* Drag Handle */}
                      <div
                        style={{
                          cursor: 'grab',
                          fontSize: '14px',
                          color: '#ccc',
                          margin: '2px 0'
                        }}
                        draggable
                        onDragStart={(e) => handleDragStart(e, coupon.id)}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, coupon.id)}
                      >
                        ⋮⋮
                      </div>
                      
                      {/* Add Row Below Button */}
                      <div
                        style={{
                          width: '16px',
                          height: '8px',
                          background: '#28a745',
                          borderRadius: '2px',
                          cursor: 'pointer',
                          margin: '1px auto',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '10px',
                          color: 'white',
                          opacity: 0.7,
                          transition: 'all 0.2s ease'
                        }}
                        onClick={() => handleQuickAdd(coupon.id, 'below')}
                        onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                        onMouseLeave={(e) => e.currentTarget.style.opacity = '0.7'}
                        title="Add row below"
                      >
                        +
                      </div>
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
                          {renderCell(coupon, column)}
                        </td>
                      ))}
                    <td style={{ 
                      padding: '6px 8px', 
                      width: '80px',
                      verticalAlign: 'middle',
                      height: '42px'
                    }}>
                      <button
                        onClick={() => handleDelete(coupon.id)}
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


                  
                </React.Fragment>
              ))}
            </tbody>
          </table>
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
        <strong> Instructions:</strong>
        <ul style={{ margin: '10px 0', paddingLeft: '20px' }}>
          <li><strong>Real Strapi Data:</strong> This editor is now connected to your actual Strapi database!</li>
          <li><strong>Always Editing:</strong> Click any cell to edit directly - no edit buttons needed!</li>
          <li><strong>Drag & Drop:</strong> Drag rows to reorder priority (higher rows = higher priority)</li>
          <li><strong>Filters:</strong> Use the filter controls above to show only specific coupons</li>
          <li><strong>Columns:</strong> Toggle column visibility to focus on important fields</li>
          <li><strong>Save:</strong> Click "Save All Changes" to persist your edits to Strapi</li>
          <li><strong>n8n Integration:</strong> Changes here will be visible in Content Manager and your frontend!</li>
        </ul>
      </div>
    </div>
  );
};

export default CouponEditor;
