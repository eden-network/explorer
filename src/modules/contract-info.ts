import { ethers } from 'ethers';

import { safeReadFromBucket, safeWriteToBucket } from './gcloud-cache';
import { fetchContractInfo, checkIfContractlike } from './getters';

const getContractInfo = async (_address) => {
  // Look into cache
  const { error, result } = await safeReadFromBucket(
    'contracts',
    _address.toLowerCase()
  );
  if (error) {
    console.error(`Couldn't read from storage`);
  }
  if (result) {
    return result;
  }
  // API call
  const contractInfo = await fetchContractInfo(_address);
  if (contractInfo) {
    if (contractInfo.isProxy) {
      // Cache implementation abi for proxy contracts
      const proxyInfo = await getContractInfo(contractInfo.implementation);
      if (proxyInfo.abi) {
        contractInfo.abi = proxyInfo.abi;
      }
    }
    // Write to cache only if abi is known
    if (contractInfo.abi) {
      safeWriteToBucket('contracts', _address.toLowerCase(), contractInfo);
    }
    return contractInfo;
  }
  return {};
};

function decryptTxCalldata(_abi, _txRequest) {
  const abi = new ethers.utils.Interface(_abi);
  try {
    const decryptedTx = abi.parseTransaction(_txRequest);
    if (decryptedTx) {
      const handleArgVal = (_arg) => {
        if (Array.isArray(_arg) && ethers.BigNumber.isBigNumber(_arg[0])) {
          return _arg.map((e) => e.toHexString());
        }
        if (ethers.BigNumber.isBigNumber(_arg)) {
          return _arg.toHexString();
        }
        return _arg;
      };
      const args = decryptedTx.functionFragment.inputs.map((param) => ({
        val: handleArgVal(decryptedTx.args[param.name]),
        type: param.type,
        key: param.name,
      }));
      const formattedTx = {
        signature: decryptedTx.signature,
        method: decryptedTx.name,
        args,
      };
      return formattedTx;
    }
    return null;
  } catch (e) {
    console.error('Unable to parse tx', e);
    return null;
  }
}

export const decodeTx = async (_txRequest) => {
  // Check if contract-like
  const contractLike = await checkIfContractlike(_txRequest.to);
  const response = { contractName: null, parsedCalldata: null };
  if (contractLike) {
    // Try to obtain contract info
    const { abi, contractName } = await getContractInfo(_txRequest.to);
    response.contractName = contractName;
    if (abi) {
      response.parsedCalldata = decryptTxCalldata(abi, _txRequest);
    }
  }
  return response;
};
