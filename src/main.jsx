import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Html5Qrcode } from "html5-qrcode";
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  FileText,
  HeartPulse,
  Info,
  LoaderCircle,
  LogIn,
  LogOut,
  Minus,
  PackageCheck,
  Plus,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  UploadCloud,
  UserRound,
  X,
  LayoutDashboard,
  Users,
  ClipboardList,
  Package,
  Boxes,
  MonitorCog,
  ShoppingBag,
  TrendingUp,
  RefreshCw,
  CircleDollarSign
} from 'lucide-react';

import './styles.css';
import './mobile.css';


// ============================================================
// API CONFIG
// ============================================================

const API =
  import.meta.env.VITE_API_URL ||
  `${window.location.protocol}//${window.location.hostname}:5000/api`;


// ============================================================
// API HELPER
// ============================================================

async function api(path, options = {}) {

  const token =
    localStorage.getItem('dm_token');

  const headers =
    new Headers(options.headers || {});

  if (token) {

    headers.set(
      'Authorization',
      `Bearer ${token}`
    );

  }

  if (
    options.body &&
    !(options.body instanceof FormData)
  ) {

    headers.set(
      'Content-Type',
      'application/json'
    );

  }

  const response =
    await fetch(
      `${API}${path}`,
      {
        ...options,
        headers
      }
    );

  const data =
    await response
      .json()
      .catch(() => ({}));

  if (!response.ok) {

    throw new Error(
      data.message ||
      `Request failed (${response.status})`
    );

  }

  return data;
}


// ============================================================
// CARD
// ============================================================

function Card({
  children,
  className = ''
}) {

  return (
    <div
      className={`card ${className}`}
    >
      {children}
    </div>
  );

}


// ============================================================
// BUTTON
// ============================================================

function Button({
  children,
  className = '',
  ...props
}) {

  return (
    <button
      className={`btn ${className}`}
      {...props}
    >
      {children}
    </button>
  );

}
function MachineScanner({ onMachineFound, onClose }) {
  const scannerRef = useRef(null);
  const callbackRef = useRef(onMachineFound);
  const [error, setError] = useState('');

  useEffect(() => {
    callbackRef.current = onMachineFound;
  }, [onMachineFound]);

  useEffect(() => {
    let active = true;
    let started = false;

    async function startScanner() {
      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          throw new Error('Camera API unavailable');
        }

        const element = document.getElementById('machine-reader');
        if (!element) throw new Error('Scanner container not found');

        const scanner = new Html5Qrcode('machine-reader');
        scannerRef.current = scanner;

        await scanner.start(
          { facingMode: { ideal: 'environment' } },
          {
            fps: 10,
            qrbox: (viewfinderWidth, viewfinderHeight) => {
              const size = Math.floor(Math.min(viewfinderWidth, viewfinderHeight) * 0.68);
              return { width: Math.max(180, Math.min(size, 300)), height: Math.max(180, Math.min(size, 300)) };
            },
            aspectRatio: 1.0,
            disableFlip: false
          },
          async (decodedText) => {
            if (!active) return;
            const machineId = decodedText.trim();
            if (!machineId) return;

            if (started) {
              started = false;
              try { await scanner.stop(); } catch {}
              try { scanner.clear(); } catch {}
            }

            if (active) callbackRef.current(machineId);
          },
          () => {}
        );

        started = true;
      } catch (err) {
        console.error('QR scanner error:', err);
        if (active) {
          setError(
            window.isSecureContext
              ? 'Camera could not be started. Allow camera permission or use Demo Machine.'
              : 'Camera access requires HTTPS on most phones. Use the Demo Machine button for now.'
          );
        }
      }
    }

    startScanner();

    return () => {
      active = false;
      const scanner = scannerRef.current;
      scannerRef.current = null;
      if (scanner && started) {
        started = false;
        scanner.stop().catch(() => {}).finally(() => {
          try { scanner.clear(); } catch {}
        });
      }
    };
  }, []);

  return (
    <div className="scanner-overlay">
      <div className="scanner-card">
        <div className="scanner-header">
          <div>
            <h2>Scan Vending Machine</h2>
            <p>Point your camera at the DailyMeds QR code.</p>
          </div>
          <button type="button" onClick={onClose}>✕</button>
        </div>
        <div id="machine-reader" className="machine-reader" />
        {error && <div className="error-message">{error}</div>}
        <div className="scanner-help">
          <strong>Machine QR</strong>
          <span>Scan the QR code attached to the vending machine.</span>
        </div>
        <Button
          className="secondary full"
          onClick={() => callbackRef.current('DM-DEMO-001')}
        >
          Connect Demo Machine
        </Button>
      </div>
    </div>
  );
}



// ============================================================
// ADMIN DASHBOARD
// ============================================================

const adminPageStyle = {
  minHeight: '680px',
  padding: '8px 0 36px'
};

const adminPanelStyle = {
  background: '#ffffff',
  border: '1px solid #e8ecef',
  borderRadius: '18px',
  padding: '20px',
  boxShadow: '0 10px 30px rgba(20, 35, 45, 0.05)'
};

const adminTableStyle = {
  width: '100%',
  borderCollapse: 'collapse',
  fontSize: '14px'
};

const adminThStyle = {
  textAlign: 'left',
  padding: '12px 10px',
  borderBottom: '1px solid #e8ecef',
  color: '#6b7780',
  fontSize: '12px',
  textTransform: 'uppercase',
  letterSpacing: '0.04em'
};

const adminTdStyle = {
  padding: '14px 10px',
  borderBottom: '1px solid #eef1f3',
  verticalAlign: 'top'
};

function AdminStatCard({ icon: Icon, label, value, sub }) {
  return (
    <div style={{
      background: '#fff',
      border: '1px solid #e8ecef',
      borderRadius: '18px',
      padding: '18px',
      minHeight: '125px',
      boxShadow: '0 8px 24px rgba(20,35,45,.04)'
    }}>
      <div style={{
        width: 42,
        height: 42,
        borderRadius: 12,
        display: 'grid',
        placeItems: 'center',
        background: '#f0f7f5',
        color: '#287b69',
        marginBottom: 14
      }}>
        <Icon size={20} />
      </div>
      <div style={{ color: '#71808a', fontSize: 13 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 800, marginTop: 4 }}>
        {value}
      </div>
      {sub && (
        <div style={{ color: '#8a969d', fontSize: 12, marginTop: 4 }}>
          {sub}
        </div>
      )}
    </div>
  );
}

