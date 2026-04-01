import React, { useState } from 'react';
import TemplateEditor from './components/TemplateEditor';
import DataImporter from './components/DataImporter';
import Generator from './components/Generator';
import { Award, UploadCloud, Crosshair, Users, Zap, CheckCircle2 } from 'lucide-react';
import './App.css'; 
import './index.css';

function App() {
  const [currentStep, setCurrentStep] = useState(1);
  const [templateImage, setTemplateImage] = useState(null);
  const [certificateFields, setCertificateFields] = useState({});
  const [importedData, setImportedData] = useState([]);

  // Determine if a step is accessible
  const canAccessStep = (step) => {
    switch(step) {
      case 1: return true;
      case 2: return !!templateImage;
      case 3: return !!templateImage && Object.keys(certificateFields).length > 0;
      case 4: return !!templateImage && importedData.length > 0;
      default: return false;
    }
  };

  const steps = [
    { id: 1, title: 'Blank Canvas', icon: UploadCloud, desc: 'Upload template' },
    { id: 2, title: 'Precision Map', icon: Crosshair, desc: 'Calibrate fields' },
    { id: 3, title: 'Data Roster', icon: Users, desc: 'Import records' },
    { id: 4, title: 'Execution', icon: Zap, desc: 'Generate batch' }
  ];

  return (
    <div className="app-container">
      {/* Immersive Ambient Glow Background */}
      <div className="ambient-layers">
        <div className="ambient-orb-primary" />
        <div className="ambient-orb-secondary" />
      </div>

      <header className="app-header">
        <div className="header-container">
          <div className="logo-wrapper">
            <div className="logo-icon">
              <Award size={18} />
            </div>
            <div>
              <h1 className="logo-text">PRECISION STUDIO</h1>
            </div>
          </div>
          <div className="stepper-nav">
            {steps.map((step) => {
               const active = currentStep === step.id;
               const completed = currentStep > step.id;
               const locked = !canAccessStep(step.id);
               
               let statusClass = 'is-pending';
               if (active) statusClass = 'is-active';
               if (completed) statusClass = 'is-completed';

               return (
                 <button 
                  key={step.id}
                  disabled={locked}
                  onClick={() => setCurrentStep(step.id)}
                  className={`step-button ${locked ? 'is-locked' : ''}`}
                 >
                   <div className={`step-circle ${statusClass}`}>
                     {completed ? <CheckCircle2 size={16} /> : <step.icon size={14} />}
                   </div>
                   <div className="step-label-wrapper">
                     <span className={`step-id ${statusClass}`}>STEP 0{step.id}</span>
                     <span className="step-desc">{step.desc}</span>
                   </div>
                 </button>
               )
            })}
          </div>
        </div>
      </header>

      <main className="main-content">
        {/* Render Step 1: Upload */}
        {currentStep === 1 && (
          <div className="step-view-centered">
            <div className="step-header">
              <h2 className="step-title">Initialize Canvas</h2>
              <p className="step-subtitle">Upload your blank high-resolution certificate template to begin.</p>
            </div>
            
            <div className="upload-dropzone">
                {templateImage ? (
                  <div className="preview-wrapper">
                    <img src={templateImage} alt="Preview" className="preview-image" />
                    <div className="preview-overlay">
                      <button className="btn-primary-solid">
                        REPLACE TEMPLATE
                      </button>
                      <input type="file" className="file-input-hidden" accept="image/*" onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (event) => { setTemplateImage(event.target.result); setCurrentStep(2); };
                          reader.readAsDataURL(file);
                        }
                      }} />
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="icon-glow-indigo">
                      <UploadCloud size={40} />
                    </div>
                    <span className="upload-text-main">DRAG & DROP</span>
                    <span className="upload-text-sub">or click to browse local files</span>
                    <input type="file" className="file-input-hidden" accept="image/*" onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (event) => { setTemplateImage(event.target.result); setCurrentStep(2); };
                        reader.readAsDataURL(file);
                      }
                    }} />
                  </>
                )}
            </div>

            {templateImage && (
              <button onClick={() => setCurrentStep(2)} className="btn-primary-gradient">
                PROCEED TO CALIBRATION &rarr;
              </button>
            )}
          </div>
        )}

        {/* Render Step 2: Calibration */}
        {currentStep === 2 && (
          <div className="step-view-split">
            <div className="stage-pane">
              <TemplateEditor
                templateImage={templateImage}
                setTemplateImage={setTemplateImage}
                certificateFields={certificateFields}
                setCertificateFields={setCertificateFields}
                showOnly="preview"
              />
            </div>
            <div className="calibration-sidebar">
               <TemplateEditor
                templateImage={templateImage}
                setTemplateImage={setTemplateImage}
                certificateFields={certificateFields}
                setCertificateFields={setCertificateFields}
                showOnly="settings"
              />
              <div className="settings-footer">
                <button 
                  onClick={() => setCurrentStep(3)}
                  disabled={Object.keys(certificateFields).length === 0}
                  className="btn-secondary-full"
                >
                  Confirm Mapping &rarr;
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Render Step 3: Data Roster */}
        {currentStep === 3 && (
          <div className="step-view-wide">
            <div className="step-header step-header-left" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 className="step-title">Data Roster</h2>
                <p className="step-subtitle">Import your Excel/CSV bulk assignment list to align with the mapped properties.</p>
              </div>
              {importedData.length > 0 && (
                <button onClick={() => setCurrentStep(4)} className="btn-primary-gradient" style={{ marginTop: 0 }}>
                  INITIALIZE ENGINE &rarr;
                </button>
              )}
            </div>
            
            <div className="data-grid-layout">
              <DataImporter
                importedData={importedData}
                setImportedData={setImportedData}
              />
            </div>
          </div>
        )}

        {/* Render Step 4: Generation */}
        {currentStep === 4 && (
          <div className="execution-engine-wrapper">
             <div className="execution-card">
                <div className="execution-card-inner">
                  <div className="execution-header">
                    <div className="execution-icon">
                      <Zap size={40} />
                    </div>
                    <h2 className="execution-title">System Ready</h2>
                    <p className="execution-subtitle">The Precision Studio Engine is fully calibrated and standing by to execute the batch rendering process.</p>
                  </div>
                  
                  <div className="execution-summary">
                    <ul className="execution-list">
                      <li className="execution-list-item">
                        <span className="execution-list-label"><CheckCircle2 size={16} className="execution-list-icon"/> Template Synchronized</span>
                        <span className="execution-list-val">{templateImage ? 'OK' : 'ERR'}</span>
                      </li>
                      <li className="execution-list-item">
                        <span className="execution-list-label"><CheckCircle2 size={16} className="execution-list-icon"/> Coordinate Grid Active</span>
                        <span className="execution-list-val">{Object.keys(certificateFields).length} FIELDS</span>
                      </li>
                      <li className="execution-list-item">
                        <span className="execution-list-label"><CheckCircle2 size={16} className="execution-list-icon"/> Roster Parsed & Linked</span>
                        <span className="execution-list-val">{importedData.length} RECORDS</span>
                      </li>
                    </ul>
                  </div>

                  <Generator
                    templateImage={templateImage}
                    data={importedData}
                    certificateFields={certificateFields}
                  />
                  
                  <button onClick={() => setCurrentStep(1)} className="btn-back-link">
                    &larr; Abort and return to start
                  </button>
                </div>
             </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
