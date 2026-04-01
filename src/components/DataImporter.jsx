import React from 'react';
import * as xlsx from 'xlsx';
import { Database, FileSpreadsheet, Trash2, CheckCircle2 } from 'lucide-react';

export default function DataImporter({ importedData, setImportedData }) {
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const arrayBuffer = event.target.result;
      const workbook = xlsx.read(arrayBuffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      let jsonData = xlsx.utils.sheet_to_json(worksheet);

      jsonData = jsonData.map(row => {
        const normalized = {};
        Object.keys(row).forEach(key => {
          normalized[key.toLowerCase().trim().replace(/\s+/g, '_')] = row[key];
        });
        return normalized;
      });

      setImportedData(jsonData);
    };
    reader.readAsArrayBuffer(file);
  };

  const clearData = () => {
    setImportedData([]);
  };

  return (
    <div className="data-grid-pane">
      <div className="data-grid-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
           <div className="data-grid-icon">
             <Database size={24} />
           </div>
           <div>
             <h3 className="data-grid-title">ROSTER POOL</h3>
             <p className="data-grid-subtitle">{importedData.length} records verified</p>
           </div>
        </div>
        {importedData.length > 0 && (
          <button onClick={clearData} className="btn-danger-ghost">
            <Trash2 size={16} /> CLEAR MEMORY
          </button>
        )}
      </div>

      <div className="data-table-area">
        {importedData.length === 0 ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
            <label className="upload-dropzone-wide group">
              <div className="icon-glow-cyan">
                <FileSpreadsheet size={40} />
              </div>
              <h4 className="upload-text-main" style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>INITIALIZE EXCEL/CSV</h4>
              <p className="upload-text-sub" style={{ marginBottom: '2rem' }}>Data fields must match your configured mapped labels.</p>
              
              <div className="upload-banner">
                 Drag & drop anywhere or click to index filesystem
              </div>
              <input type="file" className="file-input-hidden" accept=".xlsx, .xls, .csv" onChange={handleFileUpload} />
            </label>
          </div>
        ) : (
          <div className="data-table-container">
            <div className="data-table-scroll">
              <table className="data-table">
                <thead>
                   <tr>
                      <th className="data-table-th id-col">ID</th>
                      {Object.keys(importedData[0]).map(key => (
                        <th key={key} className="data-table-th">{key}</th>
                      ))}
                   </tr>
                </thead>
                <tbody>
                  {importedData.slice(0, 50).map((row, idx) => (
                    <tr key={idx}>
                      <td className="data-table-td id-col">
                         <span className="data-table-id-badge">
                           {String(idx + 1).padStart(2, '0')}
                         </span>
                      </td>
                      {Object.keys(row).map((key) => (
                         <td key={key} className="data-table-td">
                            {String(row[key] || '-')}
                         </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {importedData.length > 50 && (
              <div className="data-table-footer">
                 <CheckCircle2 size={16} className="data-table-footer-icon" />
                 <span className="data-table-footer-text">
                   + {importedData.length - 50} RECORDS SUCCESSFULLY LOADED IN BACKGROUND
                 </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
