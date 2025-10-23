/**
 * Преобразует число или строку в число с заданной точностью
 * @param n - Входное значение (число или строка)
 * @param precision - Количество знаков после запятой (по умолчанию 2)
 * @returns Число с заданной точностью или 0 для некорректных значений
 */
export function toNumber(n: number | string | null | undefined, precision: number = 2): number {
    // Валидация precision
    if (precision < 0 || precision > 20) {
      throw new Error('Precision must be between 0 and 20');
    }
  
    // Обработка null/undefined
    if (n === null || n === undefined) {
      return 0;
    }
  
    // Если уже число, возвращаем его
    if (typeof n === 'number') {
      if (!Number.isFinite(n)) {
        return 0;
      }
      const multiplier = Math.pow(10, precision);
      return Math.round(n * multiplier) / multiplier;
    }
  
    // Обработка строки - поддержка европейского формата с запятой
    let numberString = String(n).trim();
    
    // Заменяем запятую на точку для европейского формата
    numberString = numberString.replace(',', '.');
    
    // Удаляем пробелы и другие символы, оставляем только цифры, точку и знак минус
    numberString = numberString.replace(/[^\d.-]/g, '');
    
    // Проверяем, что строка не пустая и содержит хотя бы одну цифру
    if (!numberString || !/\d/.test(numberString)) {
      return 0;
    }
    
    // Преобразование в число
    const parsedNumber = Number(numberString);
    
    // Проверка на NaN или Infinity
    if (!Number.isFinite(parsedNumber)) {
      return 0;
    }
  
    // Округление с заданной точностью
    const multiplier = Math.pow(10, precision);
    return Math.round(parsedNumber * multiplier) / multiplier;
  }
  