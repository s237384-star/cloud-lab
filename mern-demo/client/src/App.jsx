import { useCallback, useEffect, useMemo, useState } from 'react';
import './App.css';

const API_URL = (import.meta.env.VITE_API_URL || 'https://mernbackend-237384.onrender.com').replace(/\/$/, '');
const endpoint = `${API_URL}/api/students`;

const Icons = {
  grid: '▦', users: '♙', server: '◈', refresh: '↻', search: '⌕', plus: '+', edit: '✎', trash: '✕', close: '×', check: '✓'
};

async function apiRequest(url, options) {
  const response = await fetch(url, options);
  const text = await response.text();
  let data;
  try { data = text ? JSON.parse(text) : null; } catch { throw new Error('Máy chủ trả về dữ liệu không hợp lệ'); }
  if (!response.ok) throw new Error(data?.message || data?.error || `Lỗi HTTP ${response.status}`);
  return data;
}

export default function App() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ studentId: '', name: '', email: '' });

  const loadStudents = useCallback(async (signal) => {
    setLoading(true);
    setError('');
    try {
      const data = await apiRequest(endpoint, signal ? { signal } : undefined);
      if (!Array.isArray(data)) throw new Error('API không trả về mảng sinh viên');
      setStudents(data);
    } catch (err) {
      if (err.name !== 'AbortError') setError(`Không thể tải dữ liệu: ${err.message}`);
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    loadStudents(controller.signal);
    return () => controller.abort();
  }, [loadStudents]);

  const filtered = useMemo(() => students.filter(s =>
    `${s.studentId || ''} ${s.name || ''} ${s.email || ''}`.toLocaleLowerCase('vi').includes(search.toLocaleLowerCase('vi'))
  ), [students, search]);

  const openAdd = () => { setForm({ studentId: '', name: '', email: '' }); setModal({ type: 'add' }); };
  const openEdit = (student) => {
    setForm({ studentId: student.studentId || '', name: student.name || '', email: student.email || '' });
    setModal({ type: 'edit', student });
  };

  const save = async (e) => {
    e.preventDefault();
    if (!form.studentId.trim() || !form.name.trim() || !form.email.trim()) return;
    setBusy(true); setError('');
    try {
      const editing = modal.type === 'edit';
      await apiRequest(editing ? `${endpoint}/${modal.student._id}` : endpoint, {
        method: editing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId: form.studentId.trim(), name: form.name.trim(), email: form.email.trim() })
      });
      setModal(null);
      await loadStudents();
    } catch (err) { setError(`Không thể lưu sinh viên: ${err.message}`); }
    finally { setBusy(false); }
  };

  const remove = async (student) => {
    if (!window.confirm(`Bạn chắc chắn muốn xóa ${student.name}?`)) return;
    setBusy(true); setError('');
    try { await apiRequest(`${endpoint}/${student._id}`, { method: 'DELETE' }); await loadStudents(); }
    catch (err) { setError(`Không thể xóa sinh viên: ${err.message}`); }
    finally { setBusy(false); }
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand"><span className="brand-icon">S</span><div><strong>StudentHub</strong><small>Cloud Lab • Docker 2.0</small></div></div>
        <div className="nav-caption">KHÔNG GIAN LÀM VIỆC</div>
        <div className="nav-item active"><span>{Icons.users}</span> Quản lý sinh viên</div>
        <div className="sidebar-bottom"><span className="status-dot"/> Backend Render <small>MongoDB Atlas</small></div>
      </aside>
      <main className="main">
        <header className="topbar"><div className="breadcrumb">Cloud Lab <span>/</span> <b>Quản lý sinh viên</b></div><div className="top-right"><span className="env-tag">Docker v2.0</span><span className="avatar">SV</span></div></header>
        <div className="content">
          <div className="heading"><div><div className="eyebrow">TỔNG QUAN HỆ THỐNG</div><h1>Quản lý sinh viên</h1><p>Theo dõi và cập nhật thông tin sinh viên từ MongoDB Atlas.</p></div><button className="primary-btn" onClick={openAdd}><span>{Icons.plus}</span> Thêm sinh viên</button></div>
          <div className="stats">
            <div className="stat-card"><span className="stat-icon violet">{Icons.users}</span><div><span className="stat-label">Tổng sinh viên</span><strong>{students.length}</strong><small>Dữ liệu từ API</small></div></div>
            <div className="stat-card"><span className="stat-icon blue">{Icons.grid}</span><div><span className="stat-label">Kết quả tìm kiếm</span><strong>{filtered.length}</strong><small>Sinh viên phù hợp</small></div></div>
            <div className="stat-card"><span className="stat-icon green">{Icons.server}</span><div><span className="stat-label">Trạng thái API</span><strong className="status-text">{loading ? 'Đang tải' : error ? 'Cần kiểm tra' : 'Đã kết nối'}</strong><small>Render Backend</small></div></div>
          </div>
          <section className="panel">
            <div className="panel-heading"><div><h2>Danh sách sinh viên</h2><p>Thông tin được đồng bộ từ Backend.</p></div><div className="toolbar"><div className="search-box"><span>{Icons.search}</span><input aria-label="Tìm kiếm sinh viên" placeholder="Tìm MSSV, họ tên, email..." value={search} onChange={e => setSearch(e.target.value)}/></div><button className="secondary-btn" onClick={() => loadStudents()} disabled={loading || busy}><span>{Icons.refresh}</span> Làm mới</button></div></div>
            {error && <div className="error-box" role="alert">{error} <button onClick={() => loadStudents()}>Thử lại</button></div>}
            <div className="table-scroll"><table><thead><tr><th>MÃ SINH VIÊN</th><th>HỌ VÀ TÊN</th><th>EMAIL</th><th>THAO TÁC</th></tr></thead><tbody>
              {filtered.map((s, index) => <tr key={s._id || `${s.studentId}-${index}`}><td><span className="id-chip">{s.studentId}</span></td><td><div className="student-name"><span className="mini-avatar">{(s.name || 'S').trim().charAt(0).toUpperCase()}</span><strong>{s.name}</strong></div></td><td className="email">{s.email}</td><td><div className="actions"><button aria-label={`Sửa ${s.name}`} title="Sửa" onClick={() => openEdit(s)}>{Icons.edit}</button><button className="danger" aria-label={`Xóa ${s.name}`} title="Xóa" onClick={() => remove(s)} disabled={busy}>{Icons.trash}</button></div></td></tr>)}
              {!loading && filtered.length === 0 && <tr><td colSpan="4" className="empty">{search ? 'Không tìm thấy sinh viên phù hợp.' : 'Chưa có dữ liệu sinh viên. Hãy kiểm tra API hoặc thêm sinh viên mới.'}</td></tr>}
              {loading && <tr><td colSpan="4" className="empty">Đang tải dữ liệu từ Backend Render...</td></tr>}
            </tbody></table></div>
            <div className="panel-footer">Hiển thị <strong>{filtered.length}</strong> / {students.length} sinh viên <span>StudentHub • Cloud Lab</span></div>
          </section>
          <footer className="page-footer">Frontend React + Vite <span>•</span> Backend Node.js + Express <span>•</span> MongoDB Atlas</footer>
        </div>
      </main>
      {modal && <div className="modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget && !busy) setModal(null); }}><div className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title"><div className="modal-head"><div><h2 id="modal-title">{modal.type === 'add' ? 'Thêm sinh viên mới' : 'Chỉnh sửa sinh viên'}</h2><p>Điền đầy đủ thông tin bên dưới.</p></div><button className="close-btn" aria-label="Đóng" onClick={() => setModal(null)} disabled={busy}>×</button></div><form onSubmit={save}><label>Mã sinh viên<input required maxLength={40} value={form.studentId} onChange={e => setForm({...form, studentId: e.target.value})} placeholder="VD: SV001"/></label><label>Họ và tên<input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Nhập họ tên"/></label><label>Email<input required type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="email@example.com"/></label><div className="modal-actions"><button type="button" className="secondary-btn" onClick={() => setModal(null)} disabled={busy}>Hủy</button><button className="primary-btn" type="submit" disabled={busy}>{busy ? 'Đang lưu...' : modal.type === 'add' ? 'Thêm sinh viên' : 'Lưu thay đổi'}</button></div></form></div></div>}
    </div>
  );
}
