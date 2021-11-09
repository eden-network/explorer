import { Meta } from '../../layout/Meta';
import Shell from '../../layout/Shell';
import { AppConfig } from '../../utils/AppConfig';

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
      destination: `${AppConfig.etherscanEndpoint}/token/${context.query.token}`,
      permanent: false,
    },
  };
}
