import Shell from '../../components/Shell';

export default function Tx() {
  return <Shell />;
}

export async function getServerSideProps(context) {
  return {
    props: {},
    redirect: {
      destination: `https://etherscan.io/tx/${context.query.tx}`,
      permanent: false,
    },
  };
}
