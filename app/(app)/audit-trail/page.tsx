"use client";

import AuditLogSection from "@/components/AuditLogSection";

export default function AuditTrailPage() {
  return (
    <div className="dash-wrapper animate-slide-up">
      <header className="dash-header">
        <div className="dash-header-title">
          <div className="dash-meta">SECURITY & COMPLIANCE</div>
          <h1>Audit Trail</h1>
          <p>Immutable log of all system activities and blockchain transactions.</p>
        </div>
      </header>
      
      <div className="dash-grid">
        <div className="dash-main-col" style={{ gridColumn: 'span 12' }}>
          <AuditLogSection />
        </div>
      </div>
    
      <style jsx>{`
        .dash-wrapper {
          padding-bottom: 60px;
        }

        /* HEADER */
        .dash-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 40px;
        }
        .dash-meta {
          font-size: 12px;
          font-weight: 700;
          color: #607D8B;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin-bottom: 8px;
        }
        .dash-header-title h1 {
          font-size: 32px;
          font-weight: 800;
          color: #263238;
          letter-spacing: -0.03em;
          margin-bottom: 8px;
        }
        .dash-header-title p {
          font-size: 15px;
          color: #607D8B;
        }

        /* TABS (Segmented Control) */
        .dash-tabs-bg {
          display: flex;
          position: relative;
          background: #F1F5F9;
          border-radius: 12px;
          padding: 4px;
          border: 1px solid #E2E8F0;
        }
        .dash-tabs-slider {
          position: absolute;
          width: calc(25% - 2px);
          height: calc(100% - 8px);
          background: #FFFFFF;
          border: 1px solid rgba(15, 23, 42, 0.04);
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(15, 23, 42, 0.05);
          transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .dash-tabs-slider.doc-slider {
          width: calc(33.333% - 2.66px);
        }
        .dash-tab {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 10px 16px;
          border: none;
          background: transparent;
          font-size: 13px;
          font-weight: 600;
          color: #607D8B;
          cursor: pointer;
          position: relative;
          z-index: 10;
          font-family: inherit;
          transition: color 0.2s;
        }
        .dash-tab.doc-tab {
          text-transform: capitalize;
        }
        .dash-tab.active {
          color: #000000;
        }
        .dash-tab svg {
          font-size: 12px;
        }

        /* ALERTS */
        .dash-alert {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px 20px;
          border-radius: 12px;
          margin-bottom: 32px;
          font-size: 14px;
          font-weight: 500;
        }
        .dash-alert-error {
          background: #FEF2F2;
          border: 1px solid #FEE2E2;
          color: #B91C1C;
        }
        .dash-alert-icon {
          flex-shrink: 0;
          font-size: 16px;
        }
        .dash-alert-close {
          margin-left: auto;
          background: none;
          border: none;
          color: inherit;
          opacity: 0.5;
          cursor: pointer;
          font-size: 20px;
          padding: 0 8px;
          transition: opacity 0.2s;
        }
        .dash-alert-close:hover { opacity: 1; }

        /* GRID LAYOUT */
        .dash-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.6fr) minmax(0, 1fr);
          gap: 32px;
          align-items: start;
        }
        @media (max-width: 1024px) {
          .dash-grid {
            grid-template-columns: 1fr;
          }
        }
        .dash-main-col {
          display: flex;
          flex-direction: column;
          gap: 40px;
        }

        /* CARDS */
        .dash-card {
          background: #FFFFFF;
          border: 1px solid #E2E8F0;
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px -1px rgba(0, 0, 0, 0.02);
        }
        .dash-card.p-0 { padding: 0; }
        .dash-card.overflow-hidden { overflow: hidden; }
        
        .dash-card-title {
          font-size: 15px;
          font-weight: 700;
          color: #000000;
          margin-bottom: 20px;
        }

        /* SECTION HEADERS */
        .dash-section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }
        .dash-section-header h2 {
          font-size: 12px;
          font-weight: 700;
          color: #000000;
          letter-spacing: 0.05em;
        }
        .dash-section-header h2 span {
          color: #94A3B8;
        }
        .dash-download-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          background: none;
          border: none;
          color: #607D8B;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.05em;
          cursor: pointer;
          transition: color 0.2s;
        }
        .dash-download-btn:hover { color: #000000; }

        /* FORMS & INPUTS */
        .dash-form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }
        .dash-field label {
          display: block;
          font-size: 11px;
          font-weight: 700;
          color: #607D8B;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 8px;
        }
        .dash-input {
          width: 100%;
          padding: 12px 16px;
          background: #F4FAFA;
          border: 1px solid #E2E8F0;
          border-radius: 10px;
          font-size: 14px;
          color: #000000;
          font-family: inherit;
          transition: all 0.2s;
          outline: none;
        }
        .dash-input:focus {
          border-color: #000000;
          background: #FFFFFF;
          box-shadow: 0 0 0 3px rgba(211, 255, 233, 0.1);
        }

        /* BUTTONS */
        .dash-btn-primary {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 14px 24px;
          background: #D3FFE9;
          border: 1px solid #D3FFE9;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 600;
          color: #000000;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 4px 12px rgba(211, 255, 233, 0.2);
        }
        .dash-btn-primary:hover:not(:disabled) {
          background: linear-gradient(135deg, #D3FFE9, #D3FFE9);
          border-color: #000000;
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(211, 255, 233, 0.3);
        }
        .dash-btn-primary:active:not(:disabled) {
          transform: translateY(1px);
        }
        .dash-btn-primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .full-width { width: 100%; }
        .mt-6 { margin-top: 24px; }
        .mt-8 { margin-top: 32px; }

        /* STATUS LIST */
        .status-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .status-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .status-label {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 14px;
          font-weight: 500;
          color: #334155;
        }
        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }
        .status-dot.green { background: #D3FFE9; }
        .status-badge {
          font-size: 11px;
          font-weight: 700;
          padding: 4px 10px;
          border-radius: 20px;
          letter-spacing: 0.05em;
        }
        .status-badge.green {
          background: #D1FAE5;
          color: #000000;
        }

        /* CUSTOM DROPDOWN */
        .dash-dropdown-container {
          position: relative;
        }
        .dash-dropdown-trigger {
          display: flex;
          justify-content: space-between;
          align-items: center;
          cursor: pointer;
        }
        .dropdown-icon {
          color: #94A3B8;
          transition: transform 0.2s;
        }
        .dropdown-icon.open {
          transform: rotate(45deg);
        }
        .dash-dropdown-menu {
          position: absolute;
          top: calc(100% + 8px);
          left: 0;
          width: 100%;
          background: #FFFFFF;
          border: 1px solid #E2E8F0;
          border-radius: 12px;
          box-shadow: 0 10px 25px rgba(15, 23, 42, 0.1);
          z-index: 100;
          padding: 8px;
        }
        .dash-search-wrap {
          position: relative;
          margin-bottom: 8px;
        }
        .search-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #94A3B8;
          font-size: 12px;
        }
        .search-input {
          padding-left: 32px;
          padding-top: 10px;
          padding-bottom: 10px;
          border-radius: 8px;
        }
        .dash-dropdown-list {
          max-height: 240px;
          overflow-y: auto;
        }
        .dropdown-item {
          padding: 10px 12px;
          border-radius: 8px;
          cursor: pointer;
          transition: background 0.15s;
        }
        .dropdown-item:hover { background: #F4FAFA; }
        .dropdown-item.selected { background: #EFF6FF; }
        .inst-name {
          font-size: 14px;
          font-weight: 600;
          color: #000000;
          margin-bottom: 2px;
        }
        .inst-slug {
          font-size: 11px;
          color: #607D8B;
        }
        .empty-state {
          padding: 16px;
          text-align: center;
          font-size: 13px;
          color: #607D8B;
        }

        /* SYNC CARD */
        .sync-card {
          background: #D3FFE9;
          color: #000000;
          border: none;
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .sync-icon {
          font-size: 20px;
          color: #3B82F6;
        }
        .sync-title {
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.05em;
          margin-bottom: 2px;
        }
        .sync-desc {
          font-size: 13px;
          color: #94A3B8;
        }
      `}</style>
    </div>
  );
}
