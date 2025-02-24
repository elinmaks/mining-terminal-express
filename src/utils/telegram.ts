
declare global {
  interface Window {
    Telegram: {
      WebApp: any;
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
    
    console.log('Доступные методы:', Object.keys(webApp));
    
    if (typeof webApp.ready === 'function') {
      webApp.ready();
      console.log('WebApp.ready() выполнен');
    }
    
    if (typeof webApp.expand === 'function') {
      webApp.expand();
      console.log('WebApp.expand() выполнен');
    }
    
    if (webApp.MainButton) {
      console.log('MainButton доступна');
      webApp.MainButton.hide();
    }

  } catch (error) {
    console.error('Ошибка при инициализации WebApp:', error);
  }
};

// Добавляем экспортируемые функции для работы с MainButton
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
