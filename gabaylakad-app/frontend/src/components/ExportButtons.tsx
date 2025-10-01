import React from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ActivityLogItem {
  title: string;
  details: string;
  time: string;
  icon: string;
  color: string;
}

interface ExportProps {
  activityLog: ActivityLogItem[];
}

// Export activity log as CSV
export const exportCSV = (activityLog: ActivityLogItem[]) => {
  const csvRows = [
    ['Title', 'Details', 'Time'],
    ...activityLog.map(item => [item.title, item.details, item.time]),
  ];
  const csvContent = csvRows.map(row => row.join(',')).join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'activity-log.csv';
  a.click();
  window.URL.revokeObjectURL(url);
};

// Export activity log as PDF
export const exportPDF = (activityLog: ActivityLogItem[]) => {
  const doc = new jsPDF();
  doc.text('Activity Log', 14, 16);
  autoTable(doc, {
    head: [['Title', 'Details', 'Time']],
    body: activityLog.map(item => [item.title, item.details, item.time]),
    startY: 24,
  });
  doc.save('activity-log.pdf');
};

const ExportButtons: React.FC<ExportProps> = ({ activityLog }) => (
  <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
    <button className="btn-primary" onClick={() => exportCSV(activityLog)}>
      <i className="fas fa-file-csv"></i> Export CSV
    </button>
    <button className="btn-primary" onClick={() => exportPDF(activityLog)}>
      <i className="fas fa-file-pdf"></i> Export PDF
    </button>
  </div>
);

export default ExportButtons;
