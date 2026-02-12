"use client";

import React from 'react';

// Simpler interface that matches your existing implementation
interface SalesChartProps {
  months: string[]; // Month labels (e.g., ["Jan", "Feb", ...])
  totals: number[]; // Sales totals for each month
}

export default function SalesChart({
  months,
  totals,
}: SalesChartProps) {
  if (!months || !totals || months.length === 0 || totals.length === 0) {
    return (
      <div className="w-full h-56 flex items-center justify-center bg-gray-50 rounded-lg">
        <p className="text-gray-500">Loading chart...</p>
      </div>
    );
  }

  const width = 800;
  const height = 220;
  const padding = 32;
  const max = Math.max(...totals, 10);

  const points = totals.map((value, index) => {
    const x = padding + (index / (totals.length - 1)) * (width - padding * 2 || 0);
    const y = height - padding - (value / max) * (height - padding * 2);
    return `${x},${y}`;
  });

  const polyline = points.join(' ');

  return (
    <div className="w-full overflow-auto">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-56">
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((t, i) => (
          <g key={i}>
            <line
              x1={padding}
              x2={width - padding}
              y1={padding + t * (height - padding * 2)}
              y2={padding + t * (height - padding * 2)}
              stroke="#e6f4ef"
              strokeWidth="1"
            />
            <text
              x={padding - 8}
              y={padding + t * (height - padding * 2) + 4}
              fontSize="10"
              fill="#6b7280"
              textAnchor="end"
            >
              {Math.round((max * (1 - t)) / 1000)}k
            </text>
          </g>
        ))}

        {/* Line */}
        <polyline
          fill="none"
          stroke="#065f46"
          strokeWidth="3"
          strokeLinejoin="round"
          strokeLinecap="round"
          points={polyline}
        />

        {/* Area fill */}
        <polygon
          points={`${polyline} ${width - padding},${height - padding} ${padding},${height - padding}`}
          fill="rgba(4, 120, 87, 0.06)"
        />

        {/* Data points */}
        {points.map((point, i) => {
          const [x, y] = point.split(',').map(Number);
          return (
            <g key={i}>
              <circle 
                cx={x} 
                cy={y} 
                r="4" 
                fill="#065f46" 
                stroke="white" 
                strokeWidth="2" 
              />
            </g>
          );
        })}

        {/* X-axis labels */}
        {months.map((month, i) => {
          const x = padding + (i / (months.length - 1)) * (width - padding * 2 || 0);
          return (
            <text 
              key={i} 
              x={x} 
              y={height - 6} 
              fontSize="11" 
              fill="#065f46" 
              textAnchor="middle"
              fontWeight="500"
            >
              {month}
            </text>
          );
        })}
      </svg>
    </div>
  );
}