import { ethers } from 'ethers';

import { safeReadFromBucket, safeWriteToBucket } from './gcloud-cache';
import {
  fetchContractInfo,
  checkIfContractlike,
  fetchMethodSig,
} from './getters';

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
    if (
      contractInfo.isProxy &&
      contractInfo.implementation !== _address.toLowerCase()
    ) {
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

function handleArgVal(_arg) {
  if (Array.isArray(_arg) && ethers.BigNumber.isBigNumber(_arg[0])) {
    return _arg.map((e) => e.toHexString());
  }
  if (ethers.BigNumber.isBigNumber(_arg)) {
    return _arg.toHexString();
  }
  return _arg;
}

function decodeCalldataABI(_abi, _data) {
  const abi = new ethers.utils.Interface(_abi);
  try {
    const decodeedTx = abi.parseTransaction({ data: _data });
    if (decodeedTx) {
      const args = decodeedTx.functionFragment.inputs.map((param) => ({
        val: handleArgVal(decodeedTx.args[param.name]),
        type: param.type,
        key: param.name,
      }));
      const formattedTx = {
        textSig: decodeedTx.signature,
        hexSig: decodeedTx.sighash,
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

async function decodeCalldataRaw(_calldata) {
  const methodSigHex = _calldata.slice(0, 10);
  const dataOnlyHex = `0x${_calldata.slice(10)}`;
  const response = await fetchMethodSig(methodSigHex);
  for (const res of response.results) {
    const paramTypes = res.text_signature
      .slice(0, res.text_signature.length - 1)
      .split('(')[1]
      .split(',');
    try {
      const args = ethers.utils.defaultAbiCoder
        .decode(paramTypes, dataOnlyHex)
        .map((v, i) => ({
          val: handleArgVal(v),
          type: paramTypes[i],
          key: i,
        }));
      // Check if the decoding is correct - with method collision it is possible only subset of calldata was used
      const reconstructedCalldata =
        methodSigHex +
        ethers.utils.defaultAbiCoder
          .encode(
            args.map((arg) => arg.type),
            args.map((arg) => arg.val)
          )
          .slice(2);
      if (reconstructedCalldata === _calldata) {
        const formattedTx = {
          textSig: res.text_signature,
          hexSig: methodSigHex,
          args,
        };
        return formattedTx;
      }
    } catch (_) {} // eslint-disable-line no-empty
  }
  return null;
}

export const decodeTx = async (_to, _data) => {
  // Check if contract-like
  const contractLike = await checkIfContractlike(_to);
  const response = { contractName: null, parsedCalldata: null };
  if (contractLike) {
    // Try to obtain contract info
    const { abi, contractName } = await getContractInfo(_to);
    if (contractName) {
      response.contractName = contractName;
    }
    if (abi) {
      response.parsedCalldata = decodeCalldataABI(abi, _data);
    } else {
      response.parsedCalldata = await decodeCalldataRaw(_data);
    }
  }
  return response;
};
