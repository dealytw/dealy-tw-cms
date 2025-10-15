// src/admin/app.jsx  — Strapi v5.22
import React, { useEffect, useMemo, useState } from 'react';
import {
  unstable_useContentManagerContext as useContentManagerContext,
  useFetchClient,
} from '@strapi/strapi/admin';

const MERCHANT_UID = 'api::merchant.merchant';
const RELATION_KEY = 'coupons';

// Admin-internal CM list fetch (works without public permissions)
async function fetchCouponsByMerchantCM(get, merchantDocumentId) {
  const qs = new URLSearchParams({
    'filters[merchant][documentId][$eq]': String(merchantDocumentId),
    'fields[0]': 'documentId',
    'fields[1]': 'coupon_title',
    publicationState: 'preview',
    'pagination[pageSize]': '200',
  });
  const res = await get(
    `/content-manager/collection-types/api::coupon.coupon?${qs.toString()}`
  );
  const list = res?.data?.results ?? [];
  return list.map((row) => ({
    id: row?.documentId ?? row?.id,
    title: row?.coupon_title ?? '',
  }));
}

function CouponToolsPanel() {
  const ctx = useContentManagerContext();
  const { get, post } = useFetchClient();

  // Be liberal in what we accept (v5.22 variations)
  const uid = ctx?.model || ctx?.contentType?.uid;
  const status = ctx?.status || ctx?.queryStatus || 'resolved';

  // Try many sources, plus a URL fallback
  const path = typeof window !== 'undefined' ? window.location.pathname : '';
  const fromUrl =
    path.match(/content-manager\/collection-types\/api::merchant\.merchant\/([^/?#]+)/)?.[1] ??
    null;

  const merchantId =
    ctx?.documentId ??
    ctx?.params?.id ??
    ctx?.document?.id ??
    ctx?.form?.initialData?.id ??
    ctx?.initialDocumentId ??
    fromUrl ??
    null;

  const isMerchant = uid === MERCHANT_UID;
  const isEdit = Boolean(merchantId);

  // Prefer relation live in form state (fastest)
  const relationFromForm = useMemo(() => {
    const rel = ctx?.document?.[RELATION_KEY];
    if (!Array.isArray(rel)) return [];
    return rel.map((r) => ({
      id: r?.documentId ?? r?.id,
      title: r?.coupon_title ?? r?.title ?? '',
    }));
  }, [JSON.stringify(ctx?.document?.[RELATION_KEY] || [])]);

  const [items, setItems] = useState([]);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);

  // drag + drop
  const [dragIndex, setDragIndex] = useState(null);

  function handleDragStart(e, idx) {
    setDragIndex(idx);
    // browsers require a payload to allow dropping
    e.dataTransfer.setData('text/plain', String(idx));
    e.dataTransfer.effectAllowed = 'move';
  }

  function handleDragOver(e) {
    // must prevent default to enable drop
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }

  function handleDrop(e, dropIndex) {
    e.preventDefault();
    const fromStr = e.dataTransfer.getData('text/plain');
    const from = fromStr ? parseInt(fromStr, 10) : dragIndex;
    if (from == null || Number.isNaN(from) || from === dropIndex) return;

    setItems(prev => {
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(dropIndex, 0, moved);
      return next;
    });
    setDragIndex(null);
  }

  function handleDragEnd() {
    setDragIndex(null);
  }

  // Load related coupons: form state → CM API fallback
  useEffect(() => {
    setMsg(null);

    // wait until CM resolved the entry (v5.22)
    if (status !== 'resolved') return;

    if (!(isMerchant && isEdit)) {
      setItems([]);
      return;
    }

    if (relationFromForm.length) {
      setItems(relationFromForm);
      return;
    }

    (async () => {
      try {
        const rows = await fetchCouponsByMerchantCM(get, merchantId);
        setItems(rows);
      } catch (e) {
        console.error('[coupon-tools] CM list fetch failed', e);
        setItems([]);
        setMsg('Failed to fetch related coupons from API');
      }
    })();
  }, [get, status, isMerchant, isEdit, merchantId, relationFromForm]);

  const applyOrder = async () => {
    if (!(isMerchant && isEdit)) return;
    const ids = items.map((r) => r.id).filter(Boolean);
    if (!ids.length) {
      setMsg('No coupons to order.');
      return;
    }
    try {
      setBusy(true);
      setMsg(null);
      await post(`/api/merchants/${merchantId}/reorder-coupons`, { couponIds: ids });
      setMsg('Saved order → priority 1..n');
    } catch (e) {
      console.error(e);
      setMsg(e?.response?.data?.error?.message || 'Failed to save order');
    } finally {
      setBusy(false);
    }
  };

  // ✅ IMPORTANT: always return content (don't return null).
  // This keeps the panel visible between ENTRY and PREVIEW and shows
  // the helpful "Save this Merchant once" message if there's no ID yet.
  return {
    title: 'COUPON TOOLS',
    content: (
      <div style={{ padding: 12 }}>
        <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 8 }}>
          uid: <b>{String(uid || '—')}</b> · docId: <b>{String(merchantId || '—')}</b> ·{' '}
          isMerchant: <b>{String(isMerchant)}</b> · isEdit: <b>{String(isEdit)}</b>
        </div>

        {(!isMerchant || !isEdit) ? (
          <div style={{ fontSize: 14 }}>
            Open a <b>Merchant</b> entry and <b>Save</b> it once so it has an ID.
          </div>
        ) : (
          <>
            <div style={{ margin: '8px 0', fontWeight: 600 }}>
              Related coupons detected: {items.length}
            </div>

            {items.length > 0 && (
              <ul style={{ listStyle: 'none', margin: '8px 0 12px 0', padding: 0 }}>
                {items.map((c, idx) => (
                  <li
                    key={String(c.id)}
                    draggable
                    onDragStart={(e) => handleDragStart(e, idx)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, idx)}
                    onDragEnd={handleDragEnd}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '6px 8px',
                      marginBottom: 6,
                      border: '1px solid #3a3a3a',
                      borderRadius: 6,
                      background:
                        dragIndex === idx ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.04)',
                      cursor: dragIndex === idx ? 'grabbing' : 'grab',
                      userSelect: 'none',
                    }}
                    title="Drag to reorder"
                  >
                    <span style={{ opacity: 0.7, fontFamily: 'monospace' }}>⋮⋮</span>
                    <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {c.title || '(untitled coupon)'}
                    </span>
                    <a
                      href={`/admin/content-manager/collection-types/api::coupon.coupon/${c.id}`}
                      onClick={(e) => e.stopPropagation()} // don't kill the drag
                      draggable={false}                     // link won't steal the drag
                      style={{ fontSize: 12 }}
                    >
                      open
                    </a>
                  </li>
                ))}
              </ul>
            )}

            <button
              type="button"
              onClick={applyOrder}
              disabled={busy || items.length === 0}
              style={{
                padding: '6px 10px',
                borderRadius: 6,
                border: '1px solid #555',
                background: busy ? '#333' : '#444',
                color: '#fff',
                cursor: busy || items.length === 0 ? 'not-allowed' : 'pointer',
              }}
            >
              {busy ? 'Saving…' : 'Apply current order'}
            </button>

            {msg && <div style={{ marginTop: 8, fontSize: 12, opacity: 0.85 }}>{msg}</div>}
          </>
        )}
      </div>
    ),
  };
}

