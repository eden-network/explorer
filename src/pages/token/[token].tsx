import Shell from '../../components/Shell';

export default function Token() {
  return <Shell />;
}

export async function getServerSideProps(context) {
  return {
    props: {},
    redirect: {
      destination: `https://etherscan.io/token/${context.query.token}`,
      permanent: false,
    },
  };
}
