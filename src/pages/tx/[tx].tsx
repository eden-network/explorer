import { Meta } from '../../layout/Meta';
import Shell from '../../layout/Shell';

export default function Tx() {
  return (
    <Shell
      meta={
        <Meta
          title="Transaction"
          description="Eden Network Explor Transaction Page"
        />
      }
    />
  );
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
