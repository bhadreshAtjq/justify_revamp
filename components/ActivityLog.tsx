"use client";

import { useEffect, useState } from "react";
import {
  FaFileUpload,
  FaCheckCircle,
  FaLink,
  FaSearch,
  FaHashtag,
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
};

export default function ActivityLog({ entries }: ActivityLogProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (entries.length === 0) {
    return (
      <div className="glass-card">
        <h3 style={{ marginBottom: 10, fontSize: 14, fontWeight: 700 }}>Activity Log</h3>
        <p style={{ color: '#929AAB', fontSize: 13 }}>No recent activity to show</p>
      </div>
    );
  }

  return (
    <div className="glass-card">
      <h3 style={{ marginBottom: 16, fontSize: 14, fontWeight: 700 }}>Session Activity</h3>
      <div className="noshadow-scroll" style={{ maxHeight: 300 }}>
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
