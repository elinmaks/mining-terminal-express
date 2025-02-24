
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
    
    // Проверяем наличие методов перед их вызовом
    console.log('Доступные методы:', Object.keys(webApp));
    
    if (typeof webApp.ready === 'function') {
      webApp.ready();
      console.log('WebApp.ready() выполнен');
    }
    
    if (typeof webApp.expand === 'function') {
      webApp.expand();
      console.log('WebApp.expand() выполнен');
    }
    
    // Базовая инициализация без сложных методов
    if (webApp.MainButton) {
      console.log('MainButton доступна');
      webApp.MainButton.hide();
    }

  } catch (error) {
    console.error('Ошибка при инициализации WebApp:', error);
  }
};
