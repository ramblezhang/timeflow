
import React, { useState, useMemo } from 'react';
import { HistoryItem } from '../types';
import { getRelativeDay } from '../utils/time';

interface HistoryViewProps {
  history: HistoryItem[];
}

type StatMode = '日' | '周' | '月' | '年';

// Helpers
const parseTime = (timeStr: string): number => {
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
};

const getDuration = (start: string, end: string): number => {
    let s = parseTime(start);
    let e = parseTime(end);
    if (e < s) e += 24 * 60; // Handle midnight crossing
    return e - s;
};

// Colors
const LEGACY_COLOR_MAP: Record<string, string> = {
    'text-zinc-600': '#52525b',
    'text-amber-900': '#f59e0b',
    'text-indigo-900': '#4f46e5',
    'text-teal-900': '#0d9488',
    'text-rose-900': '#e11d48',
    'text-orange-900': '#ea580c',
};

// --- SVG Math Helpers for Smooth Area Chart ---

// Clamp helper to keep curves within chart bounds
const clamp = (val: number, min: number, max: number) => Math.max(min, Math.min(val, max));

const svgControlPoint = (current: number[], previous: number[], next: number[], reverse: boolean, yMin: number, yMax: number) => {
    const p = previous || current;
    const n = next || current;
    const smoothing = 0.2; // 0 to 1, curve smoothness
    const o = {
        x: p[0] - n[0],
        y: p[1] - n[1]
    };
    
    const x = current[0] + o.x * smoothing * (reverse ? 0.5 : -0.5);
    let y = current[1] + o.y * smoothing * (reverse ? 0.5 : -0.5);
    
    // CRITICAL FIX: Clamp the control point Y to prevent the curve from dipping below baseline or going above top
    y = clamp(y, yMin, yMax);

    return [x, y];
};

const svgBezierCommand = (point: number[], i: number, a: number[][], yMin: number, yMax: number) => {
    const [cpsX, cpsY] = svgControlPoint(a[i - 1], a[i - 2], point, false, yMin, yMax);
    const [cpeX, cpeY] = svgControlPoint(point, a[i - 1], a[i + 1], true, yMin, yMax);
    return `C ${cpsX.toFixed(1)},${cpsY.toFixed(1)} ${cpeX.toFixed(1)},${cpeY.toFixed(1)} ${point[0].toFixed(1)},${point[1].toFixed(1)}`;
};

const getSvgPath = (points: number[][], yMin: number, yMax: number) => {
    return points.reduce((acc, point, i, a) => {
        if (i === 0) return `M ${point[0].toFixed(1)},${point[1].toFixed(1)}`;
        return `${acc} ${svgBezierCommand(point, i, a, yMin, yMax)}`;
    }, '');
};

