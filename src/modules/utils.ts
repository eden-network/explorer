import { ethers } from 'ethers';

export const getChecksumAddress = (_address) => {
  return ethers.utils.getAddress(_address);
};

export const makeArrayUnique = (a) => a.filter((e, p) => a.indexOf(e) === p);

export const BNToGwei = (_bn, _pre = 2) => {
  return parseFloat(
    parseFloat(ethers.utils.formatUnits(_bn, 'gwei')).toPrecision(_pre)
  );
};

export const formatWei = (_wei, _pre = 2) => {
  const base = _wei.toString().startsWith('0x') ? 16 : 10;
  const intVal = parseInt(_wei, base);
  if (intVal === 0) {
    return { value: '0', unit: 'Wei' };
  }
  if (intVal >= 1e16) {
    return { value: (intVal / 1e18).toFixed(_pre), unit: 'Eth' };
  }
  if (intVal >= 1e5) {
    return { value: (intVal / 1e9).toFixed(_pre), unit: 'Gwei' };
  }
  return { value: intVal.toFixed(_pre), unit: 'Wei' };
};

export const weiToGwei = (_wei, _pre = 2) => {
  const base = _wei.toString().startsWith('0x') ? 16 : 10;
  return parseFloat((parseInt(_wei, base) / 1e9).toPrecision(_pre));
};

export const weiToETH = (_wei, _pre = 2) => {
  const base = _wei.toString().startsWith('0x') ? 16 : 10;
  return parseFloat((parseInt(_wei, base) / 1e18).toPrecision(_pre));
};

export const gweiToETH = (_wei, _pre = 2) => {
  const base = _wei.toString().startsWith('0x') ? 16 : 10;
  return parseFloat((parseInt(_wei, base) / 1e9).toPrecision(_pre));
};

export const safeParseResponse = async (_resObj) => {
  const parsed = await _resObj.text();
  try {
    return JSON.parse(parsed);
  } catch (e) {
    if (_resObj.status !== 200) {
      throw new Error(
        `REST request failed with status ${_resObj.status}: \n${parsed}`
      );
    }
    return parsed;
  }
};

export const safeFetch = async (url, options, callback) => {
  const handleFailResponse = (_res) => callback({ success: false, res: _res });
  try {
    const res: any = await fetch(url, options).catch((e) => {
      // eslint-disable-next-line no-console
      console.error(`REST call failed:`, e);
      return handleFailResponse(e);
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
    throw new Error(`RPC request failed: ${JSON.stringify(error)}`);
  }
  return result;
};

export const sleep = async (_ms) => {
  return new Promise((resolve) => setTimeout(resolve, _ms));
};
export const decodeERC20Transfers = (_logs) => {
  const erc20TransferTopic =
    '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';
  const decodeRaw = (_log) => {
    return {
      address: _log.address,
      args: {
        from: ethers.utils.getAddress(`0x${_log.topics[1].slice(26)}`),
        to: ethers.utils.getAddress(`0x${_log.topics[2].slice(26)}`),
        value:
          _log.data === '0x'
            ? '0x'
            : ethers.BigNumber.from(_log.data).toHexString(),
      },
    };
  };
  const transfers = [];
  _logs.forEach((log) => {
    if (log.topics[0] === erc20TransferTopic) {
      transfers.push(decodeRaw(log));
    }
  });
  return transfers;
};
