import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { Loader2, Download, Hexagon } from 'lucide-react';

export default function Generator({ templateImage, data, certificateFields, issueDate }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });

  const chunkArray = (array, size) => {
    const chunked = [];
    for (let i = 0; i < array.length; i += size) {
      chunked.push(array.slice(i, i + size));
    }
    return chunked;
  };

  const isReady = templateImage && data.length > 0 && Object.keys(certificateFields).length > 0;

  const fontMapping = {
    'times': 'times',
    'helvetica': 'helvetica',
    'courier': 'courier',
    'outfit': 'helvetica',
    'inter': 'helvetica',
    'montserrat': 'helvetica',
    'playfair': 'times',
    'eb-garamond': 'times',
    'cinzel': 'times',
    'libre-baskerville': 'times',
    'cormorant': 'times',
    'great-vibes': 'times',
    'dancing-script': 'times',
    'alex-brush': 'times',
    'pinyon-script': 'times'
  };

  const handleGenerate = async () => {
    if (!isReady) return;
    setIsGenerating(true);
    setProgress({ current: 0, total: data.length });

    const zip = new JSZip();
    const chunks = chunkArray(data, 10);
    let processedCount = 0;

    const img = new Image();
    img.src = templateImage;
    
    await new Promise((resolve) => {
      img.onload = async () => {
        const naturalWidth = img.width;
        const naturalHeight = img.height;
        const isLandscape = naturalWidth > naturalHeight;
        
        const scaleFactor = 0.75;
        const ptWidth = naturalWidth * scaleFactor;
        const ptHeight = naturalHeight * scaleFactor;

        for (const chunk of chunks) {
          for (const item of chunk) {
            const doc = new jsPDF({
              orientation: isLandscape ? 'landscape' : 'portrait',
              unit: 'pt',
              format: [ptWidth, ptHeight]
            });

            doc.addImage(img, 'PNG', 0, 0, ptWidth, ptHeight);

            Object.entries(certificateFields).forEach(([key, config]) => {
              const textStr = config.source === 'system_date' ? issueDate : String(item[key] || item[config.label?.toLowerCase()] || '');
              if (!textStr) return;

              let x = (config.xPct / 100) * ptWidth;
              let y = (config.yPct / 100) * ptHeight;

              const pdfFontSize = config.fontSize * scaleFactor;
              doc.setFontSize(pdfFontSize);
              doc.setTextColor(config.color);

              const font = fontMapping[config.fontFamily] || 'helvetica';
              const style = config.fontWeight.includes('bold') ? 
                            (config.fontWeight.includes('italic') ? 'bolditalic' : 'bold') : 
                            (config.fontWeight.includes('italic') ? 'italic' : 'normal');

              doc.setFont(font, style);

              const align = config.align || 'center';

              // CRITICAL DOM MAPPING
              // By adding this exact mapped ratio (0.16), we push the baseline down just enough to sit on the line
              // without intersecting it depending on varying browser font ascenders.
              const yOffset = pdfFontSize * 0.16;
              const adjustedY = y + yOffset;

              doc.text(textStr, x, adjustedY, { align: align });
            });

            const fileName = `Certificate_${item.name || item.id || processedCount}.pdf`.replace(/\s+/g, '_');
            const pdfBlob = doc.output('blob');
            zip.file(fileName, pdfBlob);

            processedCount++;
            setProgress({ current: processedCount, total: data.length });
          }

          await new Promise(r => setTimeout(r, 50));
        }
        resolve();
      };
    });

    try {
      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, 'Certificates_Batch.zip');
    } catch (error) {
      console.error("Error generating zip:", error);
      alert("An error occurred while zipping the certificates.");
    }

    setIsGenerating(false);
  };

  return (
    <div className="generator-container">
      {isGenerating && (
        <div className="progress-card">
          <div className="progress-header">
             <div>
               <p className="progress-label-sub">Synchronizing Batch</p>
               <p className="progress-label-main">{Math.round((progress.current / progress.total) * 100)}%</p>
             </div>
             <div className="progress-stats">
               <Loader2 size={16} className="icon-spin" />
               <span className="progress-stats-val">{progress.current} / {progress.total} RECORDS</span>
             </div>
          </div>
          <div className="progress-bar-track">
             <div 
               className="progress-bar-fill"
               style={{ width: `${(progress.current / progress.total) * 100}%` }}
             ></div>
          </div>
        </div>
      )}

      <button
        onClick={handleGenerate}
        disabled={!isReady || isGenerating}
        className="btn-execute-lux group"
      >
        <div className="btn-execute-shine"></div>
        {isGenerating ? (
          <>
            <Hexagon size={24} className="icon-spin execution-loading-icon" /> EXECUTING RENDER PIPELINE
          </>
        ) : (
          <>
            <Download size={24} /> INITIALIZE BATCH PRODUCTION
          </>
        )}
      </button>

      <div className="generator-footer">
        <p className="generator-footer-title">Processing Engine</p>
        <p className="generator-footer-desc">The batch relies on client-side JSZIP grouping. Do not close this browser window until the final archive is downloaded.</p>
      </div>
    </div>
  );
}
