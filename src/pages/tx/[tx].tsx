import TransactionPage from '../../components/TransactionPage';
import { Meta } from '../../layout/Meta';
import Shell from '../../layout/Shell';
import { getTransactionInfo } from '../../modules/tx-info';
import { validate } from '../../modules/validator/transaction';

export default function Tx({ txInfo }) {
  return (
    <Shell
      meta={
        <Meta
          title="Block List"
          description="Eden Network Explorer Block List Page"
        />
      }
    >
      <div className="max-w-4xl mx-auto grid gap-5">
        <div className="flex flex-col rounded-lg shadow-lg overflow-hidden bg-blue">
          <div className="p-3 flex-1 sm:p-6 flex flex-col justify-between">
            <div className="flex-1 mt-4">
              <TransactionPage txInfo={txInfo} />
            </div>
          </div>
        </div>
      </div>
    </Shell>
  );
}

export async function getServerSideProps(context) {
  const txHash = context.query.tx;
  if (validate(txHash)) {
    const txInfo = await getTransactionInfo(txHash);
    if (txInfo !== null) {
      return { props: { txInfo } };
    }
  }
  return {
    props: {},
    redirect: {
      destination: `https://etherscan.io/tx/${context.query.tx}`,
      permanent: false,
    },
  };
}
