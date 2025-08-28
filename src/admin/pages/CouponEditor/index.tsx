import React, { useState, useEffect, useCallback } from 'react';

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

interface Merchant {
  id: number;
  merchant_name: string;
  slug: string;
  market: string;
}

interface ColumnConfig {
  key: keyof Coupon;
  label: string;
  visible: boolean;
  width: number;
  type: 'text' | 'number' | 'date' | 'select' | 'relation' | 'enum' | 'readonly';
  options?: string[];
  sortable?: boolean;
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
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 25,
    total: 0
  });
  const [sorting, setSorting] = useState({
    field: 'createdAt',
    order: 'desc'
  });
  const [columnVisibility, setColumnVisibility] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Optimized column configuration for PostgreSQL
  const [columns, setColumns] = useState<ColumnConfig[]>([
    { key: 'merchant', label: 'Merchant', visible: true, width: 150, type: 'relation', sortable: true },
    { key: 'coupon_title', label: 'Title', visible: true, width: 200, type: 'text', sortable: true },
    { key: 'value', label: 'Value', visible: true, width: 120, type: 'text', sortable: true },
    { key: 'code', label: 'Code', visible: true, width: 120, type: 'text', sortable: true },
    { key: 'coupon_type', label: 'Type', visible: true, width: 120, type: 'enum', options: ['promo_code', 'coupon', 'discount'], sortable: true },
    { key: 'affiliate_link', label: 'Affiliate Link', visible: true, width: 200, type: 'text', sortable: false },
    { key: 'description', label: 'Description', visible: true, width: 200, type: 'text', sortable: false },
    { key: 'editor_tips', label: 'Editor Tips', visible: true, width: 200, type: 'text', sortable: false },
    { key: 'priority', label: 'Priority', visible: true, width: 80, type: 'number', sortable: true },
    { key: 'starts_at', label: 'Starts At', visible: true, width: 120, type: 'date', sortable: true },
    { key: 'expires_at', label: 'Expires At', visible: true, width: 120, type: 'date', sortable: true },
    { key: 'coupon_status', label: 'Status', visible: true, width: 100, type: 'enum', options: ['active', 'expired', 'scheduled', 'archived'], sortable: true },
    { key: 'user_count', label: 'User Count', visible: true, width: 100, type: 'number', sortable: true },
    { key: 'last_click_at', label: 'Last Click', visible: true, width: 150, type: 'date', sortable: true },
    { key: 'display_count', label: 'Display Count', visible: true, width: 120, type: 'number', sortable: true },
    { key: 'site', label: 'Site', visible: true, width: 120, type: 'text', sortable: true },
    { key: 'market', label: 'Market', visible: true, width: 80, type: 'enum', options: ['TW', 'HK'], sortable: true },
    { key: 'coupon_uid', label: 'UID', visible: true, width: 180, type: 'readonly', sortable: false },
    { key: 'publishedAt', label: 'Published', visible: false, width: 120, type: 'date', sortable: true },
    { key: 'createdAt', label: 'Created', visible: false, width: 120, type: 'date', sortable: true },
    { key: 'updatedAt', label: 'Updated', visible: false, width: 120, type: 'date', sortable: true }
  ]);

  // Load data with PostgreSQL-optimized queries
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load merchants first (they're needed for the coupon form)
      await loadMerchants();
      
      // Then load coupons
      await loadCoupons();
    } catch (error) {
      console.error('Error loading initial data:', error);
      setError('Failed to load initial data. Please check your database connection.');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadCoupons = useCallback(async () => {
    try {
      // Build query parameters for PostgreSQL optimization
      const queryParams = new URLSearchParams({
        'pagination[page]': pagination.page.toString(),
        'pagination[pageSize]': pagination.pageSize.toString(),
        'sort': `${sorting.field}:${sorting.order}`,
        'populate': 'merchant',
        'filters[market][$eq]': filters.market || '',
        'filters[coupon_status][$eq]': filters.status || '',
        'filters[coupon_type][$eq]': filters.type || '',
        'filters[merchant][id][$eq]': filters.merchant || ''
      });

      // Use Strapi's native API for better PostgreSQL performance
      const response = await fetch(`/api/coupons?${queryParams}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        
        // Format data for the editor
        const formattedCoupons = data.data.map((item: any) => ({
          id: item.id,
          coupon_uid: item.attributes?.coupon_uid || '',
          coupon_title: item.attributes?.coupon_title || '',
          value: item.attributes?.value || '',
          code: item.attributes?.code || '',
          coupon_type: item.attributes?.coupon_type || 'coupon',
          affiliate_link: item.attributes?.affiliate_link || '',
          description: item.attributes?.description || '',
          editor_tips: item.attributes?.editor_tips || '',
          priority: item.attributes?.priority || 0,
          starts_at: item.attributes?.starts_at || '',
          expires_at: item.attributes?.expires_at || '',
          coupon_status: item.attributes?.coupon_status || 'active',
          user_count: item.attributes?.user_count || 0,
          last_click_at: item.attributes?.last_click_at || '',
          display_count: item.attributes?.display_count || 0,
          site: item.attributes?.site || '',
          merchant: item.attributes?.merchant?.data ? {
            id: item.attributes.merchant.data.id,
            merchant_name: item.attributes.merchant.data.attributes?.merchant_name || '',
            slug: item.attributes.merchant.data.attributes?.slug || ''
        } : null,
          market: item.attributes?.market || 'TW',
          publishedAt: item.attributes?.publishedAt || '',
          createdAt: item.attributes?.createdAt || '',
          updatedAt: item.attributes?.updatedAt || ''
        }));

        setCoupons(formattedCoupons);
        setPagination(prev => ({
          ...prev,
          total: data.meta?.pagination?.total || 0
        }));
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error: any) {
      console.error('Error loading coupons:', error);
      setError(`Failed to load coupons: ${error.message}`);
    }
  }, [pagination.page, pagination.pageSize, sorting.field, sorting.order, filters]);

  const loadMerchants = useCallback(async () => {
    try {
      // Load merchants from Strapi's native API
      const response = await fetch('/api/merchants?pagination[pageSize]=100&sort=merchant_name:asc', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        const formattedMerchants = data.data.map((item: any) => ({
          id: item.id,
          merchant_name: item.attributes?.merchant_name || '',
          slug: item.attributes?.slug || '',
          market: item.attributes?.market || 'TW'
        }));
        setMerchants(formattedMerchants);
      } else {
        console.warn('Failed to load merchants, will try to extract from coupons');
        setMerchants([]);
      }
    } catch (error: any) {
      console.error('Error loading merchants:', error);
      setMerchants([]);
    }
  }, []);

  // Refresh data when filters or pagination change
  useEffect(() => {
    if (!loading) {
      loadCoupons();
    }
  }, [filters, pagination.page, sorting]);

  // Save coupon changes
  const saveCoupon = async (couponId: number, changes: Partial<Coupon>) => {
    try {
      setSaving(true);
      
      // Prepare data for Strapi API
      const updateData = {
        data: {
          coupon_title: changes.coupon_title,
          value: changes.value,
          code: changes.code,
          coupon_type: changes.coupon_type,
          affiliate_link: changes.affiliate_link,
          description: changes.description,
          editor_tips: changes.editor_tips,
          priority: changes.priority,
          starts_at: changes.starts_at,
          expires_at: changes.expires_at,
          coupon_status: changes.coupon_status,
          site: changes.site,
          market: changes.market,
          merchant: changes.merchant?.id || null
        }
      };

      const response = await fetch(`/api/coupons/${couponId}`, {
          method: 'PUT',
          headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });

      if (response.ok) {
        // Update local state
        setCoupons(prev => prev.map(coupon => 
          coupon.id === couponId 
            ? { ...coupon, ...changes }
            : coupon
        ));
        
        // Clear editing state
        setEditingData(prev => {
          const newState = { ...prev };
          delete newState[couponId];
          return newState;
        });
        
        console.log(`Coupon ${couponId} updated successfully`);
      } else {
        throw new Error(`Failed to update coupon: ${response.statusText}`);
      }
    } catch (error: any) {
      console.error('Error saving coupon:', error);
      setError(`Failed to save coupon: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  // Create new coupon
  const createCoupon = async (couponData: Partial<Coupon>) => {
    try {
      setSaving(true);
      
      const createData = {
        data: {
          coupon_title: couponData.coupon_title || '',
          value: couponData.value || '',
          code: couponData.code || '',
          coupon_type: couponData.coupon_type || 'coupon',
          affiliate_link: couponData.affiliate_link || '',
          description: couponData.description || '',
          editor_tips: couponData.editor_tips || '',
          priority: couponData.priority || 0,
          starts_at: couponData.starts_at || '',
          expires_at: couponData.expires_at || '',
          coupon_status: couponData.coupon_status || 'active',
          site: couponData.site || '',
          market: couponData.market || 'TW',
          merchant: couponData.merchant?.id || null
        }
      };

      const response = await fetch('/api/coupons', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(createData)
      });

      if (response.ok) {
        const newCoupon = await response.json();
        setCoupons(prev => [newCoupon.data, ...prev]);
        setShowAddForm(false);
        setNewCoupon({});
        console.log('New coupon created successfully');
      } else {
        throw new Error(`Failed to create coupon: ${response.statusText}`);
      }
    } catch (error: any) {
      console.error('Error creating coupon:', error);
      setError(`Failed to create coupon: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  // Handle sorting
  const handleSort = (field: keyof Coupon) => {
    setSorting(prev => ({
      field,
      order: prev.field === field && prev.order === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Handle filters
  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page
  };

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <div>Loading Coupon Editor...</div>
        <div>Connecting to PostgreSQL database...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '20px', color: 'red' }}>
        <h3>Error Loading Coupon Editor</h3>
        <p>{error}</p>
        <button onClick={loadInitialData}>Retry</button>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>Coupon Editor</h1>
      <p>Manage coupons with PostgreSQL database integration</p>
      
      {/* Filters */}
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <select 
          value={filters.market} 
          onChange={(e) => handleFilterChange('market', e.target.value)}
          style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
        >
          <option value="">All Markets</option>
          <option value="TW">Taiwan</option>
          <option value="HK">Hong Kong</option>
        </select>
        
        <select 
          value={filters.status} 
          onChange={(e) => handleFilterChange('status', e.target.value)}
          style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="expired">Expired</option>
          <option value="scheduled">Scheduled</option>
          <option value="archived">Archived</option>
        </select>
        
          <select
          value={filters.type} 
          onChange={(e) => handleFilterChange('type', e.target.value)}
          style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
        >
          <option value="">All Types</option>
          <option value="promo_code">Promo Code</option>
          <option value="coupon">Coupon</option>
          <option value="discount">Discount</option>
          </select>
        
            <select
          value={filters.merchant} 
          onChange={(e) => handleFilterChange('merchant', e.target.value)}
          style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
        >
          <option value="">All Merchants</option>
              {merchants.map(merchant => (
                <option key={merchant.id} value={merchant.id}>
              {merchant.merchant_name} ({merchant.market})
                </option>
              ))}
            </select>
      </div>

      {/* Add New Coupon Button */}
        <button
        onClick={() => setShowAddForm(true)}
          style={{ 
          marginBottom: '20px', 
          padding: '10px 20px', 
          backgroundColor: '#007bff', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
        + Add New Coupon
        </button>

      {/* Coupons Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ddd' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8f9fa' }}>
              {columns.filter(col => col.visible).map(column => (
                <th 
                  key={column.key}
                  style={{ 
                    padding: '12px', 
                    textAlign: 'left', 
                    border: '1px solid #ddd',
                    cursor: column.sortable ? 'pointer' : 'default',
                    backgroundColor: column.sortable ? '#e9ecef' : '#f8f9fa'
                  }}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  {column.label}
                  {column.sortable && (
                    <span style={{ marginLeft: '5px' }}>
                      {sorting.field === column.key ? (sorting.order === 'asc' ? '↑' : '↓') : '↕'}
                    </span>
                  )}
                </th>
              ))}
              <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #ddd' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {coupons.map(coupon => (
              <tr key={coupon.id}>
                {columns.filter(col => col.visible).map(column => (
                  <td key={column.key} style={{ padding: '8px', border: '1px solid #ddd' }}>
                                         {editingData[coupon.id] ? (
                       <input
                         type={column.type === 'number' ? 'number' : 'text'}
                         value={String(editingData[coupon.id][column.key] || '')}
                         onChange={(e) => setEditingData(prev => ({
                           ...prev,
                           [coupon.id]: { ...prev[coupon.id], [column.key]: e.target.value }
                         }))}
                         style={{ width: '100%', padding: '4px', border: '1px solid #ccc' }}
                       />
                     ) : (
                       <span>{String(coupon[column.key] || '-')}</span>
                     )}
                  </td>
                ))}
                <td style={{ padding: '8px', border: '1px solid #ddd' }}>
                  {editingData[coupon.id] ? (
                    <>
        <button
                        onClick={() => saveCoupon(coupon.id, editingData[coupon.id])}
                        disabled={saving}
          style={{ 
                          marginRight: '5px', 
                          padding: '4px 8px', 
                          backgroundColor: '#28a745', 
            color: 'white', 
            border: 'none', 
                          borderRadius: '3px',
                          cursor: 'pointer'
                        }}
                      >
                        {saving ? 'Saving...' : 'Save'}
        </button>
        <button
                        onClick={() => setEditingData(prev => {
                          const newState = { ...prev };
                          delete newState[coupon.id];
                          return newState;
                        })}
          style={{ 
                          padding: '4px 8px', 
                          backgroundColor: '#6c757d', 
            color: 'white', 
            border: 'none', 
                          borderRadius: '3px',
            cursor: 'pointer'
          }}
        >
                        Cancel
        </button>
                    </>
                  ) : (
        <button
                      onClick={() => setEditingData(prev => ({ ...prev, [coupon.id]: { ...coupon } }))}
          style={{ 
                        padding: '4px 8px', 
                        backgroundColor: '#007bff', 
            color: 'white', 
            border: 'none', 
                        borderRadius: '3px',
            cursor: 'pointer'
          }}
        >
                      Edit
        </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination.total > pagination.pageSize && (
        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <button 
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page === 1}
            style={{ 
              margin: '0 5px', 
              padding: '8px 12px', 
              backgroundColor: pagination.page === 1 ? '#6c757d' : '#007bff', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px',
              cursor: pagination.page === 1 ? 'not-allowed' : 'pointer'
            }}
          >
            Previous
          </button>
          
          <span style={{ margin: '0 10px' }}>
            Page {pagination.page} of {Math.ceil(pagination.total / pagination.pageSize)}
          </span>
          
          <button 
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page >= Math.ceil(pagination.total / pagination.pageSize)}
            style={{ 
              margin: '0 5px', 
              padding: '8px 12px', 
              backgroundColor: pagination.page >= Math.ceil(pagination.total / pagination.pageSize) ? '#6c757d' : '#007bff', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px',
              cursor: pagination.page >= Math.ceil(pagination.total / pagination.pageSize) ? 'not-allowed' : 'pointer'
            }}
          >
            Next
          </button>
        </div>
      )}

      {/* Add New Coupon Form */}
      {showAddForm && (
        <div style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          backgroundColor: 'rgba(0,0,0,0.5)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center' 
        }}>
          <div style={{ 
            backgroundColor: 'white', 
          padding: '20px', 
          borderRadius: '8px', 
            maxWidth: '500px', 
            width: '90%',
            maxHeight: '80vh',
            overflowY: 'auto'
          }}>
            <h2>Add New Coupon</h2>
            <form onSubmit={(e) => { e.preventDefault(); createCoupon(newCoupon); }}>
              <div style={{ marginBottom: '15px' }}>
                <label>Title:</label>
              <input
                type="text"
                value={newCoupon.coupon_title || ''}
                  onChange={(e) => setNewCoupon(prev => ({ ...prev, coupon_title: e.target.value }))}
                  required
                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
              />
            </div>
              
              <div style={{ marginBottom: '15px' }}>
                <label>Value:</label>
              <input
                type="text"
                value={newCoupon.value || ''}
                  onChange={(e) => setNewCoupon(prev => ({ ...prev, value: e.target.value }))}
                  required
                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
              />
            </div>
              
              <div style={{ marginBottom: '15px' }}>
                <label>Code:</label>
              <input
                type="text"
                value={newCoupon.code || ''}
                  onChange={(e) => setNewCoupon(prev => ({ ...prev, code: e.target.value }))}
                  required
                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
              />
            </div>
              
              <div style={{ marginBottom: '15px' }}>
                <label>Type:</label>
                <select
                  value={newCoupon.coupon_type || 'coupon'}
                  onChange={(e) => setNewCoupon(prev => ({ ...prev, coupon_type: e.target.value }))}
                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                >
                  <option value="promo_code">Promo Code</option>
                  <option value="coupon">Coupon</option>
                  <option value="discount">Discount</option>
                </select>
            </div>
              
              <div style={{ marginBottom: '15px' }}>
                <label>Market:</label>
                <select
                  value={newCoupon.market || 'TW'}
                  onChange={(e) => setNewCoupon(prev => ({ ...prev, market: e.target.value }))}
                  style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                >
                  <option value="TW">Taiwan</option>
                  <option value="HK">Hong Kong</option>
                </select>
          </div>
              
              <div style={{ marginBottom: '15px' }}>
                <label>Merchant:</label>
                <select
                                     value={newCoupon.merchant?.id || ''}
                   onChange={(e) => setNewCoupon(prev => ({ 
                     ...prev, 
                     merchant: merchants.find(m => m.id.toString() === e.target.value) || undefined 
                   }))}
                  style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                >
                  <option value="">Select Merchant</option>
                  {merchants.map(merchant => (
                    <option key={merchant.id} value={merchant.id}>
                      {merchant.merchant_name} ({merchant.market})
                    </option>
                  ))}
                </select>
              </div>
              
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button
                  type="button"
              onClick={() => setShowAddForm(false)}
              style={{ 
                    padding: '10px 20px', 
                    backgroundColor: '#6c757d', 
                color: 'white', 
                border: 'none', 
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
                      <button
                  type="submit"
                  disabled={saving}
                        style={{ 
                    padding: '10px 20px', 
                    backgroundColor: '#28a745', 
                          color: 'white', 
                          border: 'none', 
                          borderRadius: '4px',
                    cursor: 'pointer'
                        }}
                      >
                  {saving ? 'Creating...' : 'Create Coupon'}
                      </button>
        </div>
            </form>
      </div>
      </div>
      )}
    </div>
  );
};

export default CouponEditor;
