"use client";

import { useEffect, useState } from "react";
import {
  FaFileUpload,
  FaCheckCircle,
  FaLink,
  FaSearch,
  FaHashtag,
  FaPlay,
  FaExclamationCircle,
} from "react-icons/fa";
import type { ActivityLogEntry } from "@/store/useAppStore";

interface ActivityLogProps {
  entries: ActivityLogEntry[];
}

const iconMap: Record<ActivityLogEntry["type"], React.ReactNode> = {
  csv_uploaded: <FaFileUpload />,
  hashes_generated: <FaHashtag />,
  root_generated: <FaCheckCircle />,
  anchored: <FaLink />,
  ocr_complete: <FaSearch />,
  verified: <FaCheckCircle />,
  quality_validated: <FaCheckCircle />,
  bulk_ocr_started: <FaPlay />,
  bulk_ocr_finished: <FaCheckCircle />,
  bulk_ocr_error: <FaExclamationCircle />,
  anchoring_started: <FaLink />,
  anchor_error: <FaExclamationCircle />,
};

export default function ActivityLog({ entries }: ActivityLogProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (entries.length === 0) {
    return (
      <div style={{ background: '#FFFFFF', borderRadius: 12, border: '1px solid #D3FFE9', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #F1F5F9', background: '#F4FAFA' }}>
          <h3 style={{ margin: 0, fontSize: 12, fontWeight: 700, color: '#607D8B', textTransform: 'uppercase', letterSpacing: '1px' }}>Activity Log</h3>
        </div>
        <div style={{ padding: '20px' }}>
          <p style={{ color: '#929AAB', fontSize: 13, margin: 0 }}>No recent activity to show</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: '#FFFFFF', borderRadius: 12, border: '1px solid #D3FFE9', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
      <div style={{ padding: '16px 20px', borderBottom: '1px solid #F1F5F9', background: '#F4FAFA' }}>
        <h3 style={{ margin: 0, fontSize: 12, fontWeight: 700, color: '#607D8B', textTransform: 'uppercase', letterSpacing: '1px' }}>Session Activity</h3>
      </div>
      <div className="noshadow-scroll" style={{ maxHeight: 300, padding: '20px' }}>
        {entries.map((entry) => (
          <div key={entry.id} className="activity-entry animate-slide-up">
            <div className="activity-icon">
              {iconMap[entry.type]}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontWeight: 500, fontSize: 13, color: '#222831', margin: 0 }}>{entry.message}</p>
              {mounted && (
                <p className="activity-time" style={{ margin: 0 }}>
                  {entry.timestamp.toLocaleTimeString()}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
