
// Константы
const SHARE_DIFFICULTY_DELTA = 2; // На сколько меньше сложность для шар
const BATCH_SIZE = 1000; // Количество попыток перед отправкой обновления

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

// Функция проверки share
function isShare(hash: string, blockDifficulty: number): boolean {
  return meetsTarget(hash, Math.max(1, blockDifficulty - SHARE_DIFFICULTY_DELTA));
}

// Основной процесс майнинга
async function mine(data: string, difficulty: number): Promise<void> {
  let nonce = 0;
  let startTime = Date.now();
  let hashCount = 0;

  while (true) {
    const batchStartTime = Date.now();
    
    for (let i = 0; i < BATCH_SIZE; i++) {
      const message = `${data}${nonce}`;
      const hash = await sha256(message);
      
      // Проверка на полное решение
      if (meetsTarget(hash, difficulty)) {
        self.postMessage({
          type: 'success',
          nonce,
          hash,
          hashrate: calculateHashrate(hashCount, startTime)
        });
        return;
      }
      
      // Проверка на share
      if (isShare(hash, difficulty)) {
        self.postMessage({
          type: 'share',
          nonce,
          hash,
          hashrate: calculateHashrate(hashCount, startTime)
        });
      }
      
      nonce++;
      hashCount++;
    }
    
    // Отправка прогресса
    const currentHashrate = calculateHashrate(BATCH_SIZE, batchStartTime);
    self.postMessage({
      type: 'progress',
      nonce,
      hashrate: currentHashrate,
      totalHashrate: calculateHashrate(hashCount, startTime)
    });
  }
}

// Расчет хешрейта
function calculateHashrate(hashes: number, startTime: number): number {
  const timeDiff = (Date.now() - startTime) / 1000; // в секундах
  return hashes / timeDiff;
}

// Обработчик сообщений
self.onmessage = async (e: MessageEvent) => {
  if (e.data.type === 'start') {
    try {
      await mine(e.data.data, e.data.difficulty);
    } catch (error) {
      self.postMessage({ type: 'error', error: error.message });
    }
  }
};
