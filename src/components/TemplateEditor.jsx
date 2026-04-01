import React, { useRef, useState, useEffect } from 'react';
import Draggable from 'react-draggable';
import { Upload, Plus, Trash2, Settings2, GripHorizontal, Crosshair } from 'lucide-react';

export default function TemplateEditor({
  templateImage,
  setTemplateImage,
  certificateFields,
  setCertificateFields,
  showOnly
}) {
  const containerRef = useRef(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [newFieldName, setNewFieldName] = useState('');
  const [scaleRatio, setScaleRatio] = useState(1);

  useEffect(() => {
    if (!containerRef.current || !templateImage) return;

    const observer = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      setContainerSize({ width, height });

      const img = new Image();
      img.src = templateImage;
      img.onload = () => {
        setScaleRatio(width / img.width);
      };
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [templateImage]);

  const handleDrag = (fieldName, e, data) => {
    if (!containerSize.width || !containerSize.height) return;

    const xPct = (data.x / containerSize.width) * 100;
    const yPct = (data.y / containerSize.height) * 100;

    setCertificateFields((prev) => ({
      ...prev,
      [fieldName]: { ...prev[fieldName], xPct, yPct }
    }));
  };

  const addField = () => {
    const formattedName = newFieldName.trim().toLowerCase().replace(/\s+/g, '_');
    if (!formattedName) return;

    setCertificateFields((prev) => ({
      ...prev,
      [formattedName]: {
        label: newFieldName.trim(),
        text: '',
        xPct: 50,
        yPct: 50,
        fontSize: 32,
        fontFamily: 'Outfit',
        fontWeight: 'bold',
        align: 'center',
        color: '#000000'
      }
    }));
    setNewFieldName('');
  };

  const removeField = (fieldName) => {
    const newFields = { ...certificateFields };
    delete newFields[fieldName];
    setCertificateFields(newFields);
  };

  const updateField = (fieldName, property, value) => {
    setCertificateFields((prev) => ({
      ...prev,
      [fieldName]: {
        ...prev[fieldName],
        [property]: value
      }
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => setTemplateImage(event.target.result);
      reader.readAsDataURL(file);
    }
  };

  const getCssFontFamily = (fontFamily) => {
    switch (fontFamily) {
      case 'times': return '"Times New Roman", Times, serif';
      case 'helvetica': return 'Arial, Helvetica, sans-serif';
      case 'courier': return '"Courier New", Courier, monospace';
      case 'outfit': return 'var(--font-main)';
      default: return 'var(--font-main)';
    }
  };

  if (showOnly === 'settings') {
    return (
      <>
        <div className="properties-header">
           <div className="properties-icon">
             <Settings2 size={24} />
           </div>
           <div>
             <h3 className="properties-title">PROPERTIES</h3>
             <p className="properties-subtitle">Field Calibration</p>
           </div>
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <label className="control-group-title">INITIALIZE NEW MARKER</label>
          <div className="control-row">
            <input
              type="text"
              placeholder="e.g. Employee Name"
              value={newFieldName}
              onChange={(e) => setNewFieldName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addField()}
              className="control-input"
            />
            <button
              onClick={addField}
              disabled={!newFieldName.trim()}
              className="control-btn-add"
            >
              <Plus size={20} />
            </button>
          </div>
        </div>

        <div className="fields-list">
          {Object.keys(certificateFields).length === 0 ? (
            <div className="empty-fields-state">
              <p className="empty-fields-title">NO ACTIVE FIELDS</p>
              <p className="empty-fields-desc">Initialize a marker above to configure constraints.</p>
            </div>
          ) : (
            Object.entries(certificateFields).map(([key, field]) => (
              <div key={key} className="field-card">
                <div className="field-card-header">
                  <div className="field-card-title-wrap">
                     <GripHorizontal size={14} className="field-icon-drag" />
                     <h4 className="field-title">{field.label}</h4>
                  </div>
                  <div className="field-card-actions">
                    <span className="field-coords">
                      [{Math.round(field.xPct)}%, {Math.round(field.yPct)}%]
                    </span>
                    <button onClick={() => removeField(key)} className="field-btn-delete">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <div className="field-card-content">
                  <div className="field-col-full">
                     <label className="label-nano">DEFAULT BOUND TRACE</label>
                     <input
                      type="text"
                      placeholder="Simulation text..."
                      value={field.text}
                      onChange={(e) => updateField(key, 'text', e.target.value)}
                      className="input-sm"
                    />
                  </div>
                  
                  <div>
                    <label className="label-nano">TYPOGRAPHY</label>
                    <select
                      value={field.fontFamily}
                      onChange={(e) => updateField(key, 'fontFamily', e.target.value)}
                      className="input-sm"
                    >
                      <option value="times">Times Roman</option>
                      <option value="helvetica">Helvetica / Arial</option>
                      <option value="courier">Courier Mono</option>
                      <option value="outfit">Outfit Modern</option>
                    </select>
                  </div>

                  <div>
                     <label className="label-nano">SCALE (PTS)</label>
                     <div className="stepper-input-group">
                       <button className="stepper-btn-mini left" onClick={() => updateField(key, 'fontSize', Math.max(8, field.fontSize - 1))}>-</button>
                       <input type="number" className="stepper-input-val" value={field.fontSize} onChange={(e) => updateField(key, 'fontSize', parseInt(e.target.value) || 12)} />
                       <button className="stepper-btn-mini right" onClick={() => updateField(key, 'fontSize', Math.min(120, field.fontSize + 1))}>+</button>
                     </div>
                  </div>
                  
                  <div>
                    <label className="label-nano">WEIGHT / STYLE</label>
                    <select
                      value={field.fontWeight}
                      onChange={(e) => updateField(key, 'fontWeight', e.target.value)}
                      className="input-sm"
                    >
                      <option value="normal">Normal</option>
                      <option value="bold">Bold Black</option>
                      <option value="italic">Italic Oblique</option>
                      <option value="bold italic">Bold Italic</option>
                    </select>
                  </div>

                  <div>
                    <label className="label-nano">COLOR HEX</label>
                    <div className="color-picker-wrap">
                       <input 
                         type="color" 
                         value={field.color} 
                         onChange={(e) => updateField(key, 'color', e.target.value)} 
                         className="color-picker-input"
                       />
                       <span className="color-picker-val">{field.color.toUpperCase()}</span>
                    </div>
                  </div>

                </div>
              </div>
            ))
          )}
        </div>
      </>
    );
  }

  // --- PREVIEW STAGE (showOnly === 'preview') ---
  return (
    <>
      <div className="stage-canvas-frame">
        <div className="stage-glow-line"></div>
        {templateImage ? (
          <div ref={containerRef} className="stage-image-wrapper">
            <img draggable="false" src={templateImage} alt="Template" />
            
            {/* Draggable Anchors */}
            {Object.keys(certificateFields).map((key) => (
              <DraggableTag
                key={key}
                fieldKey={key}
                field={certificateFields[key]}
                containerSize={containerSize}
                scaleRatio={scaleRatio}
                handleDrag={handleDrag}
                getCssFontFamily={getCssFontFamily}
              />
            ))}
          </div>
        ) : (
          <div style={{ padding: '8rem', textAlign: 'center', color: 'var(--text-muted)' }}>NO CANVAS ACTIVE</div>
        )}
      </div>
      {templateImage && (
        <div className="stage-status-text">
          <p className="stage-status-primary">
            <Crosshair size={14} /> PRECISION GRID ONLINE
          </p>
          <p className="stage-status-secondary">Translate variables to mathematical absolute coordinates.</p>
        </div>
      )}
    </>
  );
}

// Sub-component to manage its own nodeRef for react-draggable (React 18 fix)
const DraggableTag = ({ fieldKey, field, containerSize, scaleRatio, handleDrag, getCssFontFamily }) => {
  const nodeRef = useRef(null);
  const responsiveFontSize = Math.max(12, field.fontSize * scaleRatio);
  const xPos = (field.xPct / 100) * containerSize.width;
  const yPos = (field.yPct / 100) * containerSize.height;

  return (
    <Draggable
      nodeRef={nodeRef}
      position={{ x: xPos || 0, y: yPos || 0 }}
      onDrag={(e, data) => handleDrag(fieldKey, e, data)}
      onStop={(e, data) => handleDrag(fieldKey, e, data)}
      bounds="parent"
      handle=".drag-handle"
    >
      <div ref={nodeRef} className="drag-base-zero">
        <div
          className="drag-handle tag-marker group"
          style={{
            transform: field.align === 'left' ? 'translate(0, -50%)' : field.align === 'right' ? 'translate(-100%, -50%)' : 'translate(-50%, -50%)',
            fontFamily: getCssFontFamily(field.fontFamily),
            fontWeight: field.fontWeight.includes('bold') ? 'bold' : 'normal',
            fontStyle: field.fontWeight.includes('italic') ? 'italic' : 'normal',
            fontSize: `${responsiveFontSize}px`,
            color: field.color
          }}
        >
          {/* Crosshair Center */}
          <div className="crosshair-target">
            <div className="crosshair-h"></div>
            <div className="crosshair-v"></div>
            <div className="crosshair-dot"></div>
          </div>
          {field.text || `[${field.label.toUpperCase()}]`}
        </div>
      </div>
    </Draggable>
  );
};
