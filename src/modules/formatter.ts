export const formatTxHash = (tx) => {
  return `${tx.slice(0, 6)}...${tx.slice(tx.length - 4, tx.length)}`;
};

export const formatAddress = (add) => {
  return `${add.slice(0, 5)}...${add.slice(add.length - 3, add.length)}`;
};
