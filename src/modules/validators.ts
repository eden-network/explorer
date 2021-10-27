export const validateAddress = (_address) =>
  /^(0x)?[0-9A-F]{40}$/.test(_address);
export const validateTxHash = (_hash) => /^0x[A-Fa-f0-9]{64}$/i.test(_hash);
export const validateBlockNum = (_blockNum) => /^\d{1,9}$/.test(_blockNum);
export const validateEns = (_ens) => /^.*\.eth/.test(_ens);
