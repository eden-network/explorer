function getGraphNetworkEndpoint() {
  if (process.env.NETWORK === 'ropsten') {
    // eden-data reads mainnet env var for network
    process.env.GRAPH_MAINNET_NETWORK = process.env.GRAPH_ROPSTEN_NETWORK;
    return process.env.GRAPH_ROPSTEN_NETWORK;
  }
  if (process.env.GRAPH_MAINNET_NETWORK === undefined) {
    return 'https://api.thegraph.com/subgraphs/name/eden-network/eden-network';
  }
  return process.env.GRAPH_MAINNET_NETWORK;
}

function getCachingEnabled() {
  if (process.env.NETWORK === 'ropsten') return false;
  return process.env.CACHING_ENABLED === '1';
}

function getProviderEndpoint() {
  if (process.env.NETWORK === 'ropsten') return process.env.RPC_HTTP_ROPSTEN;
  return process.env.RPC_HTTP_MAINNET;
}

function getEtherscanEndpoint() {
  if (process.env.NETWORK === 'ropsten') return 'https://ropsten.etherscan.io';
  return 'https://etherscan.io';
}

function getEtherscanAPIEndpoint() {
  if (process.env.NETWORK === 'ropsten')
    return 'https://api-ropsten.etherscan.io/api';
  return 'https://api.etherscan.io/api';
}

