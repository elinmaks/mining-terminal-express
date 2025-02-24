// Определения типов для Telegram Web App
interface ThemeParams {
  bg_color?: string;
  text_color?: string;
  hint_color?: string;
  link_color?: string;
  button_color?: string;
  button_text_color?: string;
  secondary_bg_color?: string;
}

interface WebAppInitData {
  user?: {
    id: number;
    first_name: string;
    last_name?: string;
    username?: string;
    language_code?: string;
  };
  chat_type?: string;
  chat_instance?: string;
  start_param?: string;
  auth_date: number;
  hash: string;
}

interface MainButton {
  text: string;
  color: string;
  textColor: string;
  isVisible: boolean;
  isActive: boolean;
  isProgressVisible: boolean;
  setText: (text: string) => MainButton;
  onClick: (callback: () => void) => MainButton;
  offClick: (callback: () => void) => MainButton;
  show: () => MainButton;
  hide: () => MainButton;
  enable: () => MainButton;
  disable: () => MainButton;
  showProgress: (leaveActive?: boolean) => MainButton;
  hideProgress: () => MainButton;
}

interface BackButton {
  isVisible: boolean;
  onClick: (callback: () => void) => void;
  offClick: (callback: () => void) => void;
  show: () => void;
  hide: () => void;
}

interface HapticFeedback {
  impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
  notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
  selectionChanged: () => void;
}

declare global {
  interface Window {
    Telegram: {
      WebApp: {
        initData: string;
        initDataUnsafe: WebAppInitData;
        version: string;
        platform: string;
        colorScheme: string;
        themeParams: ThemeParams;
        isExpanded: boolean;
        viewportHeight: number;
        viewportStableHeight: number;
        MainButton: MainButton;
        BackButton: BackButton;
        HapticFeedback: HapticFeedback;
        ready: () => void;
        expand: () => void;
        close: () => void;
        setHeaderColor: (color: string) => void;
        setBackgroundColor: (color: string) => void;
        enableClosingConfirmation: () => void;
        disableClosingConfirmation: () => void;
      };
    };
  }
}

export const getTelegramUser = () => {
  if (!window.Telegram?.WebApp) {
    console.log('Telegram WebApp не инициализирован');
    return null;
  }
  
  try {
    const user = window.Telegram.WebApp.initDataUnsafe?.user;
    console.log('Telegram user:', user);
    return user || null;
  } catch (error) {
    console.error('Ошибка при получении пользователя:', error);
    return null;
  }
};

export const initTelegramWebApp = () => {
  if (!window.Telegram?.WebApp) {
    console.error('Telegram WebApp не доступен');
    return;
  }

  try {
    console.log('Инициализация Telegram WebApp...');
    const webApp = window.Telegram.WebApp;
    
    // Применяем цвета темы
    if (webApp.themeParams) {
      document.documentElement.style.setProperty('--tg-theme-bg-color', webApp.themeParams.bg_color || '');
      document.documentElement.style.setProperty('--tg-theme-text-color', webApp.themeParams.text_color || '');
      document.documentElement.style.setProperty('--tg-theme-button-color', webApp.themeParams.button_color || '');
      document.documentElement.style.setProperty('--tg-theme-button-text-color', webApp.themeParams.button_text_color || '');
    }

    // Устанавливаем цвет шапки и фона
    webApp.setHeaderColor('#1a1b1e');
    webApp.setBackgroundColor('#1a1b1e');
    
    // Включаем подтверждение закрытия
    webApp.enableClosingConfirmation();
    
    // Расширяем приложение на весь экран
    if (typeof webApp.expand === 'function') {
      webApp.expand();
    }
    
    // Скрываем главную кнопку при инициализации
    if (webApp.MainButton) {
      webApp.MainButton.hide();
    }

    // Сообщаем приложению, что оно готово к отображению
    webApp.ready();
    console.log('WebApp успешно инициализирован');

  } catch (error) {
    console.error('Ошибка при инициализации WebApp:', error);
  }
};

// Функции для работы с главной кнопкой
export const showMainButton = (text: string = 'STOP MINING') => {
  if (!window.Telegram?.WebApp?.MainButton) return;
  
  try {
    const mainButton = window.Telegram.WebApp.MainButton;
    mainButton.setText(text);
    mainButton.show();
    console.log('Показана главная кнопка с текстом:', text);
  } catch (error) {
    console.error('Ошибка при показе главной кнопки:', error);
  }
};

export const hideMainButton = () => {
  if (!window.Telegram?.WebApp?.MainButton) return;
  
  try {
    window.Telegram.WebApp.MainButton.hide();
    console.log('Главная кнопка скрыта');
  } catch (error) {
    console.error('Ошибка при скрытии главной кнопки:', error);
  }
};

export const setMainButtonHandler = (callback: () => void) => {
  if (!window.Telegram?.WebApp?.MainButton) return;
  
  try {
    window.Telegram.WebApp.MainButton.onClick(callback);
    console.log('Установлен обработчик нажатия главной кнопки');
  } catch (error) {
    console.error('Ошибка при установке обработчика главной кнопки:', error);
  }
};

export const haptic = {
  impact: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => {
    window.Telegram?.WebApp?.HapticFeedback?.impactOccurred(style);
  },
  notification: (type: 'error' | 'success' | 'warning') => {
    window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred(type);
  },
  selection: () => {
    window.Telegram?.WebApp?.HapticFeedback?.selectionChanged();
  }
};
