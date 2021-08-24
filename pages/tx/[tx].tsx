import { useEffect } from "react";
import { useRouter } from 'next/router'
import Shell from '../../components/Shell'

export default function Tx() {
  const router = useRouter()

  useEffect(() => {
    window.location.href = `https://etherscan.io/tx/${router.query.tx}`;
  }, [router]);

  return (
    <Shell />
  )
}

export async function getServerSideProps() {
  return {props: {}};
}
