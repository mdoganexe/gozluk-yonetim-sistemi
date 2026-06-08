import { useLiveQuery } from 'dexie-react-hooks';
import db, { SETTINGS_DEFAULTS } from '../db/database';

/**
 * Ayarları canlı olarak okuyan hook. settings tablosundaki key/value
 * satırlarını varsayılanlarla birleştirir. kdvOrani sayısal döner.
 */
export function useSettings() {
  const rows = useLiveQuery(() => db.settings.toArray());
  const settings = { ...SETTINGS_DEFAULTS };
  if (rows) {
    rows.forEach(s => { settings[s.key] = s.value; });
  }
  settings.kdvOrani = parseFloat(settings.kdvOrani) || 0;
  return settings;
}
