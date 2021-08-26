import Shell from '../../components/Shell'

export default function Block() {
  return <Shell />;
}

export async function getServerSideProps(context) {
  return {
    props: {},
    redirect: {
      destination: `https://etherscan.io/block/${context.query.block}`,
      permanent: false
    }
  };
}
