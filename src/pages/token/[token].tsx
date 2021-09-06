import { Meta } from '../../layout/Meta';
import Shell from '../../layout/Shell';

export default function Token() {
  return (
    <Shell
      meta={
        <Meta title="Token" description="Eden Network Explorer Token Page" />
      }
    />
  );
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
