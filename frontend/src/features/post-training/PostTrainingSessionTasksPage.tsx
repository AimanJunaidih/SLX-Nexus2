import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  IconArrowLeft,
  IconPlus,
  IconX,
  IconCheckbox,
  IconClipboardList,
  IconDeviceFloppy,
  IconBuilding,
} from '@tabler/icons-react';
import { getTrainingSessions } from '@/data-access/training-sessions';
import { getSessionCompanyTasks, syncSessionCompanyTasks } from '@/data-access/post-training-tasks';
import type { PostTrainingTask } from '@/data-access/post-training-tasks';
import type { TrainingSession } from '@/entities/training-session';

export default function PostTrainingSessionTasksPage() {
  const navigate = useNavigate();
  const { sessionId, companyId } = useParams<{ sessionId: string; companyId: string }>();
  const [session, setSession] = useState<TrainingSession | null>(null);
  const [companyName, setCompanyName] = useState('');
  const [items, setItems] = useState<PostTrainingTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [newText, setNewText] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!sessionId || !companyId) return;
    Promise.all([getTrainingSessions(), getSessionCompanyTasks(sessionId, companyId)]).then(([sessions, tasks]) => {
      const s = sessions.find((sess) => sess.id === sessionId) ?? null;
      setSession(s);
      const comp = s?.companies.find((c) => c.id === companyId);
      setCompanyName(comp?.name ?? companyId);
      setItems(tasks.sort((a, b) => a.sortOrder - b.sortOrder));
      setLoading(false);
    });
  }, [sessionId, companyId]);

  const addItem = () => {
    const text = newText.trim();
    if (!text) return;
    setItems((prev) => [
      ...prev,
      { id: `ptt_new_${Date.now()}`, sessionId: sessionId!, companyId: companyId!, text, done: false, sortOrder: prev.length },
    ]);
    setNewText('');
    setSaved(false);
    inputRef.current?.focus();
  };

  const toggleItem = (id: string) => {
    setItems((prev) => prev.map((item) => item.id === id ? { ...item, done: !item.done } : item));
    setSaved(false);
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
    setSaved(false);
  };

  const handleSave = async () => {
    if (!sessionId || !companyId) return;
    setSaving(true);
    try {
      const synced = await syncSessionCompanyTasks(sessionId, companyId, items);
      setItems(synced.sort((a, b) => a.sortOrder - b.sortOrder));
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      console.error('Failed to save tasks');
    } finally {
      setSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') addItem();
  };

  if (loading) return <div>Loading...</div>;

  const doneCount = items.filter((i) => i.done).length;
  const totalCount = items.length;

  return (
    <>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <button
              onClick={() => navigate('/post-training')}
              style={{
                background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280',
                padding: 4, display: 'flex', borderRadius: 4,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#111827')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#6b7280')}
            >
              <IconArrowLeft size={20} />
            </button>
            <h1 className="page-title" style={{ marginBottom: 0 }}>
              Post-Training Tasks
            </h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: '#6b7280' }}>
              <IconBuilding size={14} />
              {companyName}
            </span>
            {session && (
              <span style={{ fontSize: 13, color: '#9ca3af' }}>
                {session.name} — {session.date}
              </span>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {totalCount > 0 && (
            <div style={{
              padding: '8px 14px', background: doneCount === totalCount && totalCount > 0 ? '#dcfce7' : '#f3f4f6',
              borderRadius: 8, fontSize: 13, fontWeight: 600,
              color: doneCount === totalCount && totalCount > 0 ? '#166534' : '#374151',
            }}>
              {doneCount}/{totalCount} done
            </div>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '10px 18px', background: saved ? '#059669' : '#4f46e5',
              color: 'white', border: 'none', borderRadius: 8, cursor: saving ? 'not-allowed' : 'pointer',
              fontWeight: 600, fontSize: 13, transition: 'background 0.2s',
            }}
          >
            <IconDeviceFloppy size={16} />
            {saving ? 'Saving...' : saved ? 'Saved!' : 'Save'}
          </button>
        </div>
      </div>

      {/* Add new item */}
      <div style={{
        background: 'white', borderRadius: 8, border: '1px solid #e5e7eb',
        padding: '16px 20px', marginBottom: 16,
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            ref={inputRef}
            type="text"
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Add a new task..."
            style={{
              flex: 1, padding: '10px 14px', border: '1px solid #d1d5db', borderRadius: 6,
              fontSize: 14, outline: 'none', color: '#374151',
            }}
          />
          <button
            onClick={addItem}
            disabled={!newText.trim()}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '10px 18px', background: newText.trim() ? '#4f46e5' : '#9ca3af',
              color: 'white', border: 'none', borderRadius: 6, cursor: newText.trim() ? 'pointer' : 'not-allowed',
              fontWeight: 600, fontSize: 13,
            }}
          >
            <IconPlus size={16} />
            Add
          </button>
        </div>
      </div>

      {/* Checklist */}
      <div style={{
        background: 'white', borderRadius: 8, border: '1px solid #e5e7eb',
        overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      }}>
        {items.length === 0 && (
          <div style={{ padding: 48, textAlign: 'center', color: '#9ca3af' }}>
            <IconClipboardList size={40} stroke={1.2} style={{ margin: '0 auto 12px' }} />
            <div style={{ fontSize: 14 }}>No tasks yet</div>
            <div style={{ fontSize: 12, marginTop: 4 }}>Add a task above to get started.</div>
          </div>
        )}

        {items.map((item, idx) => (
          <div
            key={item.id}
            style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '12px 16px',
              borderBottom: idx < items.length - 1 ? '1px solid #f3f4f6' : 'none',
              background: item.done ? '#f9fafb' : 'white',
              transition: 'background 0.15s',
            }}
          >
            <button
              onClick={() => toggleItem(item.id)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex',
                color: item.done ? '#059669' : '#d1d5db',
                transition: 'color 0.15s',
              }}
            >
              <IconCheckbox size={22} stroke={2} />
            </button>
            <span style={{
              flex: 1, fontSize: 14, color: '#111827',
              textDecoration: item.done ? 'line-through' : 'none',
              opacity: item.done ? 0.5 : 1,
              transition: 'opacity 0.15s',
            }}>
              {item.text}
            </span>
            <button
              onClick={() => removeItem(item.id)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer', color: '#d1d5db', padding: 4,
                display: 'flex', borderRadius: 4, transition: 'color 0.15s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#dc2626')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#d1d5db')}
            >
              <IconX size={16} />
            </button>
          </div>
        ))}
      </div>
    </>
  );
}
