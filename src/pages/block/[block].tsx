import { Meta } from '../../layout/Meta';
import Shell from '../../layout/Shell';

export default function Block() {
  return (
    <Shell
      meta={<Meta title="Block" description="Eden Network Explor Block Page" />}
    />
  );
}

export async function getServerSideProps(context) {
  return {
    props: {},
    redirect: {
      destination: `https://etherscan.io/block/${context.query.block}`,
      permanent: false,
    },
  };
}
