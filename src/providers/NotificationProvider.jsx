import { NotificationContext } from "../context/notificationContext";
import { useNotifications } from "../enhancements";

export function NotificationProvider({ children }) {
  const notifications = useNotifications();

  return (
    <NotificationContext.Provider value={notifications}>
      {children}
    </NotificationContext.Provider>
  );
}