export default {
  config: {
    theme: {
      light: {
        colors: {
          primary100: '#f5f5dc',
          primary200: '#e6d3a3',
          primary500: '#d2b48c',
          primary600: '#bc9a6a',
          primary700: '#8b7355',
          danger700: '#dc2626',
          success600: '#059669',
          warning600: '#d97706',
          buttonPrimary600: '#d2b48c',
          buttonPrimary500: '#e6d3a3',
          neutral0: '#f7f3f0',
          neutral100: '#ede7e3',
          neutral200: '#e6d3a3',
          neutral300: '#d2b48c',
          neutral400: '#bc9a6a',
          neutral500: '#8b7355',
          neutral600: '#6b5b47',
          neutral700: '#5a4a3a',
          neutral800: '#4a3a2e',
          neutral900: '#3a2a22',
        },
      },
      dark: {
        colors: {
          primary100: '#f5f5dc',
          primary200: '#e6d3a3',
          primary500: '#d2b48c',
          primary600: '#bc9a6a',
          primary700: '#8b7355',
          danger700: '#dc2626',
          success600: '#059669',
          warning600: '#d97706',
          buttonPrimary600: '#d2b48c',
          buttonPrimary500: '#e6d3a3',
          neutral0: '#f7f3f0',
          neutral100: '#ede7e3',
          neutral200: '#e6d3a3',
          neutral300: '#d2b48c',
          neutral400: '#bc9a6a',
          neutral500: '#8b7355',
          neutral600: '#6b5b47',
          neutral700: '#5a4a3a',
          neutral800: '#4a3a2e',
          neutral900: '#3a2a22',
        },
      },
    },
  },
  register(app) {
    const apis = app.getPlugin('content-manager')?.apis;
    if (!apis) {
      console.error('[coupon-tools] content-manager apis not found');
      return;
    }
    // This places the block in the right sidebar between ENTRY & PREVIEW
    apis.addEditViewSidePanel([CouponToolsPanel]);
    console.log('[coupon-tools] registered (v5.22)');
  },
  bootstrap() {},
};