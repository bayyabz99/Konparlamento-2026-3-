'use client';

import React, { useState, useEffect } from 'react';
import { initialData, savePollToSupabase, fetchPollsFromSupabase } from '@/lib/supabase';
import { useNotifications } from '@/context/NotificationContext';
import { Vote, CheckCircle2, Plus, X, Send, Trash2 } from 'lucide-react';

export default function PollsAdminPage() {
  const { addNotification } = useNotifications();
  const [polls, setPolls] = useState<any[]>(initialData.polls);
  const [selectedPollId, setSelectedPollId] = useState<string>('poll-1');

  // Create New Poll Form Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [options, setOptions] = useState<string[]>(['', '']);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    async function loadPolls() {
      const data = await fetchPollsFromSupabase();
      if (data && data.length > 0) {
        setPolls(data);
        setSelectedPollId(data[0].id);
      }
    }
    loadPolls();
  }, []);

  const activePoll = polls.find((p) => p.id === selectedPollId) || polls[0] || null;
  const totalVotes = activePoll?.options?.reduce((sum: number, opt: any) => sum + (opt.votes || 0), 0) || 1;

  const handleAddOption = () => {
    setOptions([...options, '']);
  };

  const handleRemoveOption = (index: number) => {
    if (options.length <= 2) return;
    setOptions(options.filter((_, i) => i !== index));
  };

  const handleOptionChange = (index: number, val: string) => {
    const updated = [...options];
    updated[index] = val;
    setOptions(updated);
  };

  const handleCreatePoll = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const validOptions = options.map((o) => o.trim()).filter(Boolean);
    if (validOptions.length < 2) {
      alert('Lütfen en az 2 geçerli seçenek giriniz.');
      return;
    }

    const updatedPolls = polls.map((p) => ({ ...p, isActive: false }));

    const newPoll = {
      id: 'poll-' + Date.now(),
      title: newTitle.trim(),
      isActive: true,
      options: validOptions.map((optText, idx) => ({
        id: `opt-${Date.now()}-${idx}`,
        text: optText,
        votes: 0,
      })),
    };

    const finalPolls = [newPoll, ...updatedPolls];
    setPolls(finalPolls);
    setSelectedPollId(newPoll.id);
    initialData.polls = finalPolls;

    await savePollToSupabase(newPoll);

    addNotification(
      'Yeni Oylama Başladı!',
      `" ${newTitle} " konulu yeni canlı oylamaya katılabilirsiniz.`,
      'DUYURU'
    );

    setSuccessMsg('Yeni oylama anketi başarıyla oluşturuldu ve yayına alındı!');
    setTimeout(() => setSuccessMsg(''), 3500);
    setNewTitle('');
    setOptions(['', '']);
    setShowCreateModal(false);
  };

  const handleSetActivePoll = (pollId: string) => {
    const updated = polls.map((p) => ({
      ...p,
      isActive: p.id === pollId,
    }));
    setPolls(updated);
    setSelectedPollId(pollId);
    initialData.polls = updated;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-zinc-900 pb-6">
        <div>
          <span className="text-xs font-bold text-red-500 uppercase tracking-widest block">
            GİZLİ OYLAMA ANALİTİĞİ
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Oylama İstatistikleri ve Yönetimi
          </h1>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-red-950/60 flex items-center gap-2 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Yeni Oylama Çıkar</span>
        </button>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-950/80 border border-emerald-500 text-emerald-300 text-xs rounded-2xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Select Active Poll Dropdown / Tabs */}
      <div className="flex items-center gap-3 overflow-x-auto pb-2 custom-scrollbar">
        {polls.map((p) => (
          <button
            key={p.id}
            onClick={() => handleSetActivePoll(p.id)}
            className={`px-4 py-2 rounded-xl font-bold text-xs shrink-0 transition flex items-center gap-2 ${
              selectedPollId === p.id
                ? 'bg-red-600 text-white shadow-md shadow-red-950/60'
                : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
            }`}
          >
            <span>{p.title.length > 30 ? p.title.substring(0, 30) + '...' : p.title}</span>
            {p.isActive && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            )}
          </button>
        ))}
      </div>

      {/* Live Poll Statistics Card */}
      {activePoll && (
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-zinc-800 space-y-6">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
            <div>
              <span className="text-[10px] font-bold text-red-400 uppercase tracking-widest block">
                SEÇİLİ OYLAMA SORUSU
              </span>
              <h2 className="text-lg font-bold text-white">{activePoll.title}</h2>
            </div>
            <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-2xl text-right">
              <span className="text-xs text-zinc-400 block">Kullanılan Oy</span>
              <span className="text-2xl font-extrabold text-white">{totalVotes}</span>
            </div>
          </div>

          {/* Breakdown bars */}
          <div className="space-y-4">
            {(activePoll.options || []).map((opt: any) => {
              const percentage = Math.round(((opt.votes || 0) / totalVotes) * 100);
              return (
                <div key={opt.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="text-white font-semibold">{opt.text}</span>
                    <span className="text-red-400 font-mono font-bold">
                      {opt.votes || 0} Oy (%{percentage})
                    </span>
                  </div>
                  <div className="h-3 w-full bg-zinc-950 rounded-full overflow-hidden border border-zinc-800">
                    <div
                      className="h-full bg-gradient-to-r from-red-600 to-red-500 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* CREATE NEW POLL MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-xl bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-6 text-zinc-100 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div>
                <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest block">
                  CANLI OYLAMA EKLE
                </span>
                <h2 className="text-xl font-bold text-white">Yeni Oylama / Anket Oluştur</h2>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 rounded-full bg-zinc-950 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePoll} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="block font-semibold text-zinc-300">Oylama / Anket Başlığı *</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Örn: 2026 Simülasyonunun En Başarılı Komisyonu?"
                  className="w-full p-3.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white outline-none focus:border-red-500 text-sm font-medium"
                />
              </div>

              {/* Dynamic Options list */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <label className="block font-semibold text-zinc-300">Oylama Seçenekleri *</label>
                  <button
                    type="button"
                    onClick={handleAddOption}
                    className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-[11px] rounded-lg transition"
                  >
                    + Seçenek Ekle
                  </button>
                </div>

                <div className="space-y-2">
                  {options.map((optText, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="w-6 text-center font-bold text-zinc-500 text-xs">{idx + 1}.</span>
                      <input
                        type="text"
                        required
                        value={optText}
                        onChange={(e) => handleOptionChange(idx, e.target.value)}
                        placeholder={`Seçenek ${idx + 1}`}
                        className="w-full p-3 bg-zinc-950 border border-zinc-800 rounded-xl text-white outline-none focus:border-red-500 text-xs"
                      />
                      {options.length > 2 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveOption(idx)}
                          className="p-2 text-zinc-500 hover:text-red-400"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-5 py-2.5 bg-zinc-950 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 font-bold rounded-xl transition"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl shadow-lg shadow-red-950/60 flex items-center gap-2 transition"
                >
                  <Send className="w-4 h-4" />
                  <span>Oylamayı Yayınla</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
