import { useEffect } from "react";
import { useRouter } from 'next/router'
import Shell from '../../components/Shell'

export default function Token() {
  const router = useRouter()

  useEffect(() => {
    window.location.href = `https://etherscan.io/token/${router.query.token}`;
  }, [router]);

  return (
    <Shell />
  )
}

export async function getServerSideProps() {
  return {props: {}};
}
