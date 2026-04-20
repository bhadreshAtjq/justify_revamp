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
};

export default function ActivityLog({ entries }: ActivityLogProps) {
  // Fix hydration mismatch by only rendering timestamps on client
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (entries.length === 0) {
    return (
      <div className="glass-card">
        <h3 style={{ marginBottom: 12 }}>Activity Log</h3>
        <p style={{ opacity: 0.5, fontSize: 13 }}>No recent activity to show</p>
      </div>
    );
  }

  return (
    <div className="glass-card">
      <h3 style={{ marginBottom: 24 }}>Session Activity</h3>
      <div className="noshadow-scroll" style={{ maxHeight: 300 }}>
        {entries.map((entry) => (
          <div key={entry.id} className="activity-entry animate-slide-up">
            <div className="activity-icon" style={{ borderRadius: 8 }}>
              {iconMap[entry.type]}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontWeight: 600, fontSize: 13 }}>{entry.message}</p>
              {mounted && (
                <p className="activity-time">
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
