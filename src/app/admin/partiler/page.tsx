'use client';

import React, { useState, useEffect } from 'react';
import { initialData, fetchPartiesFromSupabase, savePartyToSupabase, deleteRecordInSupabase } from '@/lib/supabase';
import { Flag, Plus, Trash2, Edit, X, Save, CheckCircle } from 'lucide-react';

export default function PartiesAdminPage() {
  const [parties, setParties] = useState(initialData.parties);

  // Edit / Add modal state
  const [editingParty, setEditingParty] = useState<any | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    async function loadParties() {
      const data = await fetchPartiesFromSupabase();
      if (data && data.length > 0) {
        setParties(data);
      }
    }
    loadParties();
  }, []);

  const handleOpenAdd = () => {
    setIsNew(true);
    setEditingParty({
      id: 'party-' + Date.now(),
      name: '',
      acronym: '',
      color: '#dc2626',
      logo: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=300&q=80',
      description: '',
      ideology: '',
      leader: '',
      memberCount: 30,
      seats: 12,
    });
  };

  const handleOpenEdit = (party: any) => {
    setIsNew(false);
    setEditingParty(JSON.parse(JSON.stringify(party)));
  };

  const handleDelete = async (id: string) => {
    if (confirm('Bu siyasi meclis grubunu silmek istediğinizden emin misiniz?')) {
      const updated = parties.filter((p) => p.id !== id);
      setParties(updated);
      initialData.parties = updated;
      await deleteRecordInSupabase('parties', id);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingParty || !editingParty.name) return;

    let updated = [...parties];
    if (isNew) {
      updated.unshift(editingParty);
    } else {
      updated = updated.map((p) => (p.id === editingParty.id ? editingParty : p));
    }

    setParties(updated);
    initialData.parties = updated;

    await savePartyToSupabase(editingParty);

    setSuccessMsg(isNew ? 'Yeni siyasi parti başarıyla eklendi!' : 'Parti bilgileri güncellendi!');
    setTimeout(() => setSuccessMsg(''), 3000);
    setEditingParty(null);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-zinc-900 pb-6">
        <div>
          <span className="text-xs font-bold text-red-500 uppercase tracking-widest block">
            PARLAMENTO SİYASİ GRUPLARI
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Partiler Yönetim Paneli ({parties.length})
          </h1>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-red-950/60 flex items-center gap-2 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Yeni Parti Ekle</span>
        </button>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-950/80 border border-emerald-500 text-emerald-300 text-xs rounded-2xl flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Parties Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {parties.map((p) => (
          <div key={p.id} className="glass-panel p-6 rounded-3xl border border-zinc-800 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs text-white font-mono shadow-md"
                    style={{ backgroundColor: p.color || '#dc2626' }}
                  >
                    {p.acronym}
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base">{p.name}</h3>
                    <span className="text-[10px] font-semibold text-red-400 block">{p.ideology}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleOpenEdit(p)}
                    className="p-2 text-zinc-400 hover:text-white bg-zinc-900 hover:bg-zinc-800 rounded-xl border border-zinc-800 transition"
                    title="Düzenle"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="p-2 text-zinc-500 hover:text-red-400 bg-zinc-900 hover:bg-red-950/50 rounded-xl border border-zinc-800 transition"
                    title="Sil"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <p className="text-xs text-zinc-300 leading-relaxed">{p.description}</p>
            </div>

            <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-400 font-medium">
              <span>Lider: <strong className="text-white">{p.leader}</strong></span>
              <span className="text-red-400 font-bold">{p.seats} Koltuk</span>
            </div>
          </div>
        ))}
      </div>

      {/* EDIT / ADD MODAL */}
      {editingParty && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-xl bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto custom-scrollbar text-zinc-100">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div>
                <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest block">
                  {isNew ? 'YENİ PARTİ EKLE' : 'PARTİ DÜZENLE'}
                </span>
                <h2 className="text-xl font-bold text-white">
                  {editingParty.name || 'Parti Detayları'}
                </h2>
              </div>
              <button
                onClick={() => setEditingParty(null)}
                className="p-2 rounded-full bg-zinc-950 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block font-semibold text-zinc-300">Parti Adı *</label>
                  <input
                    type="text"
                    required
                    value={editingParty.name}
                    onChange={(e) => setEditingParty({ ...editingParty, name: e.target.value })}
                    placeholder="Gelecek ve İnovasyon Partisi"
                    className="w-full p-3 bg-zinc-950 border border-zinc-800 rounded-xl text-white outline-none focus:border-red-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-semibold text-zinc-300">Kısaltma (Kısaltılmış İsim) *</label>
                  <input
                    type="text"
                    required
                    value={editingParty.acronym}
                    onChange={(e) => setEditingParty({ ...editingParty, acronym: e.target.value })}
                    placeholder="GİP"
                    className="w-full p-3 bg-zinc-950 border border-zinc-800 rounded-xl text-white font-mono uppercase outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block font-semibold text-zinc-300">Parti Rengi (HEX Code)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={editingParty.color || '#dc2626'}
                      onChange={(e) => setEditingParty({ ...editingParty, color: e.target.value })}
                      className="w-10 h-10 rounded-xl bg-zinc-950 border border-zinc-800 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={editingParty.color || '#dc2626'}
                      onChange={(e) => setEditingParty({ ...editingParty, color: e.target.value })}
                      className="w-full p-3 bg-zinc-950 border border-zinc-800 rounded-xl text-white font-mono outline-none focus:border-red-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block font-semibold text-zinc-300">Grup Başkanı (Lider)</label>
                  <input
                    type="text"
                    value={editingParty.leader}
                    onChange={(e) => setEditingParty({ ...editingParty, leader: e.target.value })}
                    placeholder="Eren Karaca"
                    className="w-full p-3 bg-zinc-950 border border-zinc-800 rounded-xl text-white outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block font-semibold text-zinc-300">İdeoloji / Politika Çizgisi</label>
                <input
                  type="text"
                  value={editingParty.ideology}
                  onChange={(e) => setEditingParty({ ...editingParty, ideology: e.target.value })}
                  placeholder="Sosyal İnovasyon & Dijital Demokrasi"
                  className="w-full p-3 bg-zinc-950 border border-zinc-800 rounded-xl text-white outline-none focus:border-red-500"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-semibold text-zinc-300">Açıklama / Vizyon *</label>
                <textarea
                  rows={3}
                  required
                  value={editingParty.description}
                  onChange={(e) => setEditingParty({ ...editingParty, description: e.target.value })}
                  placeholder="Partinin ilkeleri ve amaçları..."
                  className="w-full p-3 bg-zinc-950 border border-zinc-800 rounded-xl text-white outline-none focus:border-red-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block font-semibold text-zinc-300">Kayıtlı Üye Sayısı</label>
                  <input
                    type="number"
                    value={editingParty.memberCount}
                    onChange={(e) => setEditingParty({ ...editingParty, memberCount: parseInt(e.target.value) || 0 })}
                    className="w-full p-3 bg-zinc-950 border border-zinc-800 rounded-xl text-white outline-none focus:border-red-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-semibold text-zinc-300">Meclis Koltuk Sayısı</label>
                  <input
                    type="number"
                    value={editingParty.seats}
                    onChange={(e) => setEditingParty({ ...editingParty, seats: parseInt(e.target.value) || 0 })}
                    className="w-full p-3 bg-zinc-950 border border-zinc-800 rounded-xl text-white outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block font-semibold text-zinc-300">Logo / Banner URL</label>
                <input
                  type="text"
                  value={editingParty.logo}
                  onChange={(e) => setEditingParty({ ...editingParty, logo: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full p-3 bg-zinc-950 border border-zinc-800 rounded-xl text-white font-mono text-[11px] outline-none focus:border-red-500"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setEditingParty(null)}
                  className="px-5 py-2.5 bg-zinc-950 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 font-bold rounded-xl transition"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl shadow-lg shadow-red-950/60 flex items-center gap-2 transition"
                >
                  <Save className="w-4 h-4" />
                  <span>Partiyi Kaydet</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
