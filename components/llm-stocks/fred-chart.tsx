'use client';

import { useState, useRef, useEffect } from 'react';
import { scaleLinear, scaleTime } from 'd3-scale';
import { format, parse } from 'date-fns';
import { useResizeObserver } from 'usehooks-ts';
import { IconArrowUp, IconArrowDown } from '@/components/ui/icons';

interface FredData {
  realtime_start: string;
  realtime_end: string;
  date: string;
  value: string;
}

interface FredChartProps {
  data: FredData[];
  indicator: string;
}

export function FredChart({ data, indicator }: FredChartProps) {
  const [tooltipData, setTooltipData] = useState<{
    date: string;
    value: number;
    x: number;
  } | null>(null);

  const [startHighlight, setStartHighlight] = useState<number | null>(null);
  const [endHighlight, setEndHighlight] = useState<number | null>(null);

  const chartRef = useRef<HTMLDivElement>(null);
  const { width = 0 } = useResizeObserver({
    ref: chartRef,
    box: 'border-box',
  });

  const xScale = scaleTime()
    .domain([parse(data[0].date, 'yyyy-MM-dd', new Date()), parse(data[data.length - 1].date, 'yyyy-MM-dd', new Date())])
    .range([0, width]);

  const yScale = scaleLinear()
    .domain([
      Math.min(...data.map(d => Number(d.value))),
      Math.max(...data.map(d => Number(d.value))),
    ])
    .range([150, 0]);

  const currentValue = Number(data[data.length - 1].value);
  const previousValue = data.length > 1 ? Number(data[data.length - 2].value) : currentValue;
  const percentChange = ((currentValue - previousValue) / previousValue) * 100;
  const isPositiveChange = percentChange >= 0;

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (chartRef.current) {
      const { clientX } = event;
      const { left } = chartRef.current.getBoundingClientRect();

      const x = clientX - left;
      const date = xScale.invert(x);
      const closestIndex = data.reduce((closestIndex, d, i) => {
        const currentDate = parse(d.date, 'yyyy-MM-dd', new Date());
        const closestDate = parse(data[closestIndex].date, 'yyyy-MM-dd', new Date());
        return Math.abs(currentDate.getTime() - date.getTime()) < Math.abs(closestDate.getTime() - date.getTime())
          ? i
          : closestIndex;
      }, 0);

      setTooltipData({
        date: data[closestIndex].date,
        value: Number(data[closestIndex].value),
        x,
      });
    }
  };

  const handlePointerLeave = () => {
    setTooltipData(null);
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (chartRef.current) {
      const { clientX } = event;
      const { left } = chartRef.current.getBoundingClientRect();

      setStartHighlight(clientX - left);
      setEndHighlight(null);
    }
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    if (chartRef.current) {
      const { clientX } = event;
      const { left } = chartRef.current.getBoundingClientRect();

      setEndHighlight(clientX - left);
    }
  };

  return (
    <div className="relative p-4 text-white border rounded-xl bg-[#f3f6f4]">
      <div className="flex items-center justify-between">
        <div className="text-lg text-white">{indicator}</div>
        <div className="flex items-center gap-2">
          <div className="text-lg font-bold tabular-nums">{currentValue.toFixed(2)}</div>
          <div className={`flex items-center text-sm ${isPositiveChange ? 'text-green-500' : 'text-red-500'}`}>
            {isPositiveChange ? <IconArrowUp className="w-4 h-4" /> : <IconArrowDown className="w-4 h-4" />}
            {Math.abs(percentChange).toFixed(2)}%
          </div>
        </div>
      </div>
      <div className="mt-1 text-xs text-gray-400">
        {format(parse(data[0].date, 'yyyy-MM-dd', new Date()), 'MMM d, yyyy')} - {format(parse(data[data.length - 1].date, 'yyyy-MM-dd', new Date()), 'MMM d, yyyy')}
      </div>
      <div
        className="relative -mx-4 cursor-crosshair"
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        ref={chartRef}
      >
        {tooltipData && (
          <div
            className="absolute z-10 flex gap-2 p-2 bg-[#2B2464] rounded-md pointer-events-none select-none w-fit"
            style={{
              left: tooltipData.x,
              top: 30,
              transform: 'translateX(-50%)',
            }}
          >
            <div className="text-xs tabular-nums">
              {tooltipData.value.toFixed(2)}
            </div>
            <div className="text-xs text-gray-400 tabular-nums">
              {format(parse(tooltipData.date, 'yyyy-MM-dd', new Date()), 'MMM d, yyyy')}
            </div>
          </div>
        )}
        {startHighlight !== null && (
          <div
            className="absolute w-5 h-32 border border-white rounded-md pointer-events-none select-none bg-white/20"
            style={{
              left: startHighlight,
              width: endHighlight
                ? endHighlight - startHighlight
                : tooltipData?.x
                ? tooltipData.x - startHighlight
                : 0,
              bottom: 0,
            }}
          />
        )}
        <svg viewBox={`0 0 ${width} 150`} width="100%" height="150">
          <path
            d={`M ${data
              .map(
                (d, i) => `${xScale(parse(d.date, 'yyyy-MM-dd', new Date()))} ${yScale(Number(d.value))}`,
              )
              .join(' L ')}`}
            fill="none"
            stroke="#311e46"
            strokeWidth={2}
            pointerEvents="none"
          />
        </svg>
      </div>
    </div>
  );
}