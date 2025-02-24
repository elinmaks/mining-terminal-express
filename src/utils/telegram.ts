
declare global {
  interface Window {
    Telegram: {
      WebApp: {
        ready: () => void;
        initDataUnsafe: {
          user?: {
            id: number;
            username: string;
            first_name: string;
          };
        };
        MainButton: {
          show: () => void;
          hide: () => void;
          setText: (text: string) => void;
          onClick: (callback: () => void) => void;
        };
      };
    };
  }
}

export const getTelegramUser = () => {
  const webApp = window.Telegram?.WebApp;
  if (webApp && webApp.initDataUnsafe.user) {
    return webApp.initDataUnsafe.user;
  }
  return null;
};

export const initTelegramWebApp = () => {
  if (window.Telegram?.WebApp) {
    window.Telegram.WebApp.ready();
  }
};
