
import React from 'react';
import { HistoryItem } from '../types';
import { getRelativeDay } from '../utils/time';

interface HistoryViewProps {
  history: HistoryItem[];
}

const HistoryView: React.FC<HistoryViewProps> = ({ history }) => {
  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-40 text-amber-900/20 text-center italic serif">
        <p className="text-2xl font-light">河流中尚未留下沉淀...</p>
      </div>
    );
  }

  const groups = history.reduce((acc, item) => {
    if (!acc[item.date]) acc[item.date] = [];
    acc[item.date].push(item);
    return acc;
  }, {} as Record<string, HistoryItem[]>);

  return (
    <div className="max-w-md mx-auto space-y-20 pb-32 px-8">
      {(Object.entries(groups) as [string, HistoryItem[]][]).map(([date, items]) => (
        <section key={date} className="relative">
          <div className="flex items-center gap-6 mb-12">
            <h3 className="text-[11px] tracking-[0.5em] uppercase font-black text-amber-900/30 whitespace-nowrap">
              {getRelativeDay(date)}
            </h3>
            <div className="h-[1px] flex-1 bg-gradient-to-r from-amber-900/10 to-transparent" />
          </div>
          <div className="space-y-14 pl-4 border-l-2 border-amber-900/5">
            {items.map((item) => (
              <div key={item.id} className="group relative">
                <div className="flex flex-col mb-3">
                    <span className="text-[10px] mono text-amber-900/30 tracking-widest uppercase mb-1">
                        {item.startTime} — {item.endTime}
                    </span>
                    <h4 className="text-3xl font-bold serif italic text-amber-950 group-hover:text-amber-600 transition-colors leading-tight">
                        {item.name}
                    </h4>
                </div>
                {item.note && (
                    <div className="relative">
                      <p className="text-base font-light text-amber-900/60 italic leading-relaxed pl-6">
                          “{item.note}”
                      </p>
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-200 rounded-full opacity-40" />
                    </div>
                )}
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
};

export default HistoryView;
