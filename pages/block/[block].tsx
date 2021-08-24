import { useEffect } from "react";
import { useRouter } from 'next/router'

export default function Block() {
  const router = useRouter()

  useEffect(() => {
    window.location.href = `https://etherscan.io/block/${router.query.block}`;
  }, [router]);

  return (
    <main className="bg-blue">
    </main>
  )
}

export async function getServerSideProps() {
  return {props: {}};
}
