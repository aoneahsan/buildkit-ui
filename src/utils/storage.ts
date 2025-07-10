import { Preferences } from '@capacitor/preferences';

/**
 * Storage utility for cross-platform storage operations
 */
export class Storage {
  /**
   * Set a value in storage
   */
  static async set(key: string, value: any): Promise<void> {
    const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
    await Preferences.set({ key, value: stringValue });
  }

  /**
   * Get a value from storage
   */
  static async get<T = any>(key: string): Promise<T | null> {
    const { value } = await Preferences.get({ key });
    
    if (!value) return null;

    try {
      return JSON.parse(value) as T;
    } catch {
      return value as any;
    }
  }

  /**
   * Remove a value from storage
   */
  static async remove(key: string): Promise<void> {
    await Preferences.remove({ key });
  }

  /**
   * Clear all storage
   */
  static async clear(): Promise<void> {
    await Preferences.clear();
  }

  /**
   * Get all keys in storage
   */
  static async keys(): Promise<string[]> {
    const { keys } = await Preferences.keys();
    return keys;
  }

  /**
   * Check if a key exists
   */
  static async has(key: string): Promise<boolean> {
    const { value } = await Preferences.get({ key });
    return value !== null;
  }
}