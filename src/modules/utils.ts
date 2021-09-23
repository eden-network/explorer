import { ethers } from 'ethers';

const toFixedDecimals = (_numStr, _maxDec) => {
  const maxDex = _maxDec || 2;
  return (
    Math.round(parseFloat(_numStr) * 10 ** maxDex) /
    10 ** maxDex
  ).toFixed(_maxDec);
};

export const BNToGwei = (_bn) => {
  return toFixedDecimals(ethers.utils.formatUnits(_bn, 'gwei'), 2);
};

export const safeFetch = async (url, options, callback) => {
  try {
    const res: any = await fetch(url, options).catch((e) => {
      // eslint-disable-next-line no-console
      console.log(`Couldn't fetch bundles info:`, e);
      return [];
    });
    const resText = await res.text();
    if (res.status !== 200) {
      // eslint-disable-next-line no-console
      console.log('External error: ', res.status);
      return [];
    }
    const resJson = JSON.parse(resText);
    return callback(resJson);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log('Internal error:', e);
    return [];
  }
};
