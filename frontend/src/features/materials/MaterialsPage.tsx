import { useState, useEffect, useRef } from 'react';
import {
  IconFiles,
  IconCircleCheck,
  IconEdit,
  IconPlus,
  IconX,
  IconTrash,
  IconEye,
  IconUpload,
  IconChecks,
} from '@tabler/icons-react';
import StatCard from '@/shared/ui/StatCard';
import Panel from '@/shared/ui/Panel';
import Pill from '@/shared/ui/Pill';
import { getMaterials, createMaterial, deleteMaterial, bulkDeleteMaterials } from '@/data-access/materials';
import type { Material, MaterialType, MaterialStatus } from '@/entities/material';
import { formatFileSize, detectTypeFromFilename } from '@/entities/material';
import { MATERIAL_STATUS_PILL, MATERIAL_STATUS_LABEL } from '@/shared/constants/status';

const TYPE_BADGE: Record<MaterialType, string> = {
  document: 'DOC',
  video: 'MP4',
  presentation: 'PPT',
  spreadsheet: 'XLS',
};

const TYPE_INPUT_ACCEPT: Record<MaterialType, string> = {
  document: '.pdf,.doc,.docx,.txt,.md',
  video: '.mp4,.webm,.avi,.mov,.mkv',
  presentation: '.ppt,.pptx,.key',
  spreadsheet: '.xls,.xlsx,.csv',
};

const TYPE_ACCEPT_ALL = '.pdf,.doc,.docx,.txt,.md,.mp4,.webm,.avi,.mov,.mkv,.ppt,.pptx,.key,.xls,.xlsx,.csv,image/*';