const HistoryView: React.FC<HistoryViewProps> = ({ history }) => {
  const [showStats, setShowStats] = useState(false);
  const [mode, setMode] = useState<StatMode>('日');
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  // --- Statistics Computation ---
  const chartData = useMemo(() => {
    const today = new Date();
    // Reset time part for cleaner daily comparison
    today.setHours(0,0,0,0);

    const buckets: { label: string; dateKey: string; items: HistoryItem[] }[] = [];
    
    // 1. Generate Buckets (Time Axis)
    if (mode === '日') {
        for (let i = 6; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(today.getDate() - i);
            const dateKey = d.toLocaleDateString('zh-CN');
            // Simplified label
            const dayName = i === 0 ? '今天' : `${d.getMonth() + 1}/${d.getDate()}`;
            buckets.push({ label: dayName, dateKey, items: [] });
        }
    } else if (mode === '周') {
        for (let i = 11; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(today.getDate() - (i * 7));
            const day = d.getDay() || 7; 
            if(day !== 1) d.setHours(-24 * (day - 1)); // Go to Monday
            
            const endOfWeek = new Date(d);
            endOfWeek.setDate(d.getDate() + 6);
            
            const label = `${d.getMonth()+1}/${d.getDate()}`;
            // Store timestamps for range matching
            const rangeKey = `${d.getTime()}-${endOfWeek.getTime()}`;
            buckets.push({ label, dateKey: rangeKey, items: [] });
        }
    } else if (mode === '月') {
        for (let i = 11; i >= 0; i--) {
            const d = new Date(today);
            d.setMonth(today.getMonth() - i);
            d.setDate(1); // First day of month
            const label = `${d.getMonth()+1}月`;
            const dateKey = `${d.getFullYear()}-${d.getMonth()}`;
            buckets.push({ label, dateKey, items: [] });
        }
    } else if (mode === '年') {
        for (let i = 2; i >= 0; i--) {
            const d = new Date(today);
            d.setFullYear(today.getFullYear() - i);
            const label = `${d.getFullYear()}`;
            const dateKey = `${d.getFullYear()}`;
            buckets.push({ label, dateKey, items: [] });
        }
    }

    // 2. Distribute History Items into Buckets
    // Also identify all unique categories (presets) present in this range
    const categorySet = new Set<string>();
    const colorMap: Record<string, string> = {};

    history.forEach(item => {
        const itemDate = new Date(item.date);
        let targetBucket = null;

        if (mode === '日') {
            const k = itemDate.toLocaleDateString('zh-CN');
            targetBucket = buckets.find(b => b.dateKey === k);
        } else if (mode === '周') {
            const time = itemDate.getTime();
            targetBucket = buckets.find(b => {
                const [start, end] = b.dateKey.split('-').map(Number);
                return time >= start && time <= end + 86400000;
            });
        } else if (mode === '月') {
            const k = `${itemDate.getFullYear()}-${itemDate.getMonth()}`;
            targetBucket = buckets.find(b => b.dateKey === k);
        } else if (mode === '年') {
            const k = `${itemDate.getFullYear()}`;
            targetBucket = buckets.find(b => b.dateKey === k);
        }

        if (targetBucket) {
            targetBucket.items.push(item);
            categorySet.add(item.name);
            if (!colorMap[item.name]) {
                colorMap[item.name] = item.accent || LEGACY_COLOR_MAP[item.color] || '#a1a1aa';
            }
        }
    });

    const categories = Array.from(categorySet);

    // 3. Calculate Stacked Coordinates for SVG
    // We need for each bucket: x coordinate.
    // For each bucket & category: yBottom, yTop.
    
    // Normalize Data
    const chartWidth = 1000;
    const chartHeight = 300;
    const paddingX = 40;
    const paddingY = 20;
    const drawableWidth = chartWidth - paddingX * 2;
    const drawableHeight = chartHeight - paddingY * 2;

    // Boundaries for clamping (SVG Coords)
    // Top of chart is paddingY (y=20), Bottom is paddingY + drawableHeight (y=280)
    const yMinBound = paddingY;
    const yMaxBound = paddingY + drawableHeight;

    // Calculate totals per bucket to normalize Y axis (Percentage view or Absolute view?)
    // "占比" suggests Percentage (100% Stacked) OR just visual comparison.
    // Usually Absolute Stacked Area is better to show "Total Volume" changes + "Ratio" changes.
    // Let's do Absolute Stacked.

    const bucketTotals = buckets.map(b => 
        b.items.reduce((sum, item) => sum + getDuration(item.startTime, item.endTime), 0)
    );
    const maxTotal = Math.max(...bucketTotals, 60); // Min 60 mins to prevent flatline

    const stackedData = buckets.map((bucket, i) => {
        const x = paddingX + (i / (buckets.length - 1)) * drawableWidth;
        
        let currentY = 0; // Start from bottom (0 duration)
        
        // Group item durations by category for this bucket
        const catDurations: Record<string, number> = {};
        categories.forEach(c => catDurations[c] = 0);
        bucket.items.forEach(item => {
            catDurations[item.name] += getDuration(item.startTime, item.endTime);
        });

        // Stack them
        const stackPoints = categories.map(cat => {
            const val = catDurations[cat];
            const yBottomVal = currentY;
            const yTopVal = currentY + val;
            currentY += val;

            // Invert Y for SVG (0 is top)
            // Map value 0..maxTotal to drawableHeight..0
            const yBottom = paddingY + drawableHeight - (yBottomVal / maxTotal * drawableHeight);
            const yTop = paddingY + drawableHeight - (yTopVal / maxTotal * drawableHeight);

            return {
                name: cat,
                yBottom,
                yTop,
                value: val
            };
        });

        return { x, label: bucket.label, stackPoints };
    });

    // 4. Generate Paths per Category
    const paths = categories.map((cat, catIndex) => {
        // Collect points for Top line and Bottom line
        const topPoints: number[][] = [];
        const bottomPoints: number[][] = [];

        stackedData.forEach(d => {
            const p = d.stackPoints.find(sp => sp.name === cat)!;
            topPoints.push([d.x, p.yTop]);
            bottomPoints.push([d.x, p.yBottom]);
        });

        // Area path: Top curve L-to-R, then Line down, then Bottom curve R-to-L, then Line up
        const topPath = getSvgPath(topPoints, yMinBound, yMaxBound);
        // We also clamp reverse path just in case
        const bottomPathReversed = getSvgPath([...bottomPoints].reverse(), yMinBound, yMaxBound); 

        // Full closed shape
        // We need to explicitly handle the lines connecting the ends
        const lastTop = topPoints[topPoints.length - 1];
        const lastBottom = bottomPoints[bottomPoints.length - 1];
        // const firstBottom = bottomPoints[0];

        const d = `
            ${topPath}
            L ${lastBottom[0].toFixed(1)},${lastBottom[1].toFixed(1)}
            ${bottomPathReversed.replace('M', 'L')} 
            L ${topPoints[0][0].toFixed(1)},${topPoints[0][1].toFixed(1)}
            Z
        `;

        return {
            name: cat,
            color: colorMap[cat],
            d
        };
    });

    return {
        buckets: stackedData, // For X-axis labels and tooltips
        paths, // For SVG paths
        chartWidth,
        chartHeight
    };

  }, [history, mode]);

  // --- List Grouping (Legacy View) ---
  const groups = history.reduce((acc, item) => {
    if (!acc[item.date]) acc[item.date] = [];
    acc[item.date].push(item);
    return acc;
  }, {} as Record<string, HistoryItem[]>);

  return (
    <div className="max-w-md mx-auto space-y-8 pb-32 px-8">
      
      {/* Header & Toggle */}
      <div className="flex justify-between items-end mb-6">
        <h2 className="text-[10px] uppercase tracking-[0.25em] text-zinc-400 dark:text-zinc-500 font-bold">
            {showStats ? '趋势洞察' : '时间长河'}
        </h2>
        <button 
            onClick={() => setShowStats(!showStats)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all ${showStats ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 border-transparent shadow-lg' : 'bg-transparent border-zinc-200 dark:border-white/10 text-zinc-500 hover:text-zinc-900 dark:hover:text-white'}`}
        >
            <span className="text-[10px] font-bold tracking-widest uppercase">
                {showStats ? '收起图表' : '统计趋势'}
            </span>
            {showStats ? (
                <svg width="12" height="12" viewBox="0 0 15 15" fill="none" stroke="currentColor"><path d="M4 9l3.5-3.5L11 9" strokeLinecap="round" strokeLinejoin="round"/></svg>
            ) : (
                <svg width="12" height="12" viewBox="0 0 15 15" fill="none" stroke="currentColor"><path d="M13.5 13.5V1.5M10.5 10.5L7.5 7.5L4.5 10.5M10.5 4.5H1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            )}
        </button>
      </div>

      {/* --- Statistics Panel (Expandable) --- */}
      {showStats && (
        <div className="animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="card-themed rounded-[2.5rem] p-6 shadow-xl relative overflow-hidden">
                
                {/* Time Range Switcher */}
                <div className="flex justify-center mb-8 relative z-10">
                    <div className="flex bg-zinc-100 dark:bg-white/10 p-1 rounded-2xl">
                        {(['日', '周', '月', '年'] as StatMode[]).map((m) => (
                            <button
                                key={m}
                                onClick={() => setMode(m)}
                                className={`px-5 py-1.5 rounded-xl text-[10px] font-bold transition-all duration-300 ${mode === m ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm' : 'text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300'}`}
                            >
                                {m}
                            </button>
                        ))}
                    </div>
                </div>

                {/* SVG Area Chart */}
                <div className="w-full aspect-[16/9] landscape:aspect-[21/9] relative mb-4">
                    {history.length === 0 ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center opacity-40">
                             <span className="text-[10px] serif italic">积累更多时间以解锁趋势</span>
                        </div>
                    ) : (
                        <svg 
                            viewBox={`0 0 ${chartData.chartWidth} ${chartData.chartHeight}`} 
                            preserveAspectRatio="none"
                            className="w-full h-full overflow-visible"
                        >
                            <defs>
                                <linearGradient id="grid-fade" x1="0" x2="0" y1="0" y2="1">
                                    <stop offset="0%" stopColor="currentColor" stopOpacity="0.1"/>
                                    <stop offset="100%" stopColor="currentColor" stopOpacity="0"/>
                                </linearGradient>
                            </defs>

                            {/* Paths (Stacked Areas) */}
                            {chartData.paths.map((p, i) => (
                                <path 
                                    key={i}
                                    d={p.d}
                                    fill={p.color}
                                    stroke={p.color}
                                    strokeWidth="2"
                                    className={`transition-all duration-300 cursor-pointer hover:brightness-110 ${hoveredCategory && hoveredCategory !== p.name ? 'opacity-20 saturate-0' : 'opacity-90'}`}
                                    onMouseEnter={() => setHoveredCategory(p.name)}
                                    onMouseLeave={() => setHoveredCategory(null)}
                                />
                            ))}

                            {/* X Axis Labels */}
                            {chartData.buckets.map((b, i) => (
                                <g key={i} transform={`translate(${b.x}, ${chartData.chartHeight - 5})`}>
                                    <text 
                                        textAnchor="middle" 
                                        className="text-[10px] sm:text-[12px] fill-zinc-400 dark:fill-zinc-500 font-mono tracking-tighter"
                                    >
                                        {b.label}
                                    </text>
                                </g>
                            ))}
                        </svg>
                    )}
                </div>

                {/* Interactive Legend - Grid Layout for Multi-row support */}
                {history.length > 0 && (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mt-6">
                        {/* FIX: Use spread operator [...] to create a shallow copy before reversing to avoid mutating the original array */}
                        {[...chartData.paths].reverse().map(p => (
                            <button 
                                key={p.name}
                                onMouseEnter={() => setHoveredCategory(p.name)}
                                onMouseLeave={() => setHoveredCategory(null)}
                                className={`flex items-center gap-1.5 transition-all duration-300 overflow-hidden ${hoveredCategory && hoveredCategory !== p.name ? 'opacity-30' : 'opacity-100'}`}
                            >
                                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: p.color }}></span>
                                <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 truncate text-left">{p.name}</span>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
      )}

      {/* --- Legacy List View (Always Present) --- */}
      {history.length > 0 && (
          <div className="space-y-16 animate-in fade-in delay-200">
            {(Object.entries(groups) as [string, HistoryItem[]][]).map(([date, items]) => (
                <section key={date} className="relative">
                <div className="flex items-center gap-6 mb-12">
                    <h3 className="text-[11px] tracking-[0.5em] uppercase font-black text-amber-900/30 dark:text-zinc-500/30 whitespace-nowrap">
                    {getRelativeDay(date)}
                    </h3>
                    <div className="h-[1px] flex-1 bg-gradient-to-r from-amber-900/10 dark:from-white/10 to-transparent" />
                </div>
                <div className="space-y-10 pl-4 border-l-2 border-amber-900/5 dark:border-white/5">
                    {items.map((item) => (
                    <div key={item.id} className="group relative">
                        <div className="flex flex-col mb-2">
                            <span className="text-[10px] mono text-amber-900/30 dark:text-zinc-500 tracking-widest uppercase mb-1">
                                {item.startTime} — {item.endTime}
                            </span>
                            <div className="flex items-center gap-3">
                                <h4 className="text-xl font-bold serif italic text-amber-950 dark:text-zinc-200 group-hover:text-amber-600 dark:group-hover:text-zinc-50 transition-colors leading-tight">
                                    {item.name}
                                </h4>
                                <div 
                                    className="w-1.5 h-1.5 rounded-full opacity-40" 
                                    style={{ backgroundColor: item.accent || LEGACY_COLOR_MAP[item.color] || '#ccc' }} 
                                />
                            </div>
                        </div>
                        {item.note && (
                            <p className="text-sm font-light text-amber-900/60 dark:text-zinc-400 italic leading-relaxed pl-1">
                                “{item.note}”
                            </p>
                        )}
                    </div>
                    ))}
                </div>
                </section>
            ))}
            </div>
      )}
    </div>
  );
};

export default HistoryView;
