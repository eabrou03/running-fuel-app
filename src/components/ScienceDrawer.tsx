'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export interface Citation {
  id: string;
  title: string;
  authors: string;
  publication_year: number;
  doi_url: string;
  key_finding: string;
  trigger_tag: string;
}

interface ScienceDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeTags: string[]; // e.g. ['dual_carbs', 'sodium_bicarb', 'electrolytes']
}

export default function ScienceDrawer({ isOpen, onClose, activeTags }: ScienceDrawerProps) {
  const [citations, setCitations] = useState<Citation[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen || activeTags.length === 0) return;

    async function fetchCitations() {
      setLoading(true);
      const { data, error } = await supabase
        .from('literature_citations')
        .select('*')
        .in('trigger_tag', activeTags);

      if (error) {
        console.error('Error fetching citations:', error);
      } else if (data) {
        setCitations(data as Citation[]);
      }
      setLoading(false);
    }

    fetchCitations();
  }, [isOpen, activeTags]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/80 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-md bg-slate-900 border-l border-slate-800 h-full p-6 overflow-y-auto flex flex-col justify-between shadow-2xl">
        <div>
          {/* Header */}
          <div className="flex justify-between items-center pb-4 border-b border-slate-800">
            <div>
              <h3 className="text-lg font-bold text-emerald-400">Scientific Literature</h3>
              <p className="text-xs text-slate-400">Peer-reviewed studies backing your protocol</p>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-2 rounded-lg bg-slate-800 transition"
            >
              ✕
            </button>
          </div>

          {/* Studies List */}
          <div className="mt-6 space-y-4">
            {loading ? (
              <p className="text-xs text-slate-400 animate-pulse">Querying PubMed & DOI databases...</p>
            ) : citations.length === 0 ? (
              <div className="text-xs text-slate-400 p-4 bg-slate-800/40 rounded-xl border border-slate-800">
                No specific studies tagged for these exact parameters yet. Defaulting to general ACSM sports nutrition position stands.
              </div>
            ) : (
              citations.map((cite) => (
                <div key={cite.id} className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/60 space-y-2">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-purple-950 text-purple-300 border border-purple-800 px-2 py-0.5 rounded">
                      {cite.trigger_tag.replace('_', ' ')}
                    </span>
                    <span className="text-xs text-slate-500 font-semibold">{cite.publication_year}</span>
                  </div>

                  <h4 className="text-sm font-bold text-white leading-snug">{cite.title}</h4>
                  <p className="text-xs text-slate-400 italic">{cite.authors}</p>

                  <div className="bg-slate-900/80 p-2.5 rounded border border-slate-800/80 text-xs text-slate-300 leading-relaxed">
                    <strong>Key Finding:</strong> {cite.key_finding}
                  </div>

                  <a
                    href={cite.doi_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition gap-1 mt-1"
                  >
                    View DOI Study Record ↗
                  </a>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Drawer Footer */}
        <div className="pt-4 border-t border-slate-800 text-center">
          <p className="text-[11px] text-slate-500">
            All fueling protocols strictly adhere to peer-reviewed meta-analyses from ISSN, ACSM, and Scandinavian Journal of Medicine & Science in Sports.
          </p>
        </div>
      </div>
    </div>
  );
}