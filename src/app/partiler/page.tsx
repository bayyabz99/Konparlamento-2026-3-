'use client';

import React, { useState, useEffect } from 'react';
import { initialData, fetchApplicationsFromSupabase } from '@/lib/supabase';
import { Flag, Users, Award, Shield, ChevronRight, Sparkles, CheckCircle, UserCheck } from 'lucide-react';

export default function PartiesPage() {
  const [parties, setParties] = useState(initialData.parties);
  const [approvedApplications, setApprovedApplications] = useState<any[]>([]);

  useEffect(() => {
    async function loadApprovedMembers() {
      const apps = await fetchApplicationsFromSupabase();
      const approved = apps.filter((a: any) => a.status === 'ONAYLANDI' || a.status === 'approved');
      setApprovedApplications(approved);
    }
    loadApprovedMembers();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Header */}
      <div className="text-center space-y-3 max-w-3xl mx-auto">
        <span className="text-xs font-bold text-red-500 uppercase tracking-widest px-3 py-1 bg-red-950/40 border border-red-900/40 rounded-full inline-block">
          PARLAMENTO SİYASİ GRUPLARI
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white">
          Meclis Partilerimiz — Konparlamento 2026
        </h1>
        <p className="text-zinc-300 text-sm sm:text-base leading-relaxed">
          Simülasyon genel kurulunda yasama tasarılarına yön veren, farklı ideoloji ve vizyonlara sahip temsilci partilerimiz.
        </p>
      </div>

      {/* Parties Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {parties.map((party) => {
          // Filter approved applicants linked to this specific party
          const partyMembers = approvedApplications.filter(
            (app) =>
              app.requestedParty === party.name ||
              app.requestedParty === party.acronym ||
              app.requestedParty?.includes(party.acronym) ||
              app.requestedParty?.includes(party.name)
          );

          return (
            <div
              key={party.id}
              className="glass-panel rounded-3xl overflow-hidden border border-zinc-800 flex flex-col justify-between hover:border-red-900/50 transition group"
            >
              {/* Header / Logo banner */}
              <div className="relative h-48 w-full bg-zinc-900 overflow-hidden">
                <img
                  src={party.logo}
                  alt={party.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent" />
                <div className="absolute top-4 left-4">
                  <span
                    className="px-3 py-1 rounded-full font-mono font-bold text-xs text-white shadow-lg border border-white/20"
                    style={{ backgroundColor: party.color || '#dc2626' }}
                  >
                    {party.acronym}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4 flex-1 flex flex-col justify-between -mt-6 relative z-10">
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-red-400 uppercase tracking-widest block">
                    {party.ideology}
                  </span>
                  <h3 className="text-xl font-bold text-white group-hover:text-red-400 transition">
                    {party.name}
                  </h3>
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    {party.description}
                  </p>
                </div>

                {/* Stats & Leader */}
                <div className="pt-4 border-t border-zinc-800/80 space-y-4">
                  <div className="flex items-center justify-between text-xs text-zinc-400">
                    <span className="flex items-center gap-1.5">
                      <Flag className="w-3.5 h-3.5 text-red-500" /> Grup Başkanı:
                    </span>
                    <span className="font-bold text-white">{party.leader}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-center text-xs">
                    <div className="p-2.5 bg-zinc-950 border border-zinc-800 rounded-xl space-y-0.5">
                      <span className="text-[10px] text-zinc-500 block">Kayıtlı Üye</span>
                      <span className="font-bold text-white text-sm">
                        {party.memberCount + partyMembers.length} Delege
                      </span>
                    </div>
                    <div className="p-2.5 bg-zinc-950 border border-zinc-800 rounded-xl space-y-0.5">
                      <span className="text-[10px] text-zinc-500 block">Meclis Koltuğu</span>
                      <span className="font-bold text-red-400 text-sm">{party.seats} Koltuk</span>
                    </div>
                  </div>

                  {/* AUTOMATED PARTY MEMBERS (ÜYELER) SECTION */}
                  <div className="space-y-2 pt-2 border-t border-zinc-800/60">
                    <span className="text-[11px] font-bold text-zinc-300 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <UserCheck className="w-3.5 h-3.5 text-emerald-400" /> Onaylı Parti Üyeleri
                      </span>
                      <span className="text-[10px] text-emerald-400 font-mono font-bold">
                        {partyMembers.length} Kayıtlı
                      </span>
                    </span>

                    {partyMembers.length === 0 ? (
                      <p className="text-[11px] text-zinc-500 italic p-2 bg-zinc-950/60 rounded-xl text-center">
                        Bu partide henüz onaylanmış yeni delege kaydı bulunmamaktadır.
                      </p>
                    ) : (
                      <div className="space-y-1.5 max-h-36 overflow-y-auto custom-scrollbar">
                        {partyMembers.map((member) => (
                          <div
                            key={member.id}
                            className="p-2 bg-zinc-950 border border-zinc-800/80 rounded-xl flex items-center justify-between text-xs"
                          >
                            <div className="flex items-center gap-2 overflow-hidden">
                              <div className="w-6 h-6 rounded-full bg-red-600/30 text-red-400 flex items-center justify-center font-bold text-[10px] shrink-0">
                                {member.firstName?.[0] || 'D'}
                              </div>
                              <span className="font-semibold text-white truncate">
                                {member.firstName} {member.lastName}
                              </span>
                            </div>
                            <span className="text-[9px] text-emerald-300 font-bold bg-emerald-950 border border-emerald-500/40 px-2 py-0.5 rounded-full shrink-0">
                              Onaylı
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
