import React, { useEffect, useRef, useState } from 'react';
import { socket } from '../../lib/socket';

type Props = {
  // Optional: keep name in parent if you want
  valueFromParent?: string;
  onNameChange?: (name: string) => void;
};

export default function NamePanel({ valueFromParent, onNameChange }: Props) {
  // Local input value
  const [name, setName] = useState<string>(valueFromParent ?? '');
  const pendingRef = useRef<string | null>(null); // track last submitted name
  const [saving, setSaving] = useState(false);
  const [savedTick, setSavedTick] = useState(0);  // simple blink

  // Keep local name in sync if parent provides one
  useEffect(() => {
    if (typeof valueFromParent === 'string') setName(valueFromParent);
  }, [valueFromParent]);

  // Listen for server to tell us who we are
  useEffect(() => {
    const onMe = (me: { name?: string }) => {
      if (typeof me?.name === 'string') {
        setName(me.name);
        onNameChange?.(me.name);
        if (pendingRef.current && me.name.trim() === pendingRef.current.trim()) {
          setSaving(false);
          setSavedTick((t) => t + 1);
          pendingRef.current = null;
        }
      }
    };

    if (!socket.connected) socket.connect();
    socket.on('user:me', onMe);
    return () => {
      socket.off('user:me', onMe);
    };
  }, [onNameChange]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = (name ?? '').trim();
    if (!trimmed) return;

    pendingRef.current = trimmed;
    setSaving(true);
    document.dispatchEvent(new CustomEvent('POOL_RENAME', { detail: { name: trimmed } }));
  };

  return (
    <form onSubmit={submit} style={panelStyle}>
      <label style={labelStyle}>Your name</label>
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={32}
          placeholder="Type a display name"
          style={inputStyle}
        />
        <button type="submit" disabled={saving || !name.trim()} style={btnStyle}>
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>
      <div
        key={savedTick}
        style={{
          height: 18,
          fontSize: 12,
          color: saving ? '#999' : '#2e7d32',
          transition: 'opacity .2s',
          opacity: saving ? 0.6 : 1,
          marginTop: 6,
        }}
      >
        {!saving && savedTick > 0 ? 'Saved.' : ' '}
      </div>
    </form>
  );
}

// quick inline styles to keep this drop-in
const panelStyle: React.CSSProperties = {
  display: 'grid',
  gap: 6,
  alignItems: 'start',
  maxWidth: 360,
};

const labelStyle: React.CSSProperties = {
  fontSize: 12,
  textTransform: 'uppercase',
  letterSpacing: 0.5,
  color: '#888',
};

const inputStyle: React.CSSProperties = {
  flex: 1,
  padding: '8px 10px',
  borderRadius: 8,
  border: '1px solid #ddd',
  outline: 'none',
};

const btnStyle: React.CSSProperties = {
  padding: '8px 12px',
  borderRadius: 8,
  border: '1px solid #ccc',
  background: '#f6f6f6',
  cursor: 'pointer',
};
