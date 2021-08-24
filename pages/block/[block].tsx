import { useEffect } from "react";
import { useRouter } from 'next/router'
import Shell from '../../components/Shell'

export default function Block() {
  const router = useRouter()

  useEffect(() => {
    window.location.href = `https://etherscan.io/block/${router.query.block}`;
  }, [router]);

  return (
    <Shell />
  )
}

export async function getServerSideProps() {
  return {props: {}};
}
