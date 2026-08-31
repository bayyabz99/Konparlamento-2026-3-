'use client';

import React, { useState, useEffect } from 'react';
import { initialData, fetchCommitteesFromSupabase, saveCommitteeToSupabase, deleteRecordInSupabase } from '@/lib/supabase';
import { Layers, Plus, Trash2, Edit, X, Save, Image as ImageIcon, User, CheckCircle } from 'lucide-react';

export default function CommitteesAdminPage() {
  const [committees, setCommittees] = useState(initialData.committees);

  // Edit / Add modal state
  const [editingComm, setEditingComm] = useState<any | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    async function loadCommittees() {
      const data = await fetchCommitteesFromSupabase();
      if (data && data.length > 0) {
        setCommittees(data);
      }
    }
    loadCommittees();
  }, []);

  const handleOpenAdd = () => {
    setIsNew(true);
    setEditingComm({
      id: 'comm-' + Date.now(),
      title: '',
      slug: '',
      shortDescription: '',
      detailedDescription: '',
      purpose: '',
      workflow: '',
      duties: '',
      rules: '',
      chairPerson: '',
      viceChairPerson: '',
      images: [
        'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=800&q=80',
      ],
      members: [],
    });
  };

  const handleOpenEdit = (comm: any) => {
    setIsNew(false);
    setEditingComm(JSON.parse(JSON.stringify(comm)));
  };

  const handleDelete = async (id: string) => {
    if (confirm('Bu komisyonu ve ilgili verilerini silmek istediğinizden emin misiniz?')) {
      const updated = committees.filter((c) => c.id !== id);
      setCommittees(updated);
      initialData.committees = updated;
      await deleteRecordInSupabase('committees', id);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingComm || !editingComm.title) return;

    let updated = [...committees];
    if (isNew) {
      updated.unshift(editingComm);
    } else {
      updated = updated.map((c) => (c.id === editingComm.id ? editingComm : c));
    }

    setCommittees(updated);
    initialData.committees = updated;

    await saveCommitteeToSupabase(editingComm);

    setSuccessMsg(isNew ? 'Yeni komisyon başarıyla eklendi!' : 'Komisyon bilgileri güncellendi!');
    setTimeout(() => setSuccessMsg(''), 3000);
    setEditingComm(null);
  };

  const handleAddMember = () => {
    if (!editingComm) return;
    const newMember = {
      id: 'cm-' + Date.now(),
      name: 'Yeni Üye',
      role: 'Delegasyon Üyesi',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    };
    setEditingComm({
      ...editingComm,
      members: [...(editingComm.members || []), newMember],
    });
  };

  const handleRemoveMember = (memId: string) => {
    if (!editingComm) return;
    setEditingComm({
      ...editingComm,
      members: editingComm.members.filter((m: any) => m.id !== memId),
    });
  };

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-zinc-900 pb-6">
        <div>
          <span className="text-xs font-bold text-red-500 uppercase tracking-widest block">
            İÇERİK VE İÇ TÜZÜK
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Komisyonlar ve Üye Yönetimi ({committees.length})
          </h1>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-red-950/60 flex items-center gap-2 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Yeni Komisyon Ekle</span>
        </button>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-950/80 border border-emerald-500 text-emerald-300 text-xs rounded-2xl flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Committees Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {committees.map((c) => (
          <div key={c.id} className="glass-panel p-6 rounded-3xl border border-zinc-800 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-white text-lg">{c.title}</h3>
                  <span className="text-xs font-semibold text-red-400">Başkan: {c.chairPerson || 'Atanmadı'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEdit(c)}
                    className="p-2 text-zinc-400 hover:text-white bg-zinc-900 hover:bg-zinc-800 rounded-xl border border-zinc-800 transition"
                    title="Düzenle"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(c.id)}
                    className="p-2 text-zinc-500 hover:text-red-400 bg-zinc-900 hover:bg-red-950/50 rounded-xl border border-zinc-800 transition"
                    title="Sil"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <p className="text-xs text-zinc-300 leading-relaxed">{c.shortDescription}</p>

              {c.images && c.images.length > 0 && (
                <div className="flex items-center gap-2 overflow-x-auto py-1 custom-scrollbar">
                  {c.images.map((imgUrl: string, idx: number) => (
                    <img
                      key={idx}
                      src={imgUrl}
                      alt={`Görsel ${idx + 1}`}
                      className="w-16 h-12 rounded-lg object-cover border border-zinc-800"
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-400 font-medium">
              <span>{c.members?.length || 0} Üye Kayıtlı</span>
              <span>{c.images?.length || 0} Görsel Yüklü</span>
            </div>
          </div>
        ))}
      </div>

      {/* EDIT / ADD MODAL */}
      {editingComm && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-3xl bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto custom-scrollbar text-zinc-100">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div>
                <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest block">
                  {isNew ? 'YENİ KOMİSYON EKLE' : 'KOMİSYON DÜZENLE'}
                </span>
                <h2 className="text-xl font-bold text-white">
                  {editingComm.title || 'Komisyon Detayları'}
                </h2>
              </div>
              <button
                onClick={() => setEditingComm(null)}
                className="p-2 rounded-full bg-zinc-950 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block font-semibold text-zinc-300">Komisyon Başlığı *</label>
                  <input
                    type="text"
                    required
                    value={editingComm.title}
                    onChange={(e) => setEditingComm({ ...editingComm, title: e.target.value })}
                    placeholder="Örn: Savunma ve Güvenlik Komisyonu"
                    className="w-full p-3 bg-zinc-950 border border-zinc-800 rounded-xl text-white outline-none focus:border-red-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-semibold text-zinc-300">Slug / URL Bağlantısı</label>
                  <input
                    type="text"
                    value={editingComm.slug}
                    onChange={(e) => setEditingComm({ ...editingComm, slug: e.target.value })}
                    placeholder="savunma-komisyonu"
                    className="w-full p-3 bg-zinc-950 border border-zinc-800 rounded-xl text-white outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block font-semibold text-zinc-300">Kısa Açıklama *</label>
                <input
                  type="text"
                  required
                  value={editingComm.shortDescription}
                  onChange={(e) => setEditingComm({ ...editingComm, shortDescription: e.target.value })}
                  placeholder="Komisyonun kısa özeti..."
                  className="w-full p-3 bg-zinc-950 border border-zinc-800 rounded-xl text-white outline-none focus:border-red-500"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-semibold text-zinc-300">Detaylı Açıklama</label>
                <textarea
                  rows={3}
                  value={editingComm.detailedDescription}
                  onChange={(e) => setEditingComm({ ...editingComm, detailedDescription: e.target.value })}
                  placeholder="Komisyonun detaylı vizyonu ve hedefleri..."
                  className="w-full p-3 bg-zinc-950 border border-zinc-800 rounded-xl text-white outline-none focus:border-red-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block font-semibold text-zinc-300">Komisyon Amacı</label>
                  <textarea
                    rows={2}
                    value={editingComm.purpose}
                    onChange={(e) => setEditingComm({ ...editingComm, purpose: e.target.value })}
                    className="w-full p-3 bg-zinc-950 border border-zinc-800 rounded-xl text-white outline-none focus:border-red-500 resize-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-semibold text-zinc-300">Çalışma Şekli</label>
                  <textarea
                    rows={2}
                    value={editingComm.workflow}
                    onChange={(e) => setEditingComm({ ...editingComm, workflow: e.target.value })}
                    className="w-full p-3 bg-zinc-950 border border-zinc-800 rounded-xl text-white outline-none focus:border-red-500 resize-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block font-semibold text-zinc-300">Komisyon Görevleri</label>
                  <textarea
                    rows={2}
                    value={editingComm.duties}
                    onChange={(e) => setEditingComm({ ...editingComm, duties: e.target.value })}
                    className="w-full p-3 bg-zinc-950 border border-zinc-800 rounded-xl text-white outline-none focus:border-red-500 resize-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-semibold text-zinc-300">Komisyon Kuralları</label>
                  <textarea
                    rows={2}
                    value={editingComm.rules}
                    onChange={(e) => setEditingComm({ ...editingComm, rules: e.target.value })}
                    className="w-full p-3 bg-zinc-950 border border-zinc-800 rounded-xl text-white outline-none focus:border-red-500 resize-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block font-semibold text-zinc-300">Komisyon Başkanı</label>
                  <input
                    type="text"
                    value={editingComm.chairPerson}
                    onChange={(e) => setEditingComm({ ...editingComm, chairPerson: e.target.value })}
                    placeholder="Başkan Adı"
                    className="w-full p-3 bg-zinc-950 border border-zinc-800 rounded-xl text-white outline-none focus:border-red-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-semibold text-zinc-300">Başkan Yardımcısı</label>
                  <input
                    type="text"
                    value={editingComm.viceChairPerson}
                    onChange={(e) => setEditingComm({ ...editingComm, viceChairPerson: e.target.value })}
                    placeholder="Yardımcı Adı"
                    className="w-full p-3 bg-zinc-950 border border-zinc-800 rounded-xl text-white outline-none focus:border-red-500"
                  />
                </div>
              </div>

              {/* Images Array */}
              <div className="space-y-2 pt-2 border-t border-zinc-800">
                <label className="block font-semibold text-zinc-300 flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-red-500" /> Slayt Görsel URL'leri (Virgül ile Ayırınız)
                </label>
                <input
                  type="text"
                  value={editingComm.images?.join(', ') || ''}
                  onChange={(e) =>
                    setEditingComm({
                      ...editingComm,
                      images: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                    })
                  }
                  placeholder="https://image1.jpg, https://image2.jpg"
                  className="w-full p-3 bg-zinc-950 border border-zinc-800 rounded-xl text-white outline-none focus:border-red-500 font-mono text-[11px]"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setEditingComm(null)}
                  className="px-5 py-2.5 bg-zinc-950 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 font-bold rounded-xl transition"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl shadow-lg shadow-red-950/60 flex items-center gap-2 transition"
                >
                  <Save className="w-4 h-4" />
                  <span>Komisyonu Kaydet</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
