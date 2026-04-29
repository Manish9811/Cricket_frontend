import { createContext, useContext, useEffect, useState } from 'react';
import { createSocket } from '../socket/socketClient';
import { AuthContext } from './AuthContext';

export const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const { token } = useContext(AuthContext);
  // Store socket instance in state so consumers re-render when it changes
  const [socket,    setSocket]    = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!token) {
      setSocket(prev => {
        if (prev) prev.disconnect();
        return null;
      });
      setConnected(false);
      return;
    }

    const s = createSocket(token);
    setSocket(s);

    s.on('connect',    () => setConnected(true));
    s.on('disconnect', () => setConnected(false));

    return () => {
      s.disconnect();
      setSocket(null);
    };
  }, [token]);

  return (
    <SocketContext.Provider value={{ socket, connected }}>
      {children}
    </SocketContext.Provider>
  );
}
