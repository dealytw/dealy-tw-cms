import React, { useState, useEffect } from 'react';

interface DashboardStats {
  totalMerchants: number;
  totalCoupons: number;
  totalCategories: number;
  totalTopics: number;
  totalPages: number;
  totalSearches: number;
  avgSearchResults: number;
  topSearches: Array<{ query: string; count: number }>;
  searchTrends: Record<string, any>;
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch basic counts with error handling for each API
      const fetchWithFallback = async (url: string, fallback: any) => {
        try {
          const response = await fetch(url);
          if (response.ok) {
            return await response.json();
          }
          return fallback;
        } catch (err) {
          console.warn(`Failed to fetch ${url}:`, err);
          return fallback;
        }
      };

      const [merchants, coupons, categories, topics, pages, searches] = await Promise.all([
        fetchWithFallback('/api/merchants?pagination[pageSize]=1', { meta: { pagination: { total: 0 } } }),
        fetchWithFallback('/api/coupons?pagination[pageSize]=1', { meta: { pagination: { total: 0 } } }),
        fetchWithFallback('/api/merchant-categories?pagination[pageSize]=1', { meta: { pagination: { total: 0 } } }),
        fetchWithFallback('/api/topics?pagination[pageSize]=1', { meta: { pagination: { total: 0 } } }),
        fetchWithFallback('/api/pages?pagination[pageSize]=1', { meta: { pagination: { total: 0 } } }),
        fetchWithFallback('/api/search/analytics?days=30', { data: {} })
      ]);

      const searchData = searches.data || {};
      
      setStats({
        totalMerchants: merchants.meta?.pagination?.total || 0,
        totalCoupons: coupons.meta?.pagination?.total || 0,
        totalCategories: categories.meta?.pagination?.total || 0,
        totalTopics: topics.meta?.pagination?.total || 0,
        totalPages: pages.meta?.pagination?.total || 0,
        totalSearches: searchData.totalSearches || 0,
        avgSearchResults: searchData.avgResults || 0,
        topSearches: searchData.topQueries || [],
        searchTrends: searchData.searchTypes || {}
      });

      setLastUpdated(new Date());
    } catch (err) {
      setError('Failed to fetch dashboard statistics');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleRefresh = () => {
    fetchStats();
  };

  if (loading) {
    return (
      <div style={{ padding: '32px', textAlign: 'center' }}>
        <div>Loading...</div>
        <div>Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '32px' }}>
        <div style={{ color: 'red', marginBottom: '16px' }}>
          {error}
        </div>
        <button onClick={handleRefresh} style={{ marginTop: '16px' }}>
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '32px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1>Dashboard</h1>
        <p>Overview of your CMS content and performance</p>
        {lastUpdated && (
          <small>
            Last updated: {lastUpdated.toLocaleString()}
          </small>
        )}
      </div>

      <div style={{ marginBottom: '24px' }}>
        <button onClick={handleRefresh}>
          Refresh Data
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div style={{ border: '1px solid #ddd', padding: '16px', borderRadius: '4px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div>Total Merchants</div>
              <h2>{stats?.totalMerchants || 0}</h2>
            </div>
          </div>
        </div>

        <div style={{ border: '1px solid #ddd', padding: '16px', borderRadius: '4px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div>Active Coupons</div>
              <h2>{stats?.totalCoupons || 0}</h2>
            </div>
          </div>
        </div>

        <div style={{ border: '1px solid #ddd', padding: '16px', borderRadius: '4px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div>Categories</div>
              <h2>{stats?.totalCategories || 0}</h2>
            </div>
          </div>
        </div>

        <div style={{ border: '1px solid #ddd', padding: '16px', borderRadius: '4px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div>Topics</div>
              <h2>{stats?.totalTopics || 0}</h2>
            </div>
          </div>
        </div>

        <div style={{ border: '1px solid #ddd', padding: '16px', borderRadius: '4px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div>Static Pages</div>
              <h2>{stats?.totalPages || 0}</h2>
            </div>
          </div>
        </div>
      </div>

      {stats && stats.totalSearches > 0 && (
        <div style={{ border: '1px solid #ddd', padding: '16px', borderRadius: '4px', marginBottom: '24px' }}>
          <h3>Search Analytics (Last 30 Days)</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div>
              <div>Total Searches</div>
              <div>{stats.totalSearches}</div>
            </div>

            <div>
              <div>Average Results per Search</div>
              <div>{stats.avgSearchResults.toFixed(1)}</div>
            </div>
          </div>

          {stats.topSearches.length > 0 && (
            <div style={{ marginTop: '16px' }}>
              <div style={{ marginBottom: '8px' }}>
                Top Search Terms
              </div>
              <div>
                {stats.topSearches.slice(0, 5).map((search, index) => (
                  <div key={index} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span>{search.query}</span>
                    <span>{search.count} searches</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div style={{ border: '1px solid #ddd', padding: '16px', borderRadius: '4px' }}>
        <h3>Quick Actions</h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button 
            onClick={() => window.open('/admin/content-manager/collectionType/api::merchant.merchant', '_blank')}
          >
            Manage Merchants
          </button>
          
          <button 
            onClick={() => window.open('/admin/content-manager/collectionType/api::coupon.coupon', '_blank')}
          >
            Manage Coupons
          </button>
          
          <button 
            onClick={() => window.open('/admin/content-manager/collectionType/api::page.page', '_blank')}
          >
            Manage Pages
          </button>
          
          <button 
            onClick={() => window.open('/sitemap.xml', '_blank')}
          >
            View Sitemap
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