export default function MaterialsPage() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [materialToDelete, setMaterialToDelete] = useState<Material | null>(null);
  const [previewMaterial, setPreviewMaterial] = useState<Material | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);

  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<MaterialType>('document');
  const [newStatus, setNewStatus] = useState<MaterialStatus>('draft');
  const [newOwner, setNewOwner] = useState('');
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchMaterials = async () => {
    try {
      const data = await getMaterials();
      setMaterials(data);
    } catch {
      console.error('Failed to load materials');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const selected = Array.from(files);
    setNewFiles((prev) => [...prev, ...selected]);
    if (!newTitle.trim()) {
      setNewTitle(selected[0].name.replace(/\.[^.]+$/, ''));
    }
    setNewType(detectTypeFromFilename(selected[0].name));
  };

  const removeNewFile = (index: number) => {
    setNewFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCreateMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOwner.trim() || newFiles.length === 0) return;
    setIsUploading(true);
    try {
      for (const file of newFiles) {
        await createMaterial({
          title: newFiles.length === 1 ? (newTitle.trim() || file.name.replace(/\.[^.]+$/, '')) : file.name.replace(/\.[^.]+$/, ''),
          type: detectTypeFromFilename(file.name),
          status: newStatus,
          owner: newOwner.trim(),
          file,
        });
      }
      resetAddForm();
      fetchMaterials();
    } catch {
      console.error('Failed to create material(s)');
    } finally {
      setIsUploading(false);
    }
  };

  const resetAddForm = () => {
    setNewTitle('');
    setNewType('document');
    setNewStatus('draft');
    setNewOwner('');
    setNewFiles([]);
    setIsAddModalOpen(false);
  };

  const handleConfirmDelete = async () => {
    if (!materialToDelete) return;
    try {
      await deleteMaterial(materialToDelete.id);
      setMaterialToDelete(null);
      fetchMaterials();
    } catch {
      console.error('Failed to delete material');
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === materials.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(materials.map((m) => m.id)));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    try {
      await bulkDeleteMaterials([...selectedIds]);
      setSelectedIds(new Set());
      setIsBulkDeleteOpen(false);
      fetchMaterials();
    } catch {
      console.error('Failed to delete materials');
    }
  };

  const getPreviewUrl = (m: Material): string | null => {
    if (m.filePath) return m.filePath;
    return null;
  };

  if (loading) return <div>Loading...</div>;

  const readyCount = materials.filter((m) => m.status === 'ready').length;
  const draftCount = materials.filter((m) => m.status === 'draft').length;
  const reviewCount = materials.filter((m) => m.status === 'review').length;
  const allSelected = materials.length > 0 && selectedIds.size === materials.length;

  return (
    <>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">Materials</h1>
          <p className="page-subtitle">Training documents, videos, and resources.</p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '10px 16px', background: '#4f46e5', color: 'white',
            border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600
          }}
        >
          <IconPlus size={18} /> Add Material
        </button>
      </div>

      <div className="stat-grid stat-grid-3">
        <StatCard icon={<IconFiles size={20} stroke={1.8} />} iconColor="blue" value={materials.length} label="Total Materials" />
        <StatCard icon={<IconCircleCheck size={20} stroke={1.8} />} iconColor="green" value={readyCount} label="Ready to Distribute" />
        <StatCard icon={<IconEdit size={20} stroke={1.8} />} iconColor="yellow" value={draftCount + reviewCount} label="Draft / In Review" />
      </div>

      <Panel
        title="All Materials"
        subtitle={selectedIds.size > 0 ? `${selectedIds.size} selected` : undefined}
        action={selectedIds.size > 0 ? { label: `Delete Selected (${selectedIds.size})`, onClick: () => setIsBulkDeleteOpen(true) } : undefined}
        className="full-panel"
        bodyClass="panel-body-sm"
      >
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: 40 }}>
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleSelectAll}
                  style={{ cursor: 'pointer', accentColor: '#4f46e5' }}
                />
              </th>
              <th>Title</th>
              <th>Type</th>
              <th>Owner</th>
              <th>Size</th>
              <th>Uploaded</th>
              <th>Status</th>
              <th style={{ width: 80 }}></th>
            </tr>
          </thead>
          <tbody>
            {materials.map((m: Material) => (
              <tr
                key={m.id}
                style={selectedIds.has(m.id) ? { background: '#eef2ff' } : undefined}
              >
                <td>
                  <input
                    type="checkbox"
                    checked={selectedIds.has(m.id)}
                    onChange={() => toggleSelect(m.id)}
                    style={{ cursor: 'pointer', accentColor: '#4f46e5' }}
                  />
                </td>
                <td>
                  <div className="table-name-cell">
                    <div
                      className={`material-type-icon ${m.type}`}
                      style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.5px' }}
                    >
                      {TYPE_BADGE[m.type]}
                    </div>
                    <span className="table-name-primary">{m.title}</span>
                  </div>
                </td>
                <td className="table-cell-muted" style={{ textTransform: 'capitalize' }}>
                  {m.type}
                </td>
                <td className="table-cell-muted">{m.owner}</td>
                <td className="table-cell-muted">{formatFileSize(m.sizeKb)}</td>
                <td className="table-cell-muted">{m.uploadedAt}</td>
                <td>
                  <Pill variant={MATERIAL_STATUS_PILL[m.status]}>{MATERIAL_STATUS_LABEL[m.status]}</Pill>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: 2 }}>
                    {getPreviewUrl(m) && (
                      <button
                        onClick={() => setPreviewMaterial(m)}
                        title="Preview"
                        style={{
                          background: 'none', border: 'none', cursor: 'pointer',
                          color: '#9ca3af', padding: 4, display: 'flex',
                          borderRadius: '4px', transition: 'color 0.15s'
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = '#4f46e5')}
                        onMouseLeave={(e) => (e.currentTarget.style.color = '#9ca3af')}
                      >
                        <IconEye size={16} />
                      </button>
                    )}
                    <button
                      onClick={() => setMaterialToDelete(m)}
                      title="Delete material"
                      style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: '#9ca3af', padding: 4, display: 'flex',
                        borderRadius: '4px', transition: 'color 0.15s'
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = '#dc2626')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = '#9ca3af')}
                    >
                      <IconTrash size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>

      {/* Add Material Modal */}
      {isAddModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          animation: 'modalFadeIn 0.2s ease-out forwards'
        }}>
          <div style={{
            background: 'white', borderRadius: '8px', width: '100%', maxWidth: '500px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            animation: 'modalSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid #e5e7eb' }}>
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: '#111827' }}>Add Material{newFiles.length > 1 ? 's' : ''}</h2>
              <button onClick={resetAddForm} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#000', padding: 0, display: 'flex' }}>
                <IconX size={24} stroke={1.5} />
              </button>
            </div>
            <form onSubmit={handleCreateMaterial} style={{ padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Upload drop zone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); e.currentTarget.style.borderColor = '#4f46e5'; e.currentTarget.style.background = '#eef2ff'; }}
                onDragLeave={(e) => { e.preventDefault(); e.currentTarget.style.borderColor = '#d1d5db'; e.currentTarget.style.background = newFiles.length ? '#f0fdf4' : '#f9fafb'; }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.currentTarget.style.borderColor = '#d1d5db';
                  e.currentTarget.style.background = newFiles.length ? '#f0fdf4' : '#f9fafb';
                  const files = Array.from(e.dataTransfer.files);
                  if (files.length > 0) {
                    setNewFiles((prev) => [...prev, ...files]);
                    if (!newTitle.trim()) setNewTitle(files[0].name.replace(/\.[^.]+$/, ''));
                    setNewType(detectTypeFromFilename(files[0].name));
                  }
                }}
                style={{
                  border: '2px dashed #d1d5db', borderRadius: 8, padding: '24px 16px',
                  textAlign: 'center', cursor: 'pointer', transition: 'border-color 0.15s, background 0.15s',
                  background: newFiles.length ? '#f0fdf4' : '#f9fafb',
                  borderColor: newFiles.length ? '#059669' : '#d1d5db',
                }}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={TYPE_ACCEPT_ALL}
                  multiple
                  onChange={handleFileSelect}
                  style={{ display: 'none' }}
                />
                <IconUpload size={24} stroke={1.5} color="#9ca3af" style={{ margin: '0 auto 8px' }} />
                <div style={{ fontSize: 13, color: '#6b7280' }}>
                  {newFiles.length > 0 ? 'Click or drop more files' : 'Click or drop files here'}
                </div>
                <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>
                  PDF, DOC, MP4, PPTX, XLSX, images, and more — select multiple at once
                </div>
              </div>

              {/* Pre-upload file list */}
              {newFiles.length > 0 && (
                <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, maxHeight: 200, overflowY: 'auto' }}>
                  <div style={{ padding: '8px 12px', background: '#f9fafb', borderBottom: '1px solid #e5e7eb', fontSize: 12, fontWeight: 600, color: '#6b7280', display: 'flex', justifyContent: 'space-between' }}>
                    <span>{newFiles.length} file{newFiles.length !== 1 ? 's' : ''} selected</span>
                    <span>{formatFileSize(Math.round(newFiles.reduce((acc, f) => acc + f.size, 0) / 1024))}</span>
                  </div>
                  {newFiles.map((file, i) => (
                    <div key={`${file.name}-${i}`} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderBottom: i < newFiles.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                      <div
                        className={`material-type-icon ${detectTypeFromFilename(file.name)}`}
                        style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.5px', flexShrink: 0 }}
                      >
                        {TYPE_BADGE[detectTypeFromFilename(file.name)]}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{file.name}</div>
                        <div style={{ fontSize: 11, color: '#9ca3af' }}>{formatFileSize(Math.round(file.size / 1024))}</div>
                      </div>
                      <button type="button" onClick={() => removeNewFile(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: 2, display: 'flex', flexShrink: 0 }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = '#dc2626')}
                        onMouseLeave={(e) => (e.currentTarget.style.color = '#9ca3af')}
                      >
                        <IconX size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <input
                type="text" placeholder={newFiles.length > 1 ? 'Title (optional, uses filename if empty)' : 'Material Title'} value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                style={{ width: '100%', padding: '12px 16px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '15px', outline: 'none', boxSizing: 'border-box', color: '#374151' }}
                autoFocus
              />
              <select value={newType} onChange={(e) => setNewType(e.target.value as MaterialType)}
                style={{ width: '100%', padding: '12px 16px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '15px', outline: 'none', boxSizing: 'border-box', color: '#374151', background: 'white' }}>
                <option value="document">Document</option>
                <option value="video">Video</option>
                <option value="presentation">Presentation</option>
                <option value="spreadsheet">Spreadsheet</option>
              </select>
              <select value={newStatus} onChange={(e) => setNewStatus(e.target.value as MaterialStatus)}
                style={{ width: '100%', padding: '12px 16px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '15px', outline: 'none', boxSizing: 'border-box', color: '#374151', background: 'white' }}>
                <option value="draft">Draft</option>
                <option value="review">In Review</option>
                <option value="ready">Ready</option>
              </select>
              <input
                type="text" placeholder="Owner" value={newOwner}
                onChange={(e) => setNewOwner(e.target.value)}
                style={{ width: '100%', padding: '12px 16px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '15px', outline: 'none', boxSizing: 'border-box', color: '#374151' }}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px', borderTop: '1px solid #e5e7eb', paddingTop: '16px', gap: 10 }}>
                <button type="button" onClick={resetAddForm} style={{ padding: '10px 20px', background: 'white', color: '#374151', border: '1px solid #d1d5db', borderRadius: '4px', cursor: 'pointer', fontWeight: 500, fontSize: '14px' }}>
                  Cancel
                </button>
                <button type="submit" disabled={newFiles.length === 0 || !newOwner.trim() || isUploading} style={{ padding: '10px 28px', background: newFiles.length === 0 || !newOwner.trim() || isUploading ? '#9ca3af' : '#002842', color: 'white', border: 'none', borderRadius: '4px', cursor: newFiles.length === 0 || !newOwner.trim() || isUploading ? 'not-allowed' : 'pointer', fontWeight: 500, fontSize: '14px', letterSpacing: '0.5px' }}>
                  {isUploading ? 'Uploading...' : `UPLOAD ${newFiles.length > 1 ? `${newFiles.length} FILES` : 'FILE'}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewMaterial && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          animation: 'modalFadeIn 0.2s ease-out forwards'
        }}>
          <div style={{
            background: 'white', borderRadius: '8px', width: '90%', maxWidth: '800px',
            maxHeight: '85vh', display: 'flex', flexDirection: 'column',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            animation: 'modalSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px', borderBottom: '1px solid #e5e7eb', flexShrink: 0 }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#111827' }}>{previewMaterial.title}</h2>
                <span style={{ fontSize: 12, color: '#6b7280' }}>{previewMaterial.type} · {formatFileSize(previewMaterial.sizeKb)}</span>
              </div>
              <button onClick={() => setPreviewMaterial(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#000', padding: 0, display: 'flex' }}>
                <IconX size={24} stroke={1.5} />
              </button>
            </div>
            <div style={{ flex: 1, overflow: 'auto', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f3f4f6', minHeight: 400 }}>
              {previewMaterial.type === 'video' && previewMaterial.filePath ? (
                <video
                  src={previewMaterial.filePath}
                  controls
                  style={{ maxWidth: '100%', maxHeight: '100%' }}
                />
              ) : previewMaterial.filePath && (
                <iframe
                  src={previewMaterial.filePath}
                  style={{ width: '100%', height: '100%', minHeight: 500, border: 'none' }}
                  title={previewMaterial.title}
                />
              )}
              {!previewMaterial.filePath && (
                <div style={{ textAlign: 'center', padding: 40, color: '#9ca3af' }}>
                  <IconFiles size={48} stroke={1.2} style={{ margin: '0 auto 12px' }} />
                  <div style={{ fontSize: 14 }}>No file to preview</div>
                  <div style={{ fontSize: 12, marginTop: 4 }}>This material was created without an uploaded file.</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Single Material Modal */}
      {materialToDelete && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          animation: 'modalFadeIn 0.2s ease-out forwards'
        }}>
          <div style={{
            background: 'white', borderRadius: '8px', width: '100%', maxWidth: '420px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            animation: 'modalSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards'
          }}>
            <div style={{ padding: '24px 20px', textAlign: 'center' }}>
              <div style={{ fontSize: '40px', marginBottom: '12px', color: '#dc2626' }}>
                <IconTrash size={40} />
              </div>
              <h2 style={{ margin: '0 0 8px', fontSize: '18px', fontWeight: 600, color: '#111827' }}>Delete Material</h2>
              <p style={{ margin: 0, color: '#6b7280', fontSize: '14px', lineHeight: '1.5' }}>
                Are you sure you want to delete <strong>{materialToDelete.title}</strong>? This action cannot be undone.
              </p>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', padding: '16px 20px', borderTop: '1px solid #e5e7eb' }}>
              <button onClick={() => setMaterialToDelete(null)} style={{ padding: '9px 20px', background: 'white', color: '#374151', border: '1px solid #d1d5db', borderRadius: '6px', cursor: 'pointer', fontWeight: 500, fontSize: '14px' }}>Cancel</button>
              <button onClick={handleConfirmDelete} style={{ padding: '9px 20px', background: '#dc2626', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 500, fontSize: '14px' }}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Delete Modal */}
      {isBulkDeleteOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          animation: 'modalFadeIn 0.2s ease-out forwards'
        }}>
          <div style={{
            background: 'white', borderRadius: '8px', width: '100%', maxWidth: '420px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            animation: 'modalSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards'
          }}>
            <div style={{ padding: '24px 20px', textAlign: 'center' }}>
              <div style={{ fontSize: '40px', marginBottom: '12px', color: '#dc2626' }}>
                <IconChecks size={40} />
              </div>
              <h2 style={{ margin: '0 0 8px', fontSize: '18px', fontWeight: 600, color: '#111827' }}>
                Delete {selectedIds.size} Material{selectedIds.size !== 1 ? 's' : ''}
              </h2>
              <p style={{ margin: 0, color: '#6b7280', fontSize: '14px', lineHeight: '1.5' }}>
                Are you sure you want to delete <strong>{selectedIds.size} selected material{selectedIds.size !== 1 ? 's' : ''}</strong>? This action cannot be undone.
              </p>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', padding: '16px 20px', borderTop: '1px solid #e5e7eb' }}>
              <button onClick={() => setIsBulkDeleteOpen(false)} style={{ padding: '9px 20px', background: 'white', color: '#374151', border: '1px solid #d1d5db', borderRadius: '6px', cursor: 'pointer', fontWeight: 500, fontSize: '14px' }}>Cancel</button>
              <button onClick={handleBulkDelete} style={{ padding: '9px 20px', background: '#dc2626', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 500, fontSize: '14px' }}>Delete All</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
