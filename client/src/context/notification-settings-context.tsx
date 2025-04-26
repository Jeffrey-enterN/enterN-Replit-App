import { createContext, ReactNode, useContext, useState, useEffect } from "react";

type NotificationSettings = {
  pushNotifications: boolean;
  emailNotifications: boolean;
};

type NotificationSettingsProviderProps = {
  children: ReactNode;
  storageKey?: string;
};

type NotificationSettingsProviderState = {
  settings: NotificationSettings;
  updateSettings: (settings: Partial<NotificationSettings>) => void;
};

const initialState: NotificationSettingsProviderState = {
  settings: {
    pushNotifications: false,
    emailNotifications: false,
  },
  updateSettings: () => null,
};

const NotificationSettingsContext = createContext<NotificationSettingsProviderState>(initialState);

export function NotificationSettingsProvider({
  children,
  storageKey = "entern-notification-settings",
  ...props
}: NotificationSettingsProviderProps) {
  const [settings, setSettings] = useState<NotificationSettings>(() => {
    const storedSettings = localStorage.getItem(storageKey);
    return storedSettings
      ? JSON.parse(storedSettings)
      : initialState.settings;
  });

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(settings));
  }, [settings, storageKey]);

  const updateSettings = (newSettings: Partial<NotificationSettings>) => {
    setSettings((prev) => ({
      ...prev,
      ...newSettings,
    }));
  };

  return (
    <NotificationSettingsContext.Provider
      {...props}
      value={{ settings, updateSettings }}
    >
      {children}
    </NotificationSettingsContext.Provider>
  );
}

export const useNotificationSettings = () => {
  const context = useContext(NotificationSettingsContext);
  
  if (context === undefined) {
    throw new Error(
      "useNotificationSettings must be used within a NotificationSettingsProvider"
    );
  }
  
  return context;
};