
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
        BackButton: {
          show: () => void;
          hide: () => void;
          onClick: (callback: () => void) => void;
        };
        expand: () => void;
        close: () => void;
        enableClosingConfirmation: () => void;
        isExpanded: boolean;
        setBackgroundColor: (color: string) => void;
        setupMainButton: (params: {
          text: string;
          color: string;
          textColor: string;
          isVisible: boolean;
          isLoading: boolean;
          isActive: boolean;
        }) => void;
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
  const webApp = window.Telegram?.WebApp;
  if (webApp) {
    // Инициализация приложения
    webApp.ready();
    
    // Настройка темного фона
    webApp.setBackgroundColor('#000000');
    
    // Разрешаем приложению расширяться на весь экран
    webApp.expand();
    
    // Включаем подтверждение закрытия
    webApp.enableClosingConfirmation();
    
    // Настраиваем главную кнопку
    webApp.MainButton.setText('STOP MINING');
    webApp.MainButton.hide();
    
    // Скрываем кнопку назад
    webApp.BackButton.hide();
  }
};

export const showMainButton = (text: string = 'STOP MINING') => {
  const mainButton = window.Telegram?.WebApp?.MainButton;
  if (mainButton) {
    mainButton.setText(text);
    mainButton.show();
  }
};

export const hideMainButton = () => {
  window.Telegram?.WebApp?.MainButton?.hide();
};

export const setMainButtonHandler = (callback: () => void) => {
  window.Telegram?.WebApp?.MainButton?.onClick(callback);
};
