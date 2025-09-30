// Single socket.io client, pointed at your RT server (NOT the Vite dev server)
import { io } from 'socket.io-client';

// Generate stable IDs (device across tabs; tab per session)
function getDeviceId() {
  const k = 'pool_device_id';
  let id = localStorage.getItem(k);
  if (!id) {
    id = (crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2));
    localStorage.setItem(k, id);
  }
  return id;
}
function getTabId() {
  const k = 'pool_tab_id';
  let id = sessionStorage.getItem(k);
  if (!id) {
    id = (crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2));
    sessionStorage.setItem(k, id);
  }
  return id;
}

// Point this to your server port. You can also set VITE_RT_URL in .env
const RT_URL = import.meta.env.VITE_RT_URL || 'http://localhost:8787';

export const socket = io(RT_URL, {
  transports: ['websocket'],
  autoConnect: true,
  reconnection: true,
  // If you add auth later, put your userId/token here
  auth: {
    userId: localStorage.getItem('pool_user_id') || null,
    deviceId: getDeviceId(),
    tabId: getTabId(),
  },
});
