import { useState, useRef, MouseEvent, TouchEvent } from 'react';
import { FOREST_WAYPOINTS, WaypointNode } from '../data/portfolioData';

interface ScrollTimelineScrubberProps {
  progressPercent: number;
  activeWaypoint: WaypointNode;
  onScrubToPercent: (percent: number) => void;
  onTeleportToWaypoint: (wp: WaypointNode) => void;
}

export default function ScrollTimelineScrubber({
  progressPercent,
  activeWaypoint,
  onScrubToPercent,
  onTeleportToWaypoint
}: ScrollTimelineScrubberProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [hoveredWp, setHoveredWp] = useState<WaypointNode | null>(null);

  const calculatePercentFromEvent = (clientX: number) => {
    if (!trackRef.current) return 0;
    const rect = trackRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    return Math.round((x / rect.width) * 100);
  };

  const handleMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    const pct = calculatePercentFromEvent(e.clientX);
    onScrubToPercent(pct);
  };

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const pct = calculatePercentFromEvent(e.clientX);
    onScrubToPercent(pct);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    setIsDragging(true);
    if (e.touches[0]) {
      const pct = calculatePercentFromEvent(e.touches[0].clientX);
      onScrubToPercent(pct);
    }
  };

  const handleTouchMove = (e: TouchEvent<HTMLDivElement>) => {
    if (!isDragging || !e.touches[0]) return;
    const pct = calculatePercentFromEvent(e.touches[0].clientX);
    onScrubToPercent(pct);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Convert waypoint zPosition into scrubber percent
  // Waypoint Z ranges from 14 (0%) to -206 (100%), total distance ~220
  const getWaypointPercent = (wp: WaypointNode) => {
    return Math.max(0, Math.min(100, Math.round(((14 - wp.zPosition) / 220) * 100)));
  };

  return (
    <div className="w-full select-none">
      <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400 mb-1.5 px-1">
        <span className="flex items-center gap-1.5 text-emerald-300">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>Scrolltide 3D Path Timeline</span>
        </span>
        <span className="text-white/80">
          {progressPercent}% &bull; {activeWaypoint.title.replace(/^The\s+/i, '')}
        </span>
      </div>

      {/* Scrub Track */}
      <div
        ref={trackRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="group relative h-4 flex items-center cursor-pointer"
      >
        {/* Background Rail */}
        <div className="relative w-full h-1.5 bg-white/10 group-hover:h-2 rounded-full overflow-hidden transition-all duration-200">
          {/* Active Fill Bar */}
          <div
            className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-300 rounded-full transition-all duration-75"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Milestone Notches for Shrines */}
        {FOREST_WAYPOINTS.map((wp) => {
          const wpPct = getWaypointPercent(wp);
          const isCurrent = wp.id === activeWaypoint.id;

          return (
            <div
              key={wp.id}
              onClick={(e) => {
                e.stopPropagation();
                onTeleportToWaypoint(wp);
              }}
              onMouseEnter={() => setHoveredWp(wp)}
              onMouseLeave={() => setHoveredWp(null)}
              className="absolute -translate-x-1/2 flex flex-col items-center cursor-pointer py-2"
              style={{ left: `${wpPct}%` }}
            >
              <div
                className={`w-2.5 h-2.5 rounded-full transition-all duration-200 ${
                  isCurrent
                    ? 'bg-emerald-400 scale-150 ring-4 ring-emerald-400/25'
                    : 'bg-neutral-500 hover:bg-emerald-300 hover:scale-125'
                }`}
              />

              {/* Tooltip on hover */}
              {hoveredWp?.id === wp.id && (
                <div className="absolute bottom-6 px-2.5 py-1 rounded-lg bg-[#07181d] border border-emerald-400/40 text-[10px] font-mono text-emerald-200 whitespace-nowrap shadow-xl pointer-events-none z-30">
                  {wp.number} &bull; {wp.title}
                </div>
              )}
            </div>
          );
        })}

        {/* Glowing Scrubber Head */}
        <div
          className="absolute -translate-x-1/2 w-4 h-4 rounded-full bg-white border-2 border-emerald-400 shadow-lg shadow-emerald-400/50 pointer-events-none transition-transform group-hover:scale-125"
          style={{ left: `${progressPercent}%` }}
        />
      </div>
    </div>
  );
}
