
// Функция для вычисления SHA-256
async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Функция проверки сложности
function meetsTarget(hash: string, difficulty: number): boolean {
  const target = '0'.repeat(difficulty);
  return hash.startsWith(target);
}

// Основной процесс майнинга
async function mine(data: string, difficulty: number): Promise<{ nonce: number; hash: string }> {
  let nonce = 0;
  while (true) {
    const message = `${data}${nonce}`;
    const hash = await sha256(message);
    
    if (meetsTarget(hash, difficulty)) {
      return { nonce, hash };
    }
    
    nonce++;
    
    // Отправляем текущий прогресс каждые 1000 попыток
    if (nonce % 1000 === 0) {
      self.postMessage({ type: 'progress', nonce, currentHash: hash });
    }
  }
}

// Обработчик сообщений
self.onmessage = async (e: MessageEvent) => {
  if (e.data.type === 'start') {
    try {
      const result = await mine(e.data.data, e.data.difficulty);
      self.postMessage({ type: 'success', ...result });
    } catch (error) {
      self.postMessage({ type: 'error', error: error.message });
    }
  }
};
