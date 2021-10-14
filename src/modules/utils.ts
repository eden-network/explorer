import { ethers } from 'ethers';

const toFixedDecimals = (_numStr, _maxDec) => {
  const maxDex = _maxDec || 2;
  return (
    Math.round(parseFloat(_numStr) * 10 ** maxDex) /
    10 ** maxDex
  ).toFixed(_maxDec);
};

export const getChecksumAddress = (_address) => {
  return ethers.utils.getAddress(_address);
};

export const makeArrayUnique = (a) => a.filter((e, p) => a.indexOf(e) === p);

export const BNToGwei = (_bn) => {
  return toFixedDecimals(ethers.utils.formatUnits(_bn, 'gwei'), 2);
};

export const weiToGwei = (_wei) => {
  const base = _wei.toString().startsWith('0x') ? 16 : 10;
  return Math.round(parseInt(_wei, base) / 1e9);
};

export const weiToETH = (_wei) => {
  const base = _wei.toString().startsWith('0x') ? 16 : 10;
  return Math.round(parseInt(_wei, base) / 1e18);
};

export const safeFetch = async (url, options, callback) => {
  const failResponse = [false, []];
  try {
    const res: any = await fetch(url, options).catch((e) => {
      // eslint-disable-next-line no-console
      console.log(`REST call failed:`, e);
      return failResponse;
    });
    const resText = await res.text();
    if (res.status !== 200) {
      // eslint-disable-next-line no-console
      console.log('REST call failed due to external error: ', res.status);
      return failResponse;
    }
    const resJson = JSON.parse(resText);
    const callbackRes = await callback(resJson);
    return [true, callbackRes];
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log('REST call failed due to internal error:', e);
    return failResponse;
  }
};

export const sendRawJsonRPCRequest = async (_method, _params, _provider) => {
  const { result, error } = await fetch(_provider, {
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      params: _params,
      method: _method,
      jsonrpc: '2.0',
      id: Date.now(),
    }),
    method: 'post',
  }).then((r) => r.json());
  if (error) {
    throw new Error(`RPC request failed: ${error}`);
  }
  return result;
};
