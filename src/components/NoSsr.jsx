import { useEffect, useState } from 'react';

export default function NoSsr({ children }) {
  const [isMounted, setMount] = useState(false);

  useEffect(() => {
    setMount(true);
  }, []);

  if (isMounted) return children;
  return null;
}
