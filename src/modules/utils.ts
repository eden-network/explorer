import { ethers } from 'ethers';

const toFixedDecimals = (_numStr, _maxDec) => {
  const maxDex = _maxDec || 2;
  return (
    Math.round(parseFloat(_numStr) * 10 ** maxDex) /
    10 ** maxDex
  ).toFixed(_maxDec);
};

export const makeArrayUnique = (a) => a.filter((e, p) => a.indexOf(e) === p);

export const BNToGwei = (_bn) => {
  return toFixedDecimals(ethers.utils.formatUnits(_bn, 'gwei'), 2);
};

export const weiToGwei = (_wei) => {
  const base = _wei.toString().startsWith('0x') ? 16 : 10;
  return Math.round(parseInt(_wei, base) / 1e9);
};

export const safeParseResponse = async (_resObj) => {
  const parsed = await _resObj.text();
  try {
    return JSON.parse(parsed);
  } catch (e) {
    return parsed;
  }
};

export const safeFetch = async (url, options, callback) => {
  const handleFailResponse = (_res) => callback({ success: false, res: _res });
  try {
    const res: any = await fetch(url, options).catch((e) => {
      // eslint-disable-next-line no-console
      console.error(`REST call failed:`, e);
      return handleFailResponse(res);
    });
    const resText = await res.text();
    if (res.status !== 200) {
      // eslint-disable-next-line no-console
      console.error('REST call failed due to external error: ', resText);
      return handleFailResponse(resText);
    }
    const resJson = JSON.parse(resText);
    return callback({ success: true, res: resJson });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('REST call failed due to internal error:', e);
    return handleFailResponse(e);
  }
};