export const AppConfig = {
  gcloudCacheBucket: process.env.GSTORAGE_CACHE_BUCKET || 'eden_block_insight',
  cacheBlockConfirmations: process.env.CACHE_BLOCK_CONFIRMATIONS || '10',
  tokensAPI: 'http://tokens.1inch.eth.link',
  monitorEndpointEdenRPC: 'https://api.edennetwork.io/v1/monitor',
  monitorEndpointEthermineRPC: 'https://rpc.ethermine.org/tx/',
  publicEdenAlchemyAPI:
    process.env.PUBLIC_EDEN_ALCEMY_API ||
    'https://eth-mainnet.alchemyapi.io/v2/P8rzfqKR51hxNVhF0OfA3WDiACi0phmU', // Restricted domain
  providerEndpointGraphQl: process.env.ETH_GRAPHQL_MAINNET,
  etherscanAPIKey: process.env.ETHERSCAN_API_TOKEN,
  flashbotsAPIEndpoint: process.env.FLASHBOTS_API,
  proxyAuthToken: process.env.PROXY_AUTH_TOKEN,
  network: process.env.NETWORK || 'mainnet',
  graphNetworkEndpoint: getGraphNetworkEndpoint(),
  etherscanAPIEndpoint: getEtherscanAPIEndpoint(),
  etherscanEndpoint: getEtherscanEndpoint(),
  providerEndpoint: getProviderEndpoint(),
  cachingEnabled: getCachingEnabled(),
  description: 'Eden Network block and stacking view',
  site_name: 'Eden Network Explorer',
  firstEdenBlock: 12965000,
  slotGasCap: 1.5e6,
  title: 'Home',
  locale: 'en',
  blockInsightRowColorByPriority: {
    'priority-fee': 'gray-300',
    'bundle-0': 'purple',
    'bundle-1': 'pink',
    'local-tx': 'yellow',
    stake: 'indigo',
    slot: 'green',
  },
  labelsToUI: {
    'fb-bundle': 'BUNDLE (FB)',
    'priority-fee': 'PRIORITY FEE',
    stake: 'STAKE',
    slot: 'SLOT',
    'local-tx': 'LOCAL TX',
  },
  breakpoints: {
    small: 575,
  },
  cacheBlockParams: {
    fromEdenProducer: 'boolean',
    baseFeePerGas: 'string',
    transactions: 'object',
    timestamp: 'number',
    gasLimit: 'number',
    gasUsed: 'number',
    number: 'number',
    miner: 'string',
  },
  cacheTxParams: {
    maxPriorityFee: 'string',
    gasLimit: 'number',
    gasUsed: 'number',
    status: 'number',
    txFee: 'string',
    index: 'number',
    nonce: 'number',
    from: 'string',
    hash: 'string',
    to: 'string',
  },
  minerAlias: {
    '0x00192fb10df37c9fb26829eb2cc623cd1bf599e8': '2Miners: PPLNS',
    '0x002e08000acbbae2155fab7ac01929564949070d': '2Miners: Solo',
    '0x45a36a8e118c37e4c47ef4ab827a7c9e579e11e2': 'Ant Pool',
    '0x005e288d713a5fb3d7c9cf1b43810a98688c7223': 'Xn Pool',
    '0x01ca8a0ba4a80d12a8fb6e3655688f57b16608cf': 'Spark Pool',
    '0x04668ec2f57cc15c381b461b9fedab5d451c8f7f': 'Zhizhu.top',
    '0x06b8c5883ec71bc3f4b332081519f23834c8706e': 'Mining Express',
    '0x09ab1303d3ccaf5f018cd511146b07a240c70294': 'Minerall Pool',
    '0x1ad91ee08f21be3de0ba2ba6918e714da6b45836': 'Hiveon',
    '0x1ca43b645886c98d7eb7d27ec16ea59f509cbe1a': 'ViaBTC',
    '0x249bdb4499bd7c683664c149276c1d86108e2137': 'Cruxpool',
    '0x2a5994b501e6a560e727b6c2de5d856396aadd38': 'PandaMiner',
    '0x35f61dfb08ada13eba64bf156b80df3d5b3a738d': 'Fire Pool',
    '0x3ecef08d0e2dad803847e052249bb4f8bff2d5bb': 'MiningPoolHub',
    '0x433022c4066558e7a32d850f02d2da5ca782174d': 'ALT Pool',
    '0x44fd3ab8381cc3d14afa7c4af7fd13cdc65026e1': 'Whalesburg',
    '0x4bb96091ee9d802ed039c4d1a5f6216f90f81b01': 'Ethermine',
    '0x4c549990a7ef3fea8784406c1eecc98bf4211fa5': 'Hiveon Pool',
    '0x4f9bebe3adc3c7f647c0023c60f91ac9dffa52d5': 'Crazy Pool',
    '0x52bc44d5378309ee2abf1539bf71de1b7d7be3b5': 'Nanopool',
    '0x52e44f279f4203dcf680395379e5f9990a69f13c': 'Bw Pool',
    '0x52f13e25754d822a3550d0b68fdefe9304d27ae8': 'Ethash Pool',
    '0x534cb1d3812c92894f051999dd393f1bdbdc6c87': 'HeroMiners',
    '0x5a0b54d5dc17e0aadc383d2db43b0a0d3e029c4c': 'Spark Pool',
    '0x6a7a43be33ba930fe58f34e07d0ad6ba7adb9b1f': 'Coinotron',
    '0x6a851246689eb8fc77a9bf68df5860f13f679fa0': 'ZET Technologies',
    '0x7f101fe45e6649a6fb8f3f8b43ed03d353f2b90c': 'Flexpool',
    '0x7f3b29ae0d5edae9bb148537d4ed2b12beddf8b3': 'Mat Pool',
    '0x829bd824b016326a401d083b33d092293333a830': 'F2Pool',
    '0x8595dd9e0438640b5e1254f9df579ac12a86865f': 'Ezil Pool',
    '0x98474e755c0fe94f6b396ef90236898538146490': 'WoolyPooly',
    '0x99c85bb64564d9ef9a99621301f22c9993cb89e3': 'BeePool',
    '0x9d6d492bd500da5b33cf95a5d610a73360fcaaa0': 'Huobi Pool',
    '0xa1b7326d90a4d796ef0992a3fb4ef0702bf372ea': 'Wooly Pool',
    '0xa3c084ae80a3f03963017669bc696e961d3ae5d5': 'Uleypool',
    '0xa42af2c70d316684e57aefcc6e393fecb1c7e84e': 'Coinotron',
    '0xa65344f7d22ee4382416c088a03000f116a3f0c7': 'C3 Pool',
    '0xa7b0536fb02c593b0dfd82bd65aacbdd19ae4777': 'Poolin',
    '0xae17a0398694c94d4f861c5aa1b215adbf0d48b5': 'Fame',
    '0xb3b7874f13387d44a3398d298b075b7a3505d8d4': 'Spark Pool',
    '0xb6cf40aee9990c25d7d6193952af222e120b31c2': 'FK Pool',
    '0xbbbbbbbb49459e69878219f906e73aa325ff2f0c': 'Mining DAO',
    '0xc4aeb20798368c48b27280847e187bb332b9bc77': 'Easy2Mine',
    '0xcf6ce585cb4a78a6f96e6c8722927161a696f337': 'MaxHash',
    '0xd0db3c9cf4029bac5a9ed216cd174cba5dbf047c': 'HashON Pool',
    '0xd144e30a0571aaf0d0c050070ac435deba461fab': 'ClonaNetwork',
    '0xd224ca0c819e8e97ba0136b3b95ceff503b79f53': 'UUPool',
    '0xe206e3dca498258f1b7eec1c640b5aee7bb88fd0': 'Spark Pool',
    '0xea674fdde714fd979de3edf0f56aa9716b898ec8': 'Ethermine',
    '0xeea5b82b61424df8020f5fedd81767f2d0d25bfb': 'BTC.com Pool',
    '0xf20b338752976878754518183873602902360704': 'F2Pool',
    '0xf35074bbd0a9aee46f4ea137971feec024ab704e': 'Solo Pool',
    '0xf64f9720cfcb59ca4f5f45e6fdb3f68b875b7295': 'ICanMining.ru',
    '0xf8b483dba2c3b7176a3da549ad41a48bb3121069': 'Coinotron',
  },
};
