export const AppConfig = {
  site_name: 'Eden Network Explorer',
  title: 'Home',
  description: 'Eden Network block and stacking view',
  locale: 'en',
  graphNetworkEndpoint:
    process.env.GRAPH_MAINNET_NETWORK ||
    'https://api.thegraph.com/subgraphs/name/eden-network/eden-network',
  gcloudCacheBucket: process.env.GSTORAGE_CACHE_BUCKET || 'eden_block_insight',
  cacheBlockConfirmations: process.env.CACHE_BLOCK_CONFIRMATIONS || '10',
  providerEndpoint: process.env.RPC_HTTP_MAINNET,
  flashbotsAPIEndpoint: process.env.FLASHBOTS_API,
  proxyAuthToken: process.env.PROXY_AUTH_TOKEN,
  network: process.env.NETWORK || 'mainnet',
  blockInsightRowColorByPriority: {
    'priority-fee': 'gray-300',
    'bundle-0': 'purple',
    'bundle-1': 'pink',
    stake: 'yellow',
    slot: 'indigo',
  },
  labelsToUI: {
    'fb-bundle': 'BUNDLE (FB)',
    'priority-fee': 'PRIORITY FEE',
    stake: 'STAKE',
    slot: 'SLOT',
  },
  breakpoints: {
    small: 575,
  },
  cacheBlockInsightParams: {
    fromEdenProducer: 'boolean',
    baseFeePerGas: 'string',
    transactions: 'object',
    timestamp: 'number',
    gasLimit: 'number',
    gasUsed: 'number',
    number: 'number',
    miner: 'string',
  },
};
