import { useState, useEffect, useMemo } from 'react';
import { api } from '../services/api';

function Modal({ title, onClose, children }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h2 style={{ fontSize: '1.35rem', fontWeight: '700' }}>{title}</h2>
          <button className="btn btn-ghost" onClick={onClose} style={{ padding: '.3rem .7rem', fontSize: '1.2rem' }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

export default function Mappings() {
  const [mappings,   setMappings]  = useState([]);
  const [patients,   setPatients]  = useState([]);
  const [doctors,    setDoctors]   = useState([]);
  const [loading,    setLoading]   = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadError,  setLoadError] = useState('');
  const [showModal,  setShow]      = useState(false);
  const [form,       setForm]      = useState({ patient: '', doctor: '', notes: '' });
  const [saving,     setSaving]    = useState(false);
  const [error,      setError]     = useState('');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [specializationFilter, setSpecializationFilter] = useState('all');
  const [patientFilter, setPatientFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  const loadLookups = async () => {
    try {
      const [p, d] = await Promise.all([
        api.get('/patients/', { ordering: 'name' }, { useCache: true, ttlMs: 180000 }),
        api.get('/doctors/', { ordering: 'name' }, { useCache: true, ttlMs: 180000 }),
      ]);
      setPatients(Array.isArray(p.data) ? p.data : (p.data.results ?? []));
      setDoctors(Array.isArray(d.data) ? d.data : (d.data.results ?? []));
    } catch {
      setLoadError('Unable to load assignments data. Please refresh after backend is available.');
    }
  };

  const loadMappings = async () => {
    const initialLoad = mappings.length === 0;
    if (initialLoad) setLoading(true);
    else setRefreshing(true);
    setLoadError('');
    try {
      const orderingMap = {
        newest: '-assigned_at',
        oldest: 'assigned_at',
        id_asc: 'id',
      };

      const [m] = await Promise.all([
        api.get('/mappings/', {
          search: debouncedSearch,
          patient: patientFilter === 'all' ? '' : patientFilter,
          doctor__specialization: specializationFilter === 'all' ? '' : specializationFilter,
          ordering: orderingMap[sortBy],
        }, { useCache: true, ttlMs: 120000 }),
      ]);
      setMappings(Array.isArray(m.data) ? m.data : (m.data.results ?? []));
    } catch {
      setLoadError('Unable to load assignments data. Please refresh after backend is available.');
    }
    if (initialLoad) setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 250);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    loadLookups();
  }, []);

  useEffect(() => {
    loadMappings();
  }, [debouncedSearch, specializationFilter, patientFilter, sortBy]);

  const openModal = () => { setForm({ patient: '', doctor: '', notes: '' }); setError(''); setShow(true); };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.patient || !form.doctor) return setError('Please select both a patient and a doctor.');
    setSaving(true); setError('');
    try {
      await api.post('/mappings/', {
        patient: Number(form.patient),
        doctor:  Number(form.doctor),
        notes:   form.notes,
      });
      setShow(false); loadMappings();
    } catch (err) {
      const raw = err.response?.data;
      setError(
        raw?.non_field_errors?.[0] ||
        (typeof raw === 'object' ? Object.values(raw).flat().join(' ') : 'Failed to assign.')
      );
    }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this assignment?')) return;
    try { await api.delete(`/mappings/${id}/`); loadMappings(); }
    catch { alert('Delete failed.'); }
  };

  const specializationValues = useMemo(() => {
    return Array.from(new Set(mappings.map((m) => m.doctor_specialization).filter(Boolean))).sort();
  }, [mappings]);

  const visibleMappings = useMemo(() => mappings, [mappings]);

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Assignments</h1>
          <p className="page-subtitle">Patient ↔ Doctor relationships managed here.</p>
          <div className="flex gap-2 mt-2">
            <span className="summary-chip">Mappings: {mappings.length}</span>
            <span className="summary-chip">Patients: {patients.length}</span>
            <span className="summary-chip">Doctors: {doctors.length}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-secondary" onClick={loadMappings}>Refresh</button>
          <button className="btn btn-primary" onClick={openModal}>+ Assign Doctor</button>
        </div>
      </div>

      {loadError && <div className="alert alert-error">{loadError}</div>}

      <div className="card filter-toolbar">
        <input
          className="form-control"
          placeholder="Search by patient name, doctor name, or mapping ID"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select className="form-control" value={specializationFilter} onChange={(e) => setSpecializationFilter(e.target.value)}>
          <option value="all">All specializations</option>
          {specializationValues.map((spec) => <option key={spec} value={spec}>{spec}</option>)}
        </select>
        <select className="form-control" value={patientFilter} onChange={(e) => setPatientFilter(e.target.value)}>
          <option value="all">All patients</option>
          {patients.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <select className="form-control" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="newest">Sort: Newest</option>
          <option value="oldest">Sort: Oldest</option>
          <option value="id_asc">Sort: ID Asc</option>
        </select>
      </div>

      {refreshing && <div className="text-sm text-muted" style={{ margin: '.2rem 0 .8rem' }}>Refreshing assignments...</div>}

      <div className="card" style={{ padding: 0 }}>
        {loading ? (
          <div className="loading-center"><div className="spinner" /></div>
        ) : visibleMappings.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon" style={{ fontSize: '3rem' }}>🔗</div>
            <h3>No matching assignments found</h3>
            <p className="text-sm text-muted">Change search/filter values to view more records.</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Assigned Doctor</th>
                  <th>Specialisation</th>
                  <th>Date Assigned</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {visibleMappings.map((m) => (
                  <tr key={m.id}>
                    <td className="fw-700">{m.patient_name}</td>
                    <td>
                      <div className="fw-700">Dr. {m.doctor_name}</div>
                    </td>
                    <td><span className="badge badge-cyan">{m.doctor_specialization}</span></td>
                    <td className="text-sm">
                      {new Date(m.assigned_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="text-right">
                      <button className="btn btn-danger" style={{ padding: '.35rem .7rem', fontSize: '.8rem' }} onClick={() => handleDelete(m.id)}>
                        🗑️ Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <Modal title="Assign Doctor to Patient" onClose={() => setShow(false)}>
          {error && <div className="alert alert-error">{error}</div>}
          <form onSubmit={handleSave}>
            <div className="form-group">
              <label className="form-label">Select Patient *</label>
              <select className="form-control" required value={form.patient} onChange={(e) => setForm((f) => ({ ...f, patient: e.target.value }))}>
                <option value="">— Choose a patient —</option>
                {patients.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Select Doctor *</label>
              <select className="form-control" required value={form.doctor} onChange={(e) => setForm((f) => ({ ...f, doctor: e.target.value }))}>
                <option value="">— Choose a doctor —</option>
                {doctors.map((d) => (
                  <option key={d.id} value={d.id}>
                    Dr. {d.name} — {d.specialization_display}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Notes (optional)</label>
              <textarea className="form-control" rows={3} placeholder="Referral reason, follow-up schedule…" value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} />
            </div>

            <div className="flex justify-end gap-3 mt-4">
              <button type="button" className="btn btn-secondary" onClick={() => setShow(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Saving…' : 'Assign Doctor'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
