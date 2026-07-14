import { useState, useRef } from 'react';
import { FiUpload, FiX } from 'react-icons/fi';
import api from '../../services/api';

const ImageUpload = ({ value, onChange, label = 'Cover Image' }) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(value || '');
  const [error, setError] = useState('');
  const fileRef = useRef();

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { setError('Please select an image file'); return; }
    if (file.size > 5 * 1024 * 1024) { setError('Image must be less than 5MB'); return; }
    setError('');
    setUploading(true);
    try {
      const sigRes = await api.get('/upload/signature');
      const { signature, timestamp, cloudName, apiKey, folder } = sigRes.data.data;
      const formData = new FormData();
      formData.append('file', file);
      formData.append('signature', signature);
      formData.append('timestamp', timestamp);
      formData.append('api_key', apiKey);
      formData.append('folder', folder);
      const uploadRes = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        { method: 'POST', body: formData }
      );
      const data = await uploadRes.json();
      if (data.secure_url) {
        setPreview(data.secure_url);
        onChange(data.secure_url);
      } else {
        setError('Upload failed. Please try again.');
      }
    } catch (err) {
      setError('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setPreview('');
    onChange('');
    if (fileRef.current) fileRef.current.value = '';
  };

  return (
    <div>
      <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
        {label}
      </label>
      {preview ? (
        <div style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', border: '2px solid #e5e7eb' }}>
          <img src={preview} alt="Preview" style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
          <button type="button" onClick={handleRemove} style={{
            position: 'absolute', top: '8px', right: '8px',
            background: '#ef4444', color: 'white', border: 'none',
            borderRadius: '50%', width: '28px', height: '28px',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <FiX size={14} />
          </button>
          <div style={{
            position: 'absolute', bottom: '8px', left: '8px',
            background: 'rgba(0,0,0,0.6)', color: 'white',
            fontSize: '12px', padding: '4px 10px', borderRadius: '20px'
          }}>
            ✅ Image uploaded
          </div>
        </div>
      ) : (
        <div
          onClick={() => fileRef.current?.click()}
          style={{
            border: '2px dashed #cbd5e1', borderRadius: '12px',
            padding: '40px', textAlign: 'center', cursor: 'pointer',
            transition: 'all 0.2s', background: '#f8fafc'
          }}
          onMouseOver={e => { e.currentTarget.style.borderColor = '#4f46e5'; e.currentTarget.style.background = '#eef2ff'; }}
          onMouseOut={e => { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.background = '#f8fafc'; }}
        >
          {uploading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '36px', height: '36px', border: '4px solid #4f46e5',
                borderTopColor: 'transparent', borderRadius: '50%',
                animation: 'spin 0.8s linear infinite'
              }} />
              <p style={{ color: '#64748b', margin: 0, fontSize: '14px' }}>Uploading image...</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '52px', height: '52px', borderRadius: '50%',
                background: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <FiUpload size={22} color="#4f46e5" />
              </div>
              <p style={{ color: '#374151', margin: 0, fontWeight: '600' }}>Click to upload image</p>
              <p style={{ color: '#94a3b8', margin: 0, fontSize: '12px' }}>PNG, JPG, WEBP up to 5MB</p>
            </div>
          )}
        </div>
      )}
      <input ref={fileRef} type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
      {error && <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>{error}</p>}
      <input
        type="url"
        placeholder="Or paste image URL directly..."
        value={preview}
        onChange={(e) => { setPreview(e.target.value); onChange(e.target.value); }}
        style={{
          width: '100%', marginTop: '8px', padding: '10px 14px',
          border: '2px solid #e5e7eb', borderRadius: '10px',
          fontSize: '13px', outline: 'none', boxSizing: 'border-box',
          background: '#f9fafb', color: '#1e293b'
        }}
      />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default ImageUpload;