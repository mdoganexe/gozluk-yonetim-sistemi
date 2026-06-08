// dexie-react-hooks yerine geçer (vite alias ile). Ortak veri katmanındaki
// değişikliklere (yerel yazım veya başka cihazdan senkron) abone olur ve sorguyu yeniden çalıştırır.
import { useState, useEffect, useRef } from 'react';
import { subscribe } from '../db/database';

export function useLiveQuery(querier, deps = []) {
  const [value, setValue] = useState(undefined);
  const ref = useRef(querier);
  ref.current = querier;

  useEffect(() => {
    let active = true;
    const run = () => {
      Promise.resolve()
        .then(() => ref.current())
        .then(v => { if (active) setValue(v); })
        .catch(() => {});
    };
    run();
    const unsub = subscribe(run);
    return () => { active = false; unsub(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return value;
}

export default { useLiveQuery };
