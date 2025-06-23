/**
 * Common utility functions for score calculations and data processing
 * Used across various hooks for financial data analysis
 */

/**
 * Standard error interface for consistent error handling
 */
export interface ScoreError {
  message: string;
  code?: string;
  timestamp: Date;
}

/**
 * Creates a standardized error object
 * 
 * @param message - Error message
 * @param code - Optional error code
 * @returns Standardized error object
 */
export const createScoreError = (message: string, code?: string): ScoreError => ({
  message,
  code,
  timestamp: new Date(),
});

/**
 * Calculates the median value from an array of numbers
 * 
 * @param values - Array of numeric values
 * @returns The median value, or 0 if array is empty
 * 
 * @example
 * ```ts
 * calculateMedian([1, 2, 3, 4, 5]); // returns 3
 * calculateMedian([1, 2, 3, 4]); // returns 2.5
 * ```
 */
export const calculateMedian = (values: number[]): number => {
  if (values.length === 0) return 0;
  
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  
  return sorted.length % 2 !== 0
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2;
};

/**
 * Calculates the mean (average) value from an array of numbers
 * 
 * @param values - Array of numeric values
 * @returns The mean value, or 0 if array is empty
 */
export const calculateMean = (values: number[]): number => {
  if (values.length === 0) return 0;
  return values.reduce((sum, val) => sum + val, 0) / values.length;
};

/**
 * Normalizes a value to a 0-100 scale
 * 
 * @param value - The value to normalize
 * @param min - Minimum value of the input range
 * @param max - Maximum value of the input range
 * @returns Normalized value between 0 and 100
 * 
 * @example
 * ```ts
 * normalizeToScale(0.5, 0, 1); // returns 50
 * normalizeToScale(75, 0, 150); // returns 50
 * ```
 */
export const normalizeToScale = (value: number, min: number, max: number): number => {
  if (max === min) return 0;
  const normalized = ((value - min) / (max - min)) * 100;
  return Math.max(0, Math.min(100, Math.round(normalized)));
};

/**
 * Validates if a value is a valid number
 * 
 * @param value - Value to validate
 * @returns True if the value is a valid number
 */
export const isValidNumber = (value: unknown): value is number => {
  return typeof value === 'number' && !isNaN(value) && isFinite(value);
};

/**
 * Safely parses a string to a number
 * 
 * @param value - String value to parse
 * @param defaultValue - Default value if parsing fails
 * @returns Parsed number or default value
 */
export const safeParseNumber = (value: string, defaultValue: number = 0): number => {
  const parsed = parseFloat(value);
  return isValidNumber(parsed) ? parsed : defaultValue;
};

/**
 * Clamps a number between min and max values
 * 
 * @param value - Value to clamp
 * @param min - Minimum allowed value
 * @param max - Maximum allowed value
 * @returns Clamped value
 */
export const clamp = (value: number, min: number, max: number): number => {
  return Math.max(min, Math.min(max, value));
};

/**
 * Calculates percentage confidence based on sample size
 * 
 * @param sampleSize - Number of samples
 * @param totalSize - Total possible samples
 * @returns Confidence percentage (0-100)
 */
export const calculateConfidence = (sampleSize: number, totalSize: number): number => {
  if (totalSize === 0) return 0;
  return Math.round((sampleSize / totalSize) * 100);
};

/**
 * Debounces API calls to prevent excessive requests
 * 
 * @param func - Function to debounce
 * @param delay - Delay in milliseconds
 * @returns Debounced function
 */
export const debounce = <T extends (...args: unknown[]) => unknown>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

/**
 * Creates a standardized fetch wrapper with error handling
 * 
 * @param url - URL to fetch
 * @param options - Fetch options
 * @returns Promise with typed response or throws ScoreError
 */
export const fetchWithErrorHandling = async <T = unknown>(
  url: string,
  options?: RequestInit
): Promise<T> => {
  try {
    const response = await fetch(url, options);
    
    if (!response.ok) {
      throw createScoreError(
        `HTTP ${response.status}: ${response.statusText}`,
        response.status.toString()
      );
    }
    
    return await response.json();
  } catch (error) {
    if (error instanceof Error) {
      throw createScoreError(error.message);
    }
    throw createScoreError('Unknown fetch error occurred');
  }
}; 