import { useEffect, useRef } from 'react';

function usePrevious<T>(value: T): T {
  const ref = useRef<T>();
  useEffect(() => {
    console.log('value changes', { value });
    ref.current = value;
  }, [value]);
  return ref.current as T;
}

export default usePrevious;