function AdminSectionTitle({ title, description, action }) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: 16,
      marginBottom: 18,
      flexWrap: 'wrap'
    }}>
      <div>
        <h2 style={{ margin: 0, fontSize: 21 }}>{title}</h2>
        {description && (
          <p style={{ margin: '6px 0 0', color: '#75828b', fontSize: 14 }}>
            {description}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}

function AdminOverview({ stats, orders, users, machines }) {
  const recentOrders = orders.slice(0, 6);
  const recentUsers = users.slice(0, 5);

  return (
    <div style={adminPageStyle}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: 14,
        marginBottom: 20
      }}>
        <AdminStatCard icon={Users} label="Total Users" value={stats?.totalUsers ?? 0} />
        <AdminStatCard icon={FileText} label="Reports" value={stats?.totalReports ?? 0} />
        <AdminStatCard icon={ShoppingBag} label="Orders" value={stats?.totalOrders ?? 0} />
        <AdminStatCard icon={CircleDollarSign} label="Revenue" value={`₹${Number(stats?.revenue || 0).toFixed(2)}`} />
        <AdminStatCard icon={MonitorCog} label="Online Machines" value={stats?.activeMachines ?? 0} />
        <AdminStatCard icon={Package} label="Products" value={stats?.totalProducts ?? 0} />
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1.6fr) minmax(280px, 1fr)',
        gap: 18
      }}>
        <div style={adminPanelStyle}>
          <AdminSectionTitle
            title="Recent orders"
            description="Latest vending-machine activity."
          />
          {recentOrders.length === 0 ? (
            <p className="muted">No orders yet.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={adminTableStyle}>
                <thead>
                  <tr>
                    <th style={adminThStyle}>Order</th>
                    <th style={adminThStyle}>User</th>
                    <th style={adminThStyle}>Amount</th>
                    <th style={adminThStyle}>Payment</th>
                    <th style={adminThStyle}>Dispensing</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map(order => (
                    <tr key={order._id}>
                      <td style={adminTdStyle}>{String(order._id).slice(-8)}</td>
                      <td style={adminTdStyle}>{order.user?.name || '—'}</td>
                      <td style={adminTdStyle}>₹{Number(order.total || 0).toFixed(2)}</td>
                      <td style={adminTdStyle}>{order.paymentStatus || '—'}</td>
                      <td style={adminTdStyle}>{order.dispenseStatus || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div style={adminPanelStyle}>
          <AdminSectionTitle
            title="System snapshot"
            description="Current platform activity."
          />
          <div style={{ display: 'grid', gap: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span className="muted">Paid orders</span>
              <strong>{stats?.paidOrders ?? 0}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span className="muted">Machines</span>
              <strong>{stats?.totalMachines ?? machines.length}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span className="muted">Low-stock products</span>
              <strong>{stats?.lowStockProducts ?? 0}</strong>
            </div>
            <div style={{ height: 1, background: '#eef1f3' }} />
            <strong style={{ marginBottom: 2 }}>New users</strong>
            {recentUsers.length === 0 ? (
              <span className="muted">No users yet.</span>
            ) : recentUsers.map(u => (
              <div key={u._id} style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                <span>{u.name}</span>
                <span className="muted">{u.role || 'user'}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function AdminUsers({ users }) {
  return (
    <div style={adminPageStyle}>
      <div style={adminPanelStyle}>
        <AdminSectionTitle title="Users" description="Registered DailyMeds accounts." />
        <div style={{ overflowX: 'auto' }}>
          <table style={adminTableStyle}>
            <thead>
              <tr>
                <th style={adminThStyle}>Name</th>
                <th style={adminThStyle}>Email</th>
                <th style={adminThStyle}>Role</th>
                <th style={adminThStyle}>Profile</th>
                <th style={adminThStyle}>Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u._id}>
                  <td style={adminTdStyle}><strong>{u.name}</strong></td>
                  <td style={adminTdStyle}>{u.email}</td>
                  <td style={adminTdStyle}>{u.role || 'user'}</td>
                  <td style={adminTdStyle}>{u.profile?.height ? 'Complete' : 'Incomplete'}</td>
                  <td style={adminTdStyle}>{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {users.length === 0 && <p className="muted">No users found.</p>}
      </div>
    </div>
  );
}

function AdminReports({ reports }) {
  return (
    <div style={adminPageStyle}>
      <div style={adminPanelStyle}>
        <AdminSectionTitle title="Medical Reports" description="Uploaded reports and their analysis status." />
        <div style={{ overflowX: 'auto' }}>
          <table style={adminTableStyle}>
            <thead>
              <tr>
                <th style={adminThStyle}>Report</th>
                <th style={adminThStyle}>User</th>
                <th style={adminThStyle}>Status</th>
                <th style={adminThStyle}>Findings</th>
                <th style={adminThStyle}>Outside Range</th>
                <th style={adminThStyle}>Uploaded</th>
              </tr>
            </thead>
            <tbody>
              {reports.map(r => {
                const findings = r.findings || [];
                const outside = findings.filter(x => x.status === 'below' || x.status === 'above').length;
                return (
                  <tr key={r._id}>
                    <td style={adminTdStyle}><strong>{r.originalName || 'Report'}</strong></td>
                    <td style={adminTdStyle}>{r.user?.name || r.user?.email || '—'}</td>
                    <td style={adminTdStyle}>{r.status || '—'}</td>
                    <td style={adminTdStyle}>{findings.length}</td>
                    <td style={adminTdStyle}>{outside}</td>
                    <td style={adminTdStyle}>{r.createdAt ? new Date(r.createdAt).toLocaleDateString() : '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {reports.length === 0 && <p className="muted">No reports uploaded yet.</p>}
      </div>
    </div>
  );
}

function AdminProducts({ products }) {
  return (
    <div style={adminPageStyle}>
      <div style={adminPanelStyle}>
        <AdminSectionTitle title="Products" description="DailyMeds catalogue products." />
        <div style={{ overflowX: 'auto' }}>
          <table style={adminTableStyle}>
            <thead>
              <tr>
                <th style={adminThStyle}>Product</th>
                <th style={adminThStyle}>SKU</th>
                <th style={adminThStyle}>Category</th>
                <th style={adminThStyle}>Price</th>
                <th style={adminThStyle}>Active</th>
                <th style={adminThStyle}>Parameters</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p._id}>
                  <td style={adminTdStyle}><strong>{p.name}</strong></td>
                  <td style={adminTdStyle}>{p.sku || '—'}</td>
                  <td style={adminTdStyle}>{p.category || '—'}</td>
                  <td style={adminTdStyle}>₹{Number(p.price || 0).toFixed(2)}</td>
                  <td style={adminTdStyle}>{p.active ? 'Yes' : 'No'}</td>
                  <td style={adminTdStyle}>{p.supportedParameters?.join(', ') || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {products.length === 0 && <p className="muted">No products found.</p>}
      </div>
    </div>
  );
}

function AdminInventory({ inventory }) {
  return (
    <div style={adminPageStyle}>
      <div style={adminPanelStyle}>
        <AdminSectionTitle title="Inventory" description="Stock available inside connected vending machines." />
        <div style={{ overflowX: 'auto' }}>
          <table style={adminTableStyle}>
            <thead>
              <tr>
                <th style={adminThStyle}>Machine</th>
                <th style={adminThStyle}>Product</th>
                <th style={adminThStyle}>SKU</th>
                <th style={adminThStyle}>Quantity</th>
                <th style={adminThStyle}>Price</th>
                <th style={adminThStyle}>Status</th>
              </tr>
            </thead>
            <tbody>
              {inventory.map((item, index) => (
                <tr key={`${item.machineId}-${item.productId}-${index}`}>
                  <td style={adminTdStyle}>{item.machineId}</td>
                  <td style={adminTdStyle}><strong>{item.productName}</strong></td>
                  <td style={adminTdStyle}>{item.sku || '—'}</td>
                  <td style={{ ...adminTdStyle, fontWeight: 700, color: item.quantity <= 10 ? '#b45309' : '#236c5b' }}>
                    {item.quantity}
                  </td>
                  <td style={adminTdStyle}>₹{Number(item.price || 0).toFixed(2)}</td>
                  <td style={adminTdStyle}>{item.machineStatus || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {inventory.length === 0 && <p className="muted">No inventory records found.</p>}
      </div>
    </div>
  );
}

function AdminMachines({ machines }) {
  return (
    <div style={adminPageStyle}>
      <div style={adminPanelStyle}>
        <AdminSectionTitle title="Vending Machines" description="Connected DailyMeds vending-machine fleet." />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 14 }}>
          {machines.map(machine => {
            const stockItems = machine.inventory || [];
            const totalUnits = stockItems.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
            return (
              <div key={machine._id} style={{ border: '1px solid #e8ecef', borderRadius: 16, padding: 18 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'flex-start' }}>
                  <div>
                    <strong>{machine.machineId}</strong>
                    <div className="muted" style={{ marginTop: 4 }}>{machine.location || 'Location not set'}</div>
                  </div>
                  <span style={{
                    padding: '5px 9px',
                    borderRadius: 999,
                    fontSize: 12,
                    background: machine.status === 'online' ? '#e8f6f1' : '#f2f4f5',
                    color: machine.status === 'online' ? '#24745f' : '#69757d'
                  }}>
                    {machine.status || 'unknown'}
                  </span>
                </div>
                <div style={{ marginTop: 18, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div style={{ background: '#f7f9fa', borderRadius: 12, padding: 12 }}>
                    <small className="muted">Products</small>
                    <div style={{ fontSize: 20, fontWeight: 800 }}>{stockItems.length}</div>
                  </div>
                  <div style={{ background: '#f7f9fa', borderRadius: 12, padding: 12 }}>
                    <small className="muted">Units</small>
                    <div style={{ fontSize: 20, fontWeight: 800 }}>{totalUnits}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        {machines.length === 0 && <p className="muted">No vending machines found.</p>}
      </div>
    </div>
  );
}

function AdminOrders({ orders }) {
  return (
    <div style={adminPageStyle}>
      <div style={adminPanelStyle}>
        <AdminSectionTitle title="Orders" description="All DailyMeds vending orders." />
        <div style={{ overflowX: 'auto' }}>
          <table style={adminTableStyle}>
            <thead>
              <tr>
                <th style={adminThStyle}>Order</th>
                <th style={adminThStyle}>User</th>
                <th style={adminThStyle}>Machine</th>
                <th style={adminThStyle}>Items</th>
                <th style={adminThStyle}>Total</th>
                <th style={adminThStyle}>Payment</th>
                <th style={adminThStyle}>Dispensing</th>
                <th style={adminThStyle}>Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order._id}>
                  <td style={adminTdStyle}>{String(order._id).slice(-8)}</td>
                  <td style={adminTdStyle}>{order.user?.name || order.user?.email || '—'}</td>
                  <td style={adminTdStyle}>{order.machine?.machineId || '—'}</td>
                  <td style={adminTdStyle}>{order.items?.reduce((n, x) => n + Number(x.quantity || 0), 0) || 0}</td>
                  <td style={adminTdStyle}><strong>₹{Number(order.total || 0).toFixed(2)}</strong></td>
                  <td style={adminTdStyle}>{order.paymentStatus || '—'}</td>
                  <td style={adminTdStyle}>{order.dispenseStatus || '—'}</td>
                  <td style={adminTdStyle}>{order.createdAt ? new Date(order.createdAt).toLocaleString() : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {orders.length === 0 && <p className="muted">No orders found.</p>}
      </div>
    </div>
  );
}

function AdminAnalytics({ stats, orders, products }) {
  const paidOrders = orders.filter(o => o.paymentStatus === 'paid');
  const productCounts = {};

  paidOrders.forEach(order => {
    (order.items || []).forEach(item => {
      const name = item.product?.name || 'Unknown product';
      productCounts[name] = (productCounts[name] || 0) + Number(item.quantity || 0);
    });
  });

  const topProducts = Object.entries(productCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  const maxCount = topProducts[0]?.[1] || 1;

  return (
    <div style={adminPageStyle}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14, marginBottom: 18 }}>
        <AdminStatCard icon={TrendingUp} label="Paid Orders" value={stats?.paidOrders ?? paidOrders.length} />
        <AdminStatCard icon={CircleDollarSign} label="Revenue" value={`₹${Number(stats?.revenue || 0).toFixed(2)}`} />
        <AdminStatCard icon={Package} label="Catalogue" value={products.length} />
      </div>

      <div style={adminPanelStyle}>
        <AdminSectionTitle title="Product demand" description="Units sold from paid orders in the current database." />
        {topProducts.length === 0 ? (
          <p className="muted">No paid-order product data yet.</p>
        ) : (
          <div style={{ display: 'grid', gap: 14 }}>
            {topProducts.map(([name, count]) => (
              <div key={name}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 7 }}>
                  <strong>{name}</strong>
                  <span className="muted">{count} unit{count === 1 ? '' : 's'}</span>
                </div>
                <div style={{ height: 10, borderRadius: 999, background: '#edf1f2', overflow: 'hidden' }}>
                  <div style={{ width: `${Math.max(8, (count / maxCount) * 100)}%`, height: '100%', borderRadius: 999, background: '#287b69' }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function AdminDashboard({ user, onLogout }) {
  const [tab, setTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState([]);
  const [products, setProducts] = useState([]);
  const [machines, setMachines] = useState([]);
  const [orders, setOrders] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadAdminData() {
    try {
      setLoading(true);
      setError('');

      const [statsData, usersData, reportsData, productsData, machinesData, ordersData, inventoryData] = await Promise.all([
        api('/admin/stats'),
        api('/admin/users'),
        api('/admin/reports'),
        api('/admin/products'),
        api('/admin/machines'),
        api('/admin/orders'),
        api('/admin/inventory')
      ]);

      setStats(statsData.stats || {});
      setUsers(usersData.users || []);
      setReports(reportsData.reports || []);
      setProducts(productsData.products || []);
      setMachines(machinesData.machines || []);
      setOrders(ordersData.orders || []);
      setInventory(inventoryData.inventory || []);
    } catch (err) {
      console.error('Admin dashboard error:', err);
      setError(err.message || 'Could not load admin dashboard.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAdminData();
  }, []);

  const menu = [
    ['overview', 'Overview', LayoutDashboard],
    ['users', 'Users', Users],
    ['reports', 'Reports', ClipboardList],
    ['products', 'Products', Package],
    ['inventory', 'Inventory', Boxes],
    ['machines', 'Machines', MonitorCog],
    ['orders', 'Orders', ShoppingBag],
    ['analytics', 'Analytics', TrendingUp]
  ];

  const activeLabel = menu.find(item => item[0] === tab)?.[1] || 'Dashboard';

  return (
    <div className="admin-dashboard-root" style={{
      display: 'grid',
      gridTemplateColumns: '230px minmax(0, 1fr)',
      gap: 22,
      minHeight: '700px',
      alignItems: 'start'
    }}>
      <aside style={{
        background: '#fff',
        border: '1px solid #e8ecef',
        borderRadius: 20,
        padding: 14,
        position: 'sticky',
        top: 18,
        boxShadow: '0 10px 30px rgba(20,35,45,.05)'
      }}>
        <div style={{ padding: '12px 10px 18px', borderBottom: '1px solid #eef1f3', marginBottom: 10 }}>
          <div className="brand">
            <div className="logo"><HeartPulse size={20} /></div>
            <div>
              <strong>DailyMeds</strong>
              <small>Admin Panel</small>
            </div>
          </div>
        </div>

        <nav style={{ display: 'grid', gap: 5 }}>
          {menu.map(([key, label, Icon]) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              style={{
                border: 0,
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 11,
                padding: '11px 12px',
                borderRadius: 12,
                cursor: 'pointer',
                textAlign: 'left',
                background: tab === key ? '#eaf5f1' : 'transparent',
                color: tab === key ? '#226e5d' : '#58666f',
                fontWeight: tab === key ? 700 : 500
              }}
            >
              <Icon size={17} />
              {label}
            </button>
          ))}
        </nav>

        <button
          type="button"
          onClick={onLogout}
          style={{
            marginTop: 16,
            width: '100%',
            border: '1px solid #e8ecef',
            background: '#fff',
            color: '#65727a',
            borderRadius: 12,
            padding: '10px 12px',
            display: 'flex',
            alignItems: 'center',
            gap: 9,
            cursor: 'pointer'
          }}
        >
          <LogOut size={16} />
          Log out
        </button>
      </aside>

      <section style={{ minWidth: 0 }}>
        <header style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 14,
          marginBottom: 18,
          flexWrap: 'wrap'
        }}>
          <div>
            <span className="eyebrow">DAILYMEDS ADMIN</span>
            <h1 style={{ margin: '5px 0 4px' }}>{activeLabel}</h1>
            <p className="muted" style={{ margin: 0 }}>
              Manage users, reports, inventory, machines and orders.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              type="button"
              onClick={loadAdminData}
              disabled={loading}
              style={{
                border: '1px solid #dfe5e8',
                background: '#fff',
                borderRadius: 12,
                padding: '10px 13px',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                cursor: 'pointer'
              }}
            >
              <RefreshCw size={16} className={loading ? 'spin' : ''} />
              Refresh
            </button>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 9,
              background: '#fff',
              border: '1px solid #e8ecef',
              borderRadius: 13,
              padding: '8px 12px'
            }}>
              <UserRound size={18} />
              <div>
                <strong style={{ display: 'block', fontSize: 13 }}>{user?.name || 'Admin'}</strong>
                <small className="muted">Administrator</small>
              </div>
            </div>
          </div>
        </header>

        {error && (
          <div className="error" style={{ marginBottom: 18 }}>
            <AlertTriangle size={17} />
            {error}
          </div>
        )}

        {loading ? (
          <Card className="progress">
            <LoaderCircle className="spin" />
            <div>
              <strong>Loading admin data…</strong>
              <p className="muted">Fetching information from MongoDB.</p>
            </div>
          </Card>
        ) : (
          <>
            {tab === 'overview' && <AdminOverview stats={stats} orders={orders} users={users} machines={machines} />}
            {tab === 'users' && <AdminUsers users={users} />}
            {tab === 'reports' && <AdminReports reports={reports} />}
            {tab === 'products' && <AdminProducts products={products} />}
            {tab === 'inventory' && <AdminInventory inventory={inventory} />}
            {tab === 'machines' && <AdminMachines machines={machines} />}
            {tab === 'orders' && <AdminOrders orders={orders} />}
            {tab === 'analytics' && <AdminAnalytics stats={stats} orders={orders} products={products} />}
          </>
        )}
      </section>
    </div>
  );
}


// ============================================================
// APP
// ============================================================

function App() {

  const [
    user,
    setUser
  ] = useState(() => {

    try {

      return JSON.parse(
        localStorage.getItem(
          'dm_user'
        ) || 'null'
      );

    } catch {

      return null;

    }

  });

  const [
    screen,
    setScreen
  ] = useState(() => {
    const token = localStorage.getItem('dm_token');

    if (!token) {
      return 'landing';
    }

    try {
      const savedUser = JSON.parse(
        localStorage.getItem('dm_user') || 'null'
      );

      return savedUser?.role === 'admin'
        ? 'admin'
        : 'home';
    } catch {
      return 'home';
    }
  });


  const [
    profile,
    setProfile
  ] = useState(
    user?.profile || {}
  );


  const [
    report,
    setReport
  ] = useState(null);


  const [
    toast,
    setToast
  ] = useState('');


  // ----------------------------------------------------------
  // Toast
  // ----------------------------------------------------------

  function notify(message) {

    setToast(message);

    setTimeout(
      () => setToast(''),
      3000
    );

  }


  // ----------------------------------------------------------
  // Restore login
  // ----------------------------------------------------------

  useEffect(() => {

    const token =
      localStorage.getItem(
        'dm_token'
      );

    if (!token) {
      return;
    }

    api('/me')

      .then(({ user }) => {

        setUser(user);

        setProfile(
          user.profile || {}
        );

        setScreen(
          user?.role === 'admin'
            ? 'admin'
            : 'home'
        );

      })

      .catch(() => {

        logout();

      });

  }, []);


  // ----------------------------------------------------------
  // Logout
  // ----------------------------------------------------------

  function logout() {

    localStorage.removeItem(
      'dm_token'
    );

    localStorage.removeItem(
      'dm_user'
    );

    setUser(null);
    setProfile({});
    setReport(null);
    setScreen('landing');

  }


  // ----------------------------------------------------------
  // Authentication
  // ----------------------------------------------------------

  async function handleAuth(
    mode,
    payload
  ) {

    const endpoint =
      mode === 'register'
        ? '/auth/register'
        : '/auth/login';

    const selectedRole =
      payload.role || 'patient';

    const requestPayload = {
      ...payload
    };

    delete requestPayload.role;

    const data =
      await api(
        endpoint,
        {
          method: 'POST',
          body:
            JSON.stringify(requestPayload)
        }
      );

    const actualRole =
      data.user?.role === 'admin'
        ? 'admin'
        : 'patient';

    if (actualRole !== selectedRole) {
      throw new Error(
        selectedRole === 'admin'
          ? 'This account does not have administrator access.'
          : 'This is an administrator account. Please choose Admin login.'
      );
    }

    localStorage.setItem(
      'dm_token',
      data.token
    );

    localStorage.setItem(
      'dm_user',
      JSON.stringify(
        data.user
      )
    );

    setUser(
      data.user
    );

    setProfile(
      data.user.profile || {}
    );

    setScreen(
      actualRole === 'admin'
        ? 'admin'
        : 'home'
    );

  }


  // ----------------------------------------------------------
  // Save profile
  // ----------------------------------------------------------

  async function saveProfile(
    nextProfile
  ) {

    const data =
      await api(
        '/me/profile',
        {
          method: 'PUT',
          body:
            JSON.stringify(
              nextProfile
            )
        }
      );

    setProfile(
      data.profile
    );

    const updatedUser = {
      ...user,
      profile:
        data.profile
    };

    setUser(
      updatedUser
    );

    localStorage.setItem(
      'dm_user',
      JSON.stringify(
        updatedUser
      )
    );

    notify(
      'Health profile saved'
    );

    setScreen(
      'home'
    );

  }


  // ==========================================================
  // RENDER
  // ==========================================================

  return (

    <div className="app">

      {/* ====================================================
          HEADER
      ==================================================== */}

      <header className="topbar">

        <div className="brand">

          <div className="logo">
            <HeartPulse
              size={22}
            />
          </div>

          <div>

            <strong>
              DailyMeds
            </strong>

            <small>
              Smart health → vending
            </small>

          </div>

        </div>


        {user && (

          <button
            className="logout"
            onClick={logout}
          >

            <LogOut
              size={16}
            />

            Log out

          </button>
          

        )}

      </header>


      {/* ====================================================
          CONTENT
      ==================================================== */}

      <main className="container">

        {screen === 'landing' && (

          <Landing
            onLogin={() =>
              setScreen('auth')
            }
          />

        )}

        {screen === 'auth' && (

          <Auth
            onSubmit={
              handleAuth
            }
            onBack={() =>
              setScreen('landing')
            }
          />

        )}

        {screen === 'admin' && user?.role === 'admin' && (

          <AdminDashboard
            user={user}
            onLogout={logout}
          />

        )}


        {screen === 'home' && (

          <Home
            user={user}
            profile={profile}
            report={report}
            go={setScreen}
          />

        )}


        {screen === 'profile' && (

          <Profile
            profile={profile}
            onSave={
              saveProfile
            }
            onBack={() =>
              setScreen(
                'home'
              )
            }
          />

        )}


        {screen === 'report' && (

          <ReportUpload
            onBack={() =>
              setScreen(
                'home'
              )
            }
            onAnalyzed={
              (analysis) => {

                setReport(
                  analysis
                );

                setScreen(
                  'analysis'
                );

              }
            }
            notify={
              notify
            }
          />

        )}


        {screen === 'analysis' && (

          <Analysis
            report={report}
            onBack={() =>
              setScreen(
                'home'
              )
            }
            onRecommendations={() =>
              setScreen(
                'recommendations'
              )
            }
          />

        )}


        {screen === 'recommendations' && (

          <Recommendations
            report={report}
            onBack={() =>
              setScreen(
                'analysis'
              )
            }
            notify={
              notify
            }
          />

        )}


        {screen === 'machine' && (

          <MachineCheckout
            report={report}
            onBack={() =>
              setScreen(
                'recommendations'
              )
            }
            notify={
              notify
            }
          />

        )}

      </main>


      {/* ====================================================
          TOAST
      ==================================================== */}

      {toast && (

        <div className="toast">

          <CheckCircle2
            size={17}
          />

          {toast}

        </div>

      )}


      {/* ====================================================
          FOOTER
      ==================================================== */}

      <footer>

        Prototype only • Not a diagnosis or
        prescription • Never use an automated
        result to choose a medicine or dose
        without qualified professional review.

      </footer>
     
    </div>

  );

}


// ============================================================
// INTRODUCTORY LANDING PAGE
// ============================================================

function Landing({
  onLogin
}) {

  return (
    <>
      <style>{`
        .landing-page {
          min-height: calc(100vh - 170px);
          display: flex;
          align-items: center;
          padding: 48px 0 64px;
        }
        .landing-shell {
          width: 100%;
          max-width: 1120px;
          margin: 0 auto;
        }
        .landing-hero {
          display: grid;
          grid-template-columns: 1.08fr .92fr;
          gap: 52px;
          align-items: center;
        }
        .landing-kicker {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 13px;
          border-radius: 999px;
          background: #eaf8f5;
          color: #187a68;
          font-size: 13px;
          font-weight: 800;
          letter-spacing: .04em;
        }
        .landing-title {
          margin: 18px 0 16px;
          font-size: clamp(42px, 6vw, 72px);
          line-height: 1.02;
          letter-spacing: -.045em;
          color: #172033;
        }
        .landing-title span { color: #218b77; }
        .landing-copy {
          max-width: 650px;
          font-size: 18px;
          line-height: 1.7;
          color: #687893;
          margin: 0 0 28px;
        }
        .landing-actions {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }
        .landing-login {
          min-width: 150px;
        }
        .landing-trust {
          display: flex;
          gap: 18px;
          flex-wrap: wrap;
          margin-top: 28px;
          color: #73819a;
          font-size: 13px;
          font-weight: 700;
        }
        .landing-trust span {
          display: inline-flex;
          align-items: center;
          gap: 7px;
        }
        .landing-visual {
          position: relative;
          min-height: 450px;
          display: grid;
          place-items: center;
        }
        .landing-glow {
          position: absolute;
          width: 360px;
          height: 360px;
          border-radius: 50%;
          background: radial-gradient(circle, #dff5ef 0%, #edf8f6 48%, rgba(237,248,246,0) 72%);
        }
        .landing-card {
          position: relative;
          width: min(390px, 92%);
          padding: 28px;
          border: 1px solid #dfe9e7;
          border-radius: 28px;
          background: rgba(255,255,255,.94);
          box-shadow: 0 24px 70px rgba(28, 56, 75, .12);
        }
        .landing-card-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }
        .landing-mini-logo {
          width: 48px;
          height: 48px;
          border-radius: 15px;
          display: grid;
          place-items: center;
          background: #218b77;
          color: white;
        }
        .landing-live {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 7px 10px;
          border-radius: 999px;
          background: #eef9f5;
          color: #187a68;
          font-size: 12px;
          font-weight: 800;
        }
        .landing-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #28a57e;
        }
        .landing-flow {
          display: grid;
          gap: 10px;
        }
        .landing-flow-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 13px 14px;
          border-radius: 15px;
          background: #f7fafb;
          border: 1px solid #e9eff1;
          color: #25334b;
          font-weight: 750;
        }
        .landing-flow-icon {
          width: 34px;
          height: 34px;
          border-radius: 10px;
          display: grid;
          place-items: center;
          background: #eaf8f5;
          color: #218b77;
        }
        .landing-bottom {
          margin-top: 56px;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 14px;
        }
        .landing-feature {
          padding: 20px;
          border: 1px solid #e4ebed;
          border-radius: 18px;
          background: rgba(255,255,255,.72);
        }
        .landing-feature strong { display:block; margin: 10px 0 5px; color:#172033; }
        .landing-feature p { margin:0; color:#74829a; line-height:1.55; font-size:14px; }
        .login-role-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          margin: 20px 0;
        }
        .login-role {
          border: 1.5px solid #dfe7ea;
          background: #fff;
          border-radius: 16px;
          padding: 16px;
          cursor: pointer;
          text-align: left;
          color: #25334b;
          transition: .18s ease;
        }
        .login-role:hover { transform: translateY(-1px); border-color: #9bcfc3; }
        .login-role.active {
          border-color: #218b77;
          background: #eef9f6;
          box-shadow: 0 0 0 3px rgba(33,139,119,.08);
        }
        .login-role-icon {
          width: 38px; height: 38px; border-radius: 11px;
          display:grid; place-items:center;
          background:#f1f5f6; color:#63738b; margin-bottom:9px;
        }
        .login-role.active .login-role-icon { background:#d9f1ea; color:#218b77; }
        .login-role strong { display:block; font-size:15px; }
        .login-role small { display:block; margin-top:4px; color:#78869b; line-height:1.4; }
        .login-back {
          display:flex; align-items:center; gap:6px; margin-bottom:18px;
          border:0; background:transparent; padding:0; color:#6f7f97; cursor:pointer; font-weight:700;
        }
        @media (max-width: 800px) {
          .landing-hero { grid-template-columns: 1fr; gap: 30px; }
          .landing-visual { min-height: 360px; }
          .landing-bottom { grid-template-columns: 1fr; }
          .landing-page { padding-top: 30px; }
        }
        @media (max-width: 520px) {
          .landing-title { font-size: 44px; }
          .landing-copy { font-size: 16px; }
          .login-role-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <section className="landing-page">
        <div className="landing-shell">
          <div className="landing-hero">
            <div>
              <div className="landing-kicker">
                <Sparkles size={15} />
                SMART HEALTH → VENDING
              </div>

              <h1 className="landing-title">
                Healthcare made <span>simpler.</span>
              </h1>

              <p className="landing-copy">
                DailyMeds is a smart healthcare vending prototype that helps users move from health-report insights to an organised, machine-ready purchase journey — all from one simple platform.
              </p>

              <div className="landing-actions">
                <Button
                  className="primary landing-login"
                  onClick={onLogin}
                >
                  Log in
                  <ArrowRight size={17} />
                </Button>
              </div>

              <div className="landing-trust">
                <span><ShieldCheck size={15} /> Safety-first prototype</span>
                <span><Activity size={15} /> Report intelligence</span>
                <span><ShoppingCart size={15} /> Vending checkout</span>
              </div>
            </div>

            <div className="landing-visual">
              <div className="landing-glow" />

              <div className="landing-card">
                <div className="landing-card-top">
                  <div className="landing-mini-logo">
                    <HeartPulse size={25} />
                  </div>
                  <div className="landing-live">
                    <span className="landing-dot" />
                    Prototype active
                  </div>
                </div>

                <h2 style={{margin:'0 0 7px', color:'#172033'}}>Your health journey, connected.</h2>
                <p style={{margin:'0 0 20px', color:'#718099', lineHeight:1.55}}>
                  One platform from report upload to vending-machine checkout.
                </p>

                <div className="landing-flow">
                  <div className="landing-flow-item">
                    <span className="landing-flow-icon"><UserRound size={17} /></span>
                    Create your health profile
                  </div>
                  <div className="landing-flow-item">
                    <span className="landing-flow-icon"><FileText size={17} /></span>
                    Upload & analyse a report
                  </div>
                  <div className="landing-flow-item">
                    <span className="landing-flow-icon"><ShoppingCart size={17} /></span>
                    Review available options
                  </div>
                  <div className="landing-flow-item">
                    <span className="landing-flow-icon"><PackageCheck size={17} /></span>
                    Connect & complete vending checkout
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="landing-bottom">
            <div className="landing-feature">
              <HeartPulse size={21} color="#218b77" />
              <strong>Personalised experience</strong>
              <p>Keep your profile and report information organised in one place.</p>
            </div>
            <div className="landing-feature">
              <FileText size={21} color="#218b77" />
              <strong>Report intelligence</strong>
              <p>Extract supported laboratory values and compare them with the report ranges.</p>
            </div>
            <div className="landing-feature">
              <MonitorCog size={21} color="#218b77" />
              <strong>Smart vending</strong>
              <p>Connect the app to an approved vending-machine workflow and checkout.</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}


// ============================================================
// AUTH
// ============================================================

function Auth({
  onSubmit,
  onBack
}) {

  const [mode, setMode] = useState('login');
  const [role, setRole] = useState('patient');
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError('');

    try {
      await onSubmit(
        mode,
        {
          ...form,
          role
        }
      );
    } catch (error) {
      setError(error.message);
    } finally {
      setBusy(false);
    }
  }

  function changeRole(nextRole) {
    setRole(nextRole);
    setError('');
    if (nextRole === 'admin' && mode === 'register') {
      setMode('login');
    }
  }

  return (
    <div className="auth-wrap">
      <Card className="auth-card">

        <button className="login-back" onClick={onBack} type="button">
          <ArrowLeft size={16} />
          Back to DailyMeds
        </button>

        <div className="brand big">
          <div className="logo">
            <HeartPulse size={24} />
          </div>
          <div>
            <strong>DailyMeds</strong>
            <small>{role === 'admin' ? 'Administration portal' : 'Patient health companion'}</small>
          </div>
        </div>

        <h1>
          {mode === 'login' ? 'Welcome back' : 'Create your account'}
        </h1>

        <p className="muted">
          Choose how you want to access DailyMeds.
        </p>

        <div className="login-role-grid">
          <button
            type="button"
            className={`login-role ${role === 'patient' ? 'active' : ''}`}
            onClick={() => changeRole('patient')}
          >
            <span className="login-role-icon">
              <UserRound size={19} />
            </span>
            <strong>Patient</strong>
            <small>Manage your health profile, reports and vending orders.</small>
          </button>

          <button
            type="button"
            className={`login-role ${role === 'admin' ? 'active' : ''}`}
            onClick={() => changeRole('admin')}
          >
            <span className="login-role-icon">
              <LayoutDashboard size={19} />
            </span>
            <strong>Admin</strong>
            <small>Manage users, reports, products, machines, orders and analytics.</small>
          </button>
        </div>

        {error && (
          <div className="error">
            <AlertTriangle size={17} />
            {error}
          </div>
        )}

        <form className="form" onSubmit={submit}>
          {mode === 'register' && role === 'patient' && (
            <label>
              Full name
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </label>
          )}

          <label>
            Email
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </label>

          <label>
            Password
            <input
              type="password"
              minLength={6}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </label>

          <Button className="primary full" disabled={busy}>
            {busy ? (
              <>
                <LoaderCircle className="spin" />
                Please wait…
              </>
            ) : (
              <>
                {role === 'admin' ? 'Admin log in' : mode === 'login' ? 'Patient log in' : 'Create patient account'}
                <LogIn size={17} />
              </>
            )}
          </Button>
        </form>

        {role === 'patient' && (
          <button
            className="link"
            type="button"
            onClick={() => {
              setMode(mode === 'login' ? 'register' : 'login');
              setError('');
            }}
          >
            {mode === 'login'
              ? 'New to DailyMeds? Create a patient account'
              : 'Already have an account? Patient log in'}
          </button>
        )}

        {role === 'admin' && (
          <p className="muted" style={{ marginTop: 16, fontSize: 12, textAlign: 'center' }}>
            Administrator accounts are created separately and cannot be registered here.
          </p>
        )}

      </Card>
    </div>
  );
}


// ============================================================
// HOME
// ============================================================

function Home({
  user,
  profile,
  report,
  go
}) {

  return (

    <>

      <section className="welcome">

        <div>

          <span className="eyebrow">
            DAILYMEDS
          </span>

          <h1>

            Hello,{' '}
            {user?.name ||
              'there'} 👋

          </h1>

          <p>

            Build your health profile,
            upload a report and review
            available health-product
            options.

          </p>

        </div>


        <div className="avatar">

          <UserRound />

        </div>

      </section>


      <div className="grid">

        {/* PROFILE */}

        <Card>

          <div className="card-icon">

            <UserRound />

          </div>

          <div className="card-status">

            {profile?.height
              ? 'Complete'
              : 'Action needed'}

          </div>

          <h2>
            Health profile
          </h2>

          <p className="muted">

            Age, height, weight,
            allergies, conditions and
            current medicines.

          </p>

          <Button
            className="secondary"
            onClick={() =>
              go('profile')
            }
          >

            {profile?.height
              ? 'Edit profile'
              : 'Complete profile'}

            <ArrowRight
              size={16}
            />

          </Button>

        </Card>


        {/* REPORT */}

        <Card>

          <div className="card-icon">

            <FileText />

          </div>

          <div className="card-status">

            {report
              ? 'Analyzed'
              : 'Step 3'}

          </div>

          <h2>
            Medical report
          </h2>

          <p className="muted">

            Upload a PDF, JPG or PNG
            report and extract supported
            laboratory parameters.

          </p>

          <Button
            className="primary"
            onClick={() =>
              go(
                report
                  ? 'analysis'
                  : 'report'
              )
            }
          >

            {report
              ? 'View analysis'
              : 'Upload report'}

            <ArrowRight
              size={16}
            />

          </Button>

        </Card>


        {/* STEP 4 */}

        <Card>

          <div className="card-icon">

            <ShoppingCart />

          </div>

          <div className="card-status">

            Step 4

          </div>

          <h2>
            Health options
          </h2>

          <p className="muted">

            Review catalogue products
            and prepare your vending
            machine order.

          </p>

          <Button
            className="secondary"
            disabled={!report}
            onClick={() =>
              go(
                'recommendations'
              )
            }
          >

            View options

            <ArrowRight
              size={16}
            />

          </Button>

        </Card>


        {/* SAFETY */}

        <Card className="safety-card">

          <ShieldCheck />

          <div>

            <h2>
              Safety layer
            </h2>

            <p>

              DailyMeds does not
              automatically diagnose
              conditions or calculate
              personalized medicine doses.

            </p>

          </div>

        </Card>

      </div>

    </>

  );

}


// ============================================================
// PROFILE
// ============================================================

function Profile({
  profile,
  onSave,
  onBack
}) {

  const [
    p,
    setP
  ] = useState({

    age:
      profile?.age || '',

    height:
      profile?.height || '',

    weight:
      profile?.weight || '',

    allergies:
      profile?.allergies || '',

    conditions:
      profile?.conditions || '',

    currentMedicines:
      profile?.currentMedicines || ''

  });


  function update(
    key,
    value
  ) {

    setP({
      ...p,
      [key]:
        value
    });

  }


  return (

    <section className="narrow">

      <button
        className="back"
        onClick={onBack}
      >

        <ArrowLeft
          size={16}
        />

        Dashboard

      </button>


      <div className="eyebrow">
        PERSONAL HEALTH
      </div>


      <h1>
        Health profile
      </h1>


      <p className="muted">

        Keep this information accurate.
        It provides context for the
        DailyMeds prototype.

      </p>


      <Card>

        <div className="form-grid">

          <label>

            Age

            <input
              type="number"
              min="0"
              value={p.age}
              onChange={(e) =>
                update(
                  'age',
                  e.target.value
                )
              }
            />

          </label>


          <label>

            Height (cm)

            <input
              type="number"
              min="0"
              value={p.height}
              onChange={(e) =>
                update(
                  'height',
                  e.target.value
                )
              }
            />

          </label>


          <label>

            Weight (kg)

            <input
              type="number"
              min="0"
              value={p.weight}
              onChange={(e) =>
                update(
                  'weight',
                  e.target.value
                )
              }
            />

          </label>


          <label className="wide">

            Allergies

            <textarea
              value={
                p.allergies
              }
              onChange={(e) =>
                update(
                  'allergies',
                  e.target.value
                )
              }
              placeholder="e.g. none known"
            />

          </label>


          <label className="wide">

            Medical history /
            conditions

            <textarea
              value={
                p.conditions
              }
              onChange={(e) =>
                update(
                  'conditions',
                  e.target.value
                )
              }
            />

          </label>


          <label className="wide">

            Current medicines /
            supplements

            <textarea
              value={
                p.currentMedicines
              }
              onChange={(e) =>
                update(
                  'currentMedicines',
                  e.target.value
                )
              }
            />

          </label>

        </div>


        <Button
          className="primary"
          onClick={() =>
            onSave(p)
          }
        >

          Save profile

          <Check
            size={17}
          />

        </Button>

      </Card>

    </section>

  );

}


// ============================================================
// REPORT UPLOAD
// ============================================================

function ReportUpload({
  onBack,
  onAnalyzed,
  notify
}) {

  const [
    file,
    setFile
  ] = useState(null);


  const [
    busy,
    setBusy
  ] = useState(false);


  const [
    stage,
    setStage
  ] = useState('');


  const [
    error,
    setError
  ] = useState('');


  async function analyze() {

    if (!file) {
      return;
    }

    setBusy(true);
    setError('');


    try {

      setStage(
        'Uploading report…'
      );


      const form =
        new FormData();

      form.append(
        'report',
        file
      );


      const uploaded =
        await api(
          '/reports',
          {
            method: 'POST',
            body: form
          }
        );


      setStage(
        'Extracting report data…'
      );


      const result =
        await api(
          `/reports/${uploaded.report.id}/analyze`,
          {
            method: 'POST'
          }
        );


      setStage(
        'Preparing results…'
      );


      await new Promise(
        resolve =>
          setTimeout(
            resolve,
            400
          )
      );


      onAnalyzed(
        result.analysis
      );


      notify(
        'Report analyzed successfully'
      );


    } catch (error) {

      setError(
        error.message
      );

    } finally {

      setBusy(false);
      setStage('');

    }

  }


  return (

    <section className="narrow">

      <button
        className="back"
        onClick={onBack}
      >

        <ArrowLeft
          size={16}
        />

        Dashboard

      </button>


      <div className="eyebrow">

        STEP 3 · REPORT INTELLIGENCE

      </div>


      <h1>
        Upload medical report
      </h1>


      <p className="muted">

        Supported formats:
        PDF, JPG and PNG.
        Maximum 10 MB.

      </p>


      <Card className="upload-box">

        <UploadCloud
          size={45}
        />

        <h2>

          {file
            ? file.name
            : 'Choose your report'}

        </h2>

        <p className="muted">

          Upload a clear medical
          report for analysis.

        </p>


        <input
          id="report-file"
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={(e) => {

            setFile(
              e.target.files?.[0] ||
              null
            );

            setError('');

          }}
        />


        <label
          htmlFor="report-file"
          className="file-button"
        >

          Choose report

        </label>


        {file && (

          <div className="file-chip">

            <FileText
              size={16}
            />

            <span>
              {file.name}
            </span>

            <button
              type="button"
              onClick={() =>
                setFile(null)
              }
            >

              <X
                size={15}
              />

            </button>

          </div>

        )}

      </Card>


      {error && (

        <div className="error">

          <AlertTriangle
            size={17}
          />

          {error}

        </div>

      )}


      {busy && (

        <Card className="progress">

          <LoaderCircle
            className="spin"
          />

          <div>

            <strong>
              {stage}
            </strong>

            <p className="muted">

              Please keep this page open.

            </p>

          </div>

        </Card>

      )}


      <Button
        className="primary full"
        disabled={
          !file || busy
        }
        onClick={analyze}
      >

        {busy
          ? 'Analyzing…'
          : 'Analyze report'}

        <ArrowRight
          size={17}
        />

      </Button>


      <Card className="warning">

        <AlertTriangle />

        <div>

          <strong>
            Important
          </strong>

          <p>

            This prototype does not
            diagnose diseases or
            automatically prescribe
            medicine.

          </p>

        </div>

      </Card>

    </section>

  );

}


// ============================================================
// ANALYSIS
// ============================================================

function Analysis({
  report,
  onBack,
  onRecommendations
}) {

  const findings =
    report?.findings || [];


  const abnormal =
    findings.filter(
      finding => {

        const status =
          String(
            finding?.status || ''
          ).toLowerCase();

        return (
          status === 'below' ||
          status === 'above' ||
          status ===
            'below_reference_range' ||
          status ===
            'above_reference_range'
        );

      }
    );


  return (

    <section className="narrow">

      <button
        className="back"
        onClick={onBack}
      >

        <ArrowLeft
          size={16}
        />

        Dashboard

      </button>


      <div className="eyebrow">

        REPORT REVIEW

      </div>


      <h1>
        Your report insights
      </h1>


      <Card className="summary">

        <div className="summary-icon">

          <CheckCircle2 />

        </div>

        <div>

          <h2>

            {report?.summary ||
              'Report processed successfully.'}

          </h2>

          <p>

            {findings.length}
            {' '}
            parameter(s) extracted.

            {' '}

            {abnormal.length}
            {' '}
            appear outside the
            detected reference range.

          </p>

        </div>

      </Card>


      {findings.length > 0 ? (

        <div className="findings">

          {findings.map(
            (
              finding,
              index
            ) => (

              <Finding
                key={
                  finding.key ||
                  finding.name ||
                  finding.parameter ||
                  index
                }
                finding={
                  finding
                }
              />

            )
          )}

        </div>

      ) : (

        <Card className="empty">

          <FileText />

          <h3>
            No supported values found
          </h3>

          <p>

            Try uploading a clearer
            report.

          </p>

        </Card>

      )}


      {/* ====================================================
          STEP 4
      ==================================================== */}

      <Card className="next-step">

        <Sparkles />

        <div>

          <h3>

            Continue to health options

          </h3>

          <p>

            Review the DailyMeds
            catalogue and add eligible
            products to your vending
            cart.

          </p>

          <Button
            className="primary"
            onClick={
              onRecommendations
            }
          >

            View health options

            <ArrowRight
              size={16}
            />

          </Button>

        </div>

      </Card>


      <p className="disclaimer">

        {report?.disclaimer ||
          'Report values are informational and should be reviewed by a qualified healthcare professional.'}

      </p>

    </section>

  );

}


// ============================================================
// FINDING
// ============================================================

function Finding({
  finding
}) {

  const status =
    String(
      finding?.status || ''
    ).toLowerCase();


  let normalized =
    'unknown';


  if (
    status === 'within' ||
    status ===
      'within_reference_range'
  ) {

    normalized =
      'within';

  }


  if (
    status === 'below' ||
    status ===
      'below_reference_range'
  ) {

    normalized =
      'below';

  }


  if (
    status === 'above' ||
    status ===
      'above_reference_range'
  ) {

    normalized =
      'above';

  }


  const label =
    normalized === 'within'
      ? 'Within range'
      : normalized === 'below'
      ? 'Below range'
      : normalized === 'above'
      ? 'Above range'
      : 'Review';


  const name =
    finding?.name ||
    finding?.parameter ||
    finding?.key ||
    'Parameter';


  let reference =
    finding?.referenceRange;


  if (
    !reference &&
    finding?.referenceLow !==
      undefined &&
    finding?.referenceHigh !==
      undefined
  ) {

    reference =
      `${finding.referenceLow} – ${finding.referenceHigh} ${
        finding.referenceUnit ||
        finding.unit ||
        ''
      }`;

  }


  return (

    <Card
      className={`finding ${
        normalized === 'within'
          ? 'ok'
          : 'review'
      }`}
    >

      <div className="finding-top">

        <div>

          <h3>
            {name}
          </h3>

          <span className="value">

            {finding?.value ??
              '—'}

            {' '}

            <small>
              {finding?.unit || ''}
            </small>

          </span>

        </div>


        <span className="pill">
          {label}
        </span>

      </div>


      <div className="range">

        <span>
          Reference range
        </span>

        <strong>
          {reference ||
            'Not detected'}
        </strong>

      </div>


      {normalized !==
        'within' && (

        <p className="finding-note">

          This is a comparison with
          the range shown in the report,
          not a diagnosis or treatment
          recommendation.

        </p>

      )}

    </Card>

  );

}


// ============================================================
// STEP 4 — RECOMMENDATIONS
// ============================================================

function Recommendations({
  report,
  onBack,
  notify
}) {

  const [
    products,
    setProducts
  ] = useState([]);


  const [
    loading,
    setLoading
  ] = useState(true);


  const [
    error,
    setError
  ] = useState('');


  const [
    cart,
    setCart
  ] = useState([]);


  const [
    machine,
    setMachine
  ] = useState(null);


  const [
    machineLoading,
    setMachineLoading
  ] = useState(true);


  // ----------------------------------------------------------
  // Load products + demo machine
  // ----------------------------------------------------------

  useEffect(() => {

    async function loadData() {

      try {

        setLoading(true);

        const productData =
          await api(
            '/products'
          );

        setProducts(
          productData.products ||
          []
        );


        setMachineLoading(true);

        const machineData =
          await api(
            '/machines/DM-DEMO-001'
          );

        setMachine(
          machineData.machine
        );


      } catch (error) {

        setError(
          error.message
        );

      } finally {

        setLoading(false);
        setMachineLoading(false);

      }

    }


    loadData();

  }, []);


  // ----------------------------------------------------------
  // Findings
  // ----------------------------------------------------------

  const findings =
    report?.findings || [];


  // ----------------------------------------------------------
  // Determine abnormal parameter
  // ----------------------------------------------------------

  function isAbnormal(
    finding
  ) {

    const status =
      String(
        finding?.status || ''
      ).toLowerCase();

    return (
      status === 'below' ||
      status === 'above' ||
      status ===
        'below_reference_range' ||
      status ===
        'above_reference_range'
    );

  }


  function parameterName(
    finding
  ) {

    return String(
      finding?.name ||
      finding?.parameter ||
      finding?.key ||
      ''
    ).toLowerCase();

  }


  // ----------------------------------------------------------
  // Product relevance
  // ----------------------------------------------------------

  function isRelevant(
    product
  ) {

    if (
      !Array.isArray(
        product.supportedParameters
      )
    ) {

      return false;

    }


    if (
      product
        .supportedParameters
        .length === 0
    ) {

      return false;

    }


    return findings.some(
      finding => {

        if (
          !isAbnormal(
            finding
          )
        ) {

          return false;

        }


        const parameter =
          parameterName(
            finding
          );


        return product
          .supportedParameters
          .some(
            supported => {

              const target =
                String(
                  supported
                ).toLowerCase();


              return (
                parameter.includes(
                  target
                ) ||
                target.includes(
                  parameter
                )
              );

            }
          );

      }
    );

  }


  // ----------------------------------------------------------
  // Machine stock
  // ----------------------------------------------------------

  function machineStock(
    productId
  ) {

    if (
      !machine?.inventory
    ) {

      return 0;

    }


    const item =
      machine.inventory.find(
        inventoryItem =>
          String(
            inventoryItem.product?._id ||
            inventoryItem.product
          ) ===
          String(
            productId
          )
      );


    return (
      item?.quantity ||
      0
    );

  }


  // ----------------------------------------------------------
  // Cart quantity
  // ----------------------------------------------------------

  function cartQuantity(
    productId
  ) {

    const item =
      cart.find(
        cartItem =>
          String(
            cartItem._id
          ) ===
          String(
            productId
          )
      );


    return (
      item?.quantity ||
      0
    );

  }


  // ----------------------------------------------------------
  // Add
  // ----------------------------------------------------------

  function addToCart(
    product
  ) {

    const stock =
      machineStock(
        product._id
      );


    const current =
      cartQuantity(
        product._id
      );


    if (
      current >= stock
    ) {

      notify(
        'Not enough stock in this machine'
      );

      return;

    }


    setCart(
      currentCart => {

        const exists =
          currentCart.find(
            item =>
              String(
                item._id
              ) ===
              String(
                product._id
              )
          );


        if (exists) {

          return currentCart.map(
            item =>
              String(
                item._id
              ) ===
              String(
                product._id
              )
                ? {
                    ...item,
                    quantity:
                      item.quantity + 1
                  }
                : item
          );

        }


        return [
          ...currentCart,
          {
            ...product,
            quantity: 1
          }
        ];

      }
    );

  }


  // ----------------------------------------------------------
  // Remove
  // ----------------------------------------------------------

  function removeFromCart(
    product
  ) {

    setCart(
      currentCart => {

        const existing =
          currentCart.find(
            item =>
              String(
                item._id
              ) ===
              String(
                product._id
              )
          );


        if (!existing) {

          return currentCart;

        }


        if (
          existing.quantity ===
          1
        ) {

          return currentCart.filter(
            item =>
              String(
                item._id
              ) !==
              String(
                product._id
              )
          );

        }


        return currentCart.map(
          item =>
            String(
              item._id
            ) ===
            String(
              product._id
            )
              ? {
                  ...item,
                  quantity:
                    item.quantity - 1
                }
              : item
        );

      }
    );

  }


  // ----------------------------------------------------------
  // Suggested / General
  // ----------------------------------------------------------

  const suggested =
    useMemo(
      () =>
        products.filter(
          product =>
            isRelevant(
              product
            )
        ),
      [
        products,
        report
      ]
    );


  const general =
    useMemo(
      () =>
        products.filter(
          product =>
            !isRelevant(
              product
            )
        ),
      [
        products,
        report
      ]
    );


  // ----------------------------------------------------------
  // Cart calculations
  // ----------------------------------------------------------

  const cartCount =
    cart.reduce(
      (
        total,
        item
      ) =>
        total +
        item.quantity,
      0
    );


  const cartTotal =
    cart.reduce(
      (
        total,
        item
      ) =>
        total +
        Number(
          item.price
        ) *
        item.quantity,
      0
    );


  // ----------------------------------------------------------
  // Loading
  // ----------------------------------------------------------

  if (
    loading ||
    machineLoading
  ) {

    return (

      <section className="narrow">

        <LoaderCircle
          className="spin"
          size={32}
        />

        <h2>
          Loading health options…
        </h2>

        <p className="muted">

          Checking catalogue and
          vending machine availability.

        </p>

      </section>

    );

  }


  // ----------------------------------------------------------
  // Error
  // ----------------------------------------------------------

  if (error) {

    return (

      <section className="narrow">

        <button
          className="back"
          onClick={onBack}
        >

          <ArrowLeft
            size={16}
          />

          Report analysis

        </button>


        <Card className="error">

          <AlertTriangle />

          <div>

            <h3>
              Unable to load options
            </h3>

            <p>
              {error}
            </p>

          </div>

        </Card>

      </section>

    );

  }


  return (

    <section className="narrow">

      <button
        className="back"
        onClick={onBack}
      >

        <ArrowLeft
          size={16}
        />

        Report analysis

      </button>


      <div className="eyebrow">

        STEP 4 · HEALTH OPTIONS

      </div>


      <div className="recommendation-heading">

        <div>

          <h1>
            Health options
          </h1>

          <p className="muted">

            Review catalogue products
            available in your selected
            vending machine.

          </p>

        </div>


        <div className="cart-badge">

          <ShoppingCart
            size={20}
          />

          {cartCount}

        </div>

      </div>


      {/* MACHINE */}

      <Card className="machine-card">

        <div className="machine-icon">

          <Activity />

        </div>


        <div>

          <span className="eyebrow">
            CONNECTED MACHINE
          </span>


          <h3>
            {machine?.machineId ||
              'DM-DEMO-001'}
          </h3>


          <p className="muted">

            {machine?.location ||
              'College Demo Lab'}

          </p>

        </div>


        <span className="online-pill">

          <span className="online-dot" />

          {machine?.status ||
            'online'}

        </span>

        <div className="machine-actions">
          <Button
            className="secondary"
            onClick={() => {
              setError('');
              setShowScanner(true);
            }}
          >
            📷 Scan machine
          </Button>

          <Button
            className="secondary"
            disabled={busy}
            onClick={() => connectScannedMachine('DM-DEMO-001')}
          >
            Demo machine
          </Button>
        </div>

      </Card>
      <div style={{
  marginTop: '16px',
  display: 'flex',
  justifyContent: 'center'
}}>
  <Button
    className="primary"
    onClick={() => {
      setError('');
      setShowScanner(true);
    }}
  >
    📷 Scan Vending Machine
  </Button>
</div>


      {/* SUGGESTED */}

      <div className="section-heading">

        <Sparkles
          size={19}
        />

        <h2>
          Surfaced from your report
        </h2>

      </div>


      {suggested.length > 0 ? (

        <div className="product-grid">

          {suggested.map(
            product => (

              <ProductCard
                key={
                  product._id
                }
                product={
                  product
                }
                suggested
                stock={
                  machineStock(
                    product._id
                  )
                }
                quantity={
                  cartQuantity(
                    product._id
                  )
                }
                onAdd={() =>
                  addToCart(
                    product
                  )
                }
                onRemove={() =>
                  removeFromCart(
                    product
                  )
                }
              />

            )
          )}

        </div>

      ) : (

        <Card className="empty">

          <Info />

          <h3>
            No report-linked products
          </h3>

          <p>

            No catalogue item was
            automatically surfaced from
            the supported report parameters.

          </p>

        </Card>

      )}


      {/* GENERAL */}

      <div className="section-heading">

        <ShoppingCart
          size={19}
        />

        <h2>
          Other available products
        </h2>

      </div>


      <div className="product-grid">

        {general.map(
          product => (

            <ProductCard
              key={
                product._id
              }
              product={
                product
              }
              stock={
                machineStock(
                  product._id
                )
              }
              quantity={
                cartQuantity(
                  product._id
                )
              }
              onAdd={() =>
                addToCart(
                  product
                )
              }
              onRemove={() =>
                removeFromCart(
                  product
                )
              }
            />

          )
        )}

      </div>


      {/* CART */}

      {cart.length > 0 && (

        <Card className="cart-card">

          <div className="cart-header">

            <div>

              <h2>
                Your vending cart
              </h2>

              <p className="muted">

                {cartCount}
                {' '}
                item(s)

              </p>

            </div>


            <strong className="cart-total">

              ₹{cartTotal}

            </strong>

          </div>


          {cart.map(
            item => (

              <div
                className="cart-row"
                key={
                  item._id
                }
              >

                <div>

                  <strong>
                    {item.name}
                  </strong>

                  <small>

                    ₹{item.price}
                    {' × '}
                    {item.quantity}

                  </small>

                </div>


                <div className="quantity">

                  <button
                    onClick={() =>
                      removeFromCart(
                        item
                      )
                    }
                  >

                    <Minus
                      size={14}
                    />

                  </button>


                  <span>
                    {item.quantity}
                  </span>


                  <button
                    onClick={() =>
                      addToCart(
                        item
                      )
                    }
                  >

                    <Plus
                      size={14}
                    />

                  </button>

                </div>

              </div>

            )
          )}


          <Button
            className="primary full"
            onClick={() =>
              window.dispatchEvent(
                new CustomEvent(
                  'open-machine-checkout',
                  {
                    detail: {
                      cart
                    }
                  }
                )
              )
            }
          >

            Continue to vending machine

            <ArrowRight
              size={17}
            />

          </Button>


          <p className="muted checkout-note">

            Your cart will be verified
            against machine inventory before
            an order is created.

          </p>

        </Card>

      )}


      {/* Instead of relying on a global event, the button
          below is the actual Step 4 → checkout action. */}

      {cart.length > 0 && (

        <div className="checkout-action">

          <Button
            className="primary full"
            onClick={() => {

              // Store cart temporarily for checkout
              sessionStorage.setItem(
                'dm_cart',
                JSON.stringify(
                  cart
                )
              );

              sessionStorage.setItem(
                'dm_machine',
                machine?.machineId ||
                  'DM-DEMO-001'
              );

              window.location.hash =
                '#machine';

              window.location.reload();

            }}
          >

            <PackageCheck
              size={18}
            />

            Open vending checkout

            <ArrowRight
              size={17}
            />

          </Button>

        </div>

      )}


      <Card className="warning">

        <ShieldCheck />

        <div>

          <strong>
            Safety notice
          </strong>

          <p>

            DailyMeds does not automatically
            prescribe medicines or calculate
            personalized doses from laboratory
            results. The catalogue is a
            prototype and real deployment
            requires appropriate clinical,
            regulatory and pharmacy controls.

          </p>

        </div>

      </Card>

    </section>

  );

}


// ============================================================
// PRODUCT CARD
// ============================================================

function ProductCard({
  product,
  suggested = false,
  stock = 0,
  quantity = 0,
  onAdd,
  onRemove
}) {

  const outOfStock =
    stock <= 0;


  return (

    <Card className="product-card">


      {suggested && (

        <span className="suggested-badge">

          <Sparkles
            size={13}
          />

          Surfaced from report

        </span>

      )}


      <div className="product-icon">

        <Activity />

      </div>


      <h3>
        {product.name}
      </h3>


      <span className="product-category">

        {product.category}

      </span>


      <p>

        {product.description ||
          'DailyMeds catalogue product.'}

      </p>


      {suggested && (

        <div className="why-box">

          <Info
            size={15}
          />

          <span>

            This product matches a
            supported parameter from the
            report for review.

          </span>

        </div>

      )}


      <div className="stock-line">

        {outOfStock
          ? 'Out of stock'
          : `${stock} available in machine`}

      </div>


      <div className="product-bottom">

        <div>

          <strong>
            ₹{product.price}
          </strong>

          <small>

            / {product.unitLabel ||
              product.unit ||
              'unit'}

          </small>

        </div>


        {quantity === 0 ? (

          <Button
            className="secondary"
            disabled={outOfStock}
            onClick={onAdd}
          >

            Add

            <Plus
              size={16}
            />

          </Button>

        ) : (

          <div className="product-quantity">

            <button
              onClick={onRemove}
            >

              <Minus
                size={14}
              />

            </button>


            <strong>
              {quantity}
            </strong>


            <button
              disabled={
                quantity >= stock
              }
              onClick={onAdd}
            >

              <Plus
                size={14}
              />

            </button>

          </div>

        )}

      </div>


      {product.safetyNote && (

        <small className="safety-note">

          {product.safetyNote}

        </small>

      )}

    </Card>

  );

}


// ============================================================
// MACHINE CHECKOUT
// ============================================================

function MachineCheckout({
  report,
  onBack,
  notify
}) {

  const [
    cart,
    setCart
  ] = useState([]);


  const [
    machineId,
    setMachineId
  ] = useState(
    'DM-DEMO-001'
  );


  const [
    machine,
    setMachine
  ] = useState(null);


  const [
    order,
    setOrder
  ] = useState(null);


  const [
    busy,
    setBusy
  ] = useState(false);


  const [
    error,
    setError
  ] = useState('');


  const [
    step,
    setStep
  ] = useState(
    'review'
  );


  const [showScanner, setShowScanner] = useState(false);

  async function connectScannedMachine(scannedId) {
    const id = String(scannedId || '').trim();

    if (!id) {
      setError('Invalid machine QR code.');
      return;
    }

    setBusy(true);
    setError('');

    try {
      const data = await api(`/machines/${encodeURIComponent(id)}`);
      setMachineId(id);
      setMachine(data.machine);
      sessionStorage.setItem('dm_machine', id);
      setShowScanner(false);
      notify(`Connected to ${id}`);
    } catch (error) {
      setError(error.message);
    } finally {
      setBusy(false);
    }
  }


  // ----------------------------------------------------------
  // Load cart
  // ----------------------------------------------------------

  useEffect(() => {

    try {

      const savedCart =
        JSON.parse(
          sessionStorage.getItem(
            'dm_cart'
          ) || '[]'
        );


      const savedMachine =
        sessionStorage.getItem(
          'dm_machine'
        );


      setCart(
        savedCart
      );


      if (savedMachine) {

        setMachineId(
          savedMachine
        );

      }

    } catch {

      setCart([]);

    }

  }, []);


  // ----------------------------------------------------------
  // Load machine
  // ----------------------------------------------------------

  useEffect(() => {

    if (!machineId) {
      return;
    }


    api(
      `/machines/${machineId}`
    )

      .then(
        data =>
          setMachine(
            data.machine
          )
      )

      .catch(
        error =>
          setError(
            error.message
          )
      );

  }, [machineId]);


  const total =
    cart.reduce(
      (
        sum,
        item
      ) =>
        sum +
        Number(
          item.price
        ) *
        item.quantity,
      0
    );


  const itemCount =
    cart.reduce(
      (
        sum,
        item
      ) =>
        sum +
        item.quantity,
      0
    );


  // ----------------------------------------------------------
  // Create order
  // ----------------------------------------------------------

  async function createOrder() {

    if (
      !cart.length
    ) {

      setError(
        'Your cart is empty.'
      );

      return;

    }


    setBusy(true);
    setError('');


    try {

      setStep(
        'creating'
      );


      const idempotencyKey =
        `dm-${Date.now()}-${Math.random()
          .toString(36)
          .slice(2)}`;


      const data =
        await api(
          '/orders',
          {
            method: 'POST',
            body:
              JSON.stringify({

                machineId,

                items:
                  cart.map(
                    item => ({
                      productId:
                        item._id,

                      quantity:
                        item.quantity
                    })
                  ),

                idempotencyKey

              })
          }
        );


      setOrder(
        data.order
      );


      setStep(
        'payment'
      );


    } catch (error) {

      setError(
        error.message
      );

      setStep(
        'review'
      );

    } finally {

      setBusy(false);

    }

  }


  // ----------------------------------------------------------
  // Demo payment
  // ----------------------------------------------------------

  async function payDemo() {

    if (!order) {
      return;
    }


    setBusy(true);
    setError('');


    try {

      setStep(
        'paying'
      );


      const data =
        await api(
          `/orders/${order._id}/pay-demo`,
          {
            method: 'POST'
          }
        );


      setOrder(
        data.order
      );


      setStep(
        'paid'
      );


      notify(
        'Demo payment successful'
      );


    } catch (error) {

      setError(
        error.message
      );

      setStep(
        'payment'
      );

    } finally {

      setBusy(false);

    }

  }


  // ----------------------------------------------------------
  // Demo dispense
  // ----------------------------------------------------------

  async function dispense() {

    if (!order) {
      return;
    }


    setBusy(true);
    setError('');


    try {

      setStep(
        'dispensing'
      );


      const data =
        await api(
          `/orders/${order._id}/dispense-demo`,
          {
            method: 'POST'
          }
        );


      setOrder(
        data.order
      );


      notify(
        'Vending machine started'
      );


      // Poll order status

      const interval =
        setInterval(
          async () => {

            try {

              const latest =
                await api(
                  `/orders/${order._id}/status`
                );


              if (
                latest.order
                  ?.dispenseStatus ===
                'dispensed'
              ) {

                clearInterval(
                  interval
                );

                setOrder(
                  latest.order
                );

                setStep(
                  'complete'
                );

                setBusy(false);

                sessionStorage.removeItem(
                  'dm_cart'
                );

              }

            } catch {

              // Demo endpoint may not
              // exist in older backend.
              // We therefore finish after
              // the demo delay.

            }

          },

          1000

        );


      // Demo backend changes status
      // after approximately 1.5 seconds.

      setTimeout(
        () => {

          clearInterval(
            interval
          );

          setStep(
            'complete'
          );

          setBusy(false);

          sessionStorage.removeItem(
            'dm_cart'
          );

        },
        2200
      );


    } catch (error) {

      setError(
        error.message
      );

      setStep(
        'paid'
      );

      setBusy(false);

    }

  }


  // ==========================================================
  // EMPTY CART
  // ==========================================================

  if (!cart.length) {

    return (

      <section className="narrow">

        <button
          className="back"
          onClick={onBack}
        >

          <ArrowLeft
            size={16}
          />

          Health options

        </button>


        <Card className="empty">

          <ShoppingCart />

          <h2>
            Your cart is empty
          </h2>

          <p>

            Add a product before
            opening vending checkout.

          </p>

          <Button
            className="primary"
            onClick={onBack}
          >

            Browse products

          </Button>

        </Card>

      </section>

    );

  }


  // ==========================================================
  // COMPLETE
  // ==========================================================

  if (
    step === 'complete'
  ) {

    return (

      <section className="narrow">

        <Card className="success-card">

          <div className="success-icon">

            <CheckCircle2 />

          </div>


          <h1>
            Dispensing complete
          </h1>


          <p>

            Your DailyMeds demo order
            has been marked as dispensed.

          </p>


          <div className="order-number">

            Order

            <strong>
              {order?._id}
            </strong>

          </div>


          <Button
            className="primary full"
            onClick={() => {

              sessionStorage.removeItem(
                'dm_cart'
              );

              setCart([]);

              onBack();

            }}
          >

            Back to health options

          </Button>

        </Card>

      </section>

    );

  }


  return (

    <section className="narrow">

      <button
        className="back"
        onClick={onBack}
      >

        <ArrowLeft
          size={16}
        />

        Health options

      </button>


      <div className="eyebrow">

        STEP 4 · VENDING CHECKOUT

      </div>


      <h1>
        Connect to vending machine
      </h1>


      {/* MACHINE */}

      <Card className="machine-checkout">

        <div className="machine-visual">

          <ShoppingCart
            size={32}
          />

        </div>


        <div>

          <span className="eyebrow">
            MACHINE
          </span>


          <h2>
            {machineId}
          </h2>


          <p className="muted">

            {machine?.location ||
              'College Demo Lab'}

          </p>

        </div>


        <span className="online-pill">

          <span className="online-dot" />

          {machine?.status ||
            'online'}

        </span>

        <div className="machine-actions">

          <Button
            className="secondary"
            disabled={busy}
            onClick={() => {
              setError('');
              setShowScanner(true);
            }}
          >
            📷 Scan machine
          </Button>

          <Button
            className="secondary"
            disabled={busy}
            onClick={() => connectScannedMachine('DM-DEMO-001')}
          >
            Demo machine
          </Button>

        </div>

      </Card>


      {/* CART */}

      <Card>

        <div className="cart-header">

          <div>

            <h2>
              Order summary
            </h2>

            <p className="muted">

              {itemCount}
              {' '}
              item(s)

            </p>

          </div>


          <strong className="cart-total">

            ₹{total}

          </strong>

        </div>


        {cart.map(
          item => (

            <div
              className="cart-row"
              key={
                item._id
              }
            >

              <div>

                <strong>
                  {item.name}
                </strong>

                <small>

                  ₹{item.price}
                  {' × '}
                  {item.quantity}

                </small>

              </div>


              <strong>

                ₹
                {Number(
                  item.price
                ) *
                  item.quantity}

              </strong>

            </div>

          )
        )}

      </Card>


      {/* ERROR */}

      {error && (

        <div className="error">

          <AlertTriangle
            size={17}
          />

          {error}

        </div>

      )}


      {/* REVIEW */}

      {step === 'review' && (

        <>

          <Card className="checkout-info">

            <Info />

            <div>

              <strong>
                Machine verified
              </strong>

              <p>

                The backend will check
                the selected products against
                the machine inventory before
                creating the order.

              </p>

            </div>

          </Card>


          <Button
            className="primary full"
            disabled={busy}
            onClick={
              createOrder
            }
          >

            {busy
              ? 'Checking machine…'
              : 'Create vending order'}

            <ArrowRight
              size={17}
            />

          </Button>

        </>

      )}


      {/* CREATING */}

      {step === 'creating' && (

        <Card className="progress">

          <LoaderCircle
            className="spin"
          />

          <div>

            <strong>
              Creating your order…
            </strong>

            <p className="muted">

              Checking machine inventory.

            </p>

          </div>

        </Card>

      )}


      {/* PAYMENT */}

      {(step === 'payment' ||
        step === 'paying') && (

        <Card className="payment-card">

          <div className="payment-icon">

            ₹

          </div>


          <h2>
            Payment
          </h2>


          <p className="muted">

            Amount payable

          </p>


          <div className="payment-total">

            ₹{order?.total ||
              total}

          </div>


          <Button
            className="primary full"
            disabled={busy}
            onClick={
              payDemo
            }
          >

            {busy
              ? 'Processing…'
              : 'Pay ₹' +
                (order?.total ||
                  total) +
                ' (Demo)'}

          </Button>


          <small className="muted">

            This is a demo payment.
            No real money is charged.

          </small>

        </Card>

      )}


      {/* PAID */}

      {step === 'paid' && (

        <Card className="checkout-info">

          <CheckCircle2 />

          <div>

            <strong>
              Payment successful
            </strong>

            <p>

              Your order is ready
              for dispensing.

            </p>

          </div>


          <Button
            className="primary"
            disabled={busy}
            onClick={
              dispense
            }
          >

            Start dispensing

            <PackageCheck
              size={17}
            />

          </Button>

        </Card>

      )}


      {/* DISPENSING */}

      {step === 'dispensing' && (

        <Card className="dispensing">

          <LoaderCircle
            className="spin"
            size={38}
          />


          <h2>

            Dispensing your order…

          </h2>


          <p className="muted">

            Please wait while the
            vending machine prepares
            your products.

          </p>


          <div className="dispense-bar">

            <div />

          </div>

        </Card>

      )}


      {/* SAFETY */}

      <Card className="warning">

        <ShieldCheck />

        <div>

          <strong>
            Prototype safety notice
          </strong>

          <p>

            This checkout currently uses
            demo payment and demo dispensing.
            No physical medicine is dispensed
            by this software alone.

          </p>

        </div>

      </Card>


      {showScanner && (
        <MachineScanner
          onMachineFound={connectScannedMachine}
          onClose={() => setShowScanner(false)}
        />
      )}

    </section>

  );

}


// ============================================================
// APP START
// ============================================================

createRoot(
  document.getElementById(
    'root'
  )
).render(
  <App />
);
