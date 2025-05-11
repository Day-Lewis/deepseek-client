import { ApolloClient, InMemoryCache, HttpLink, split } from '@apollo/client';
import { getMainDefinition } from '@apollo/client/utilities';

// 你的GraphQL API endpoint
const httpLink = new HttpLink({
  uri: 'https://lewis-cloudflare-worker.lewis-cn-5656.workers.dev' // 替换为你的Cloudflare Worker URL
});

// 创建Apollo客户端
const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'no-cache',
      errorPolicy: 'all',
    },
    query: {
      fetchPolicy: 'no-cache',
      errorPolicy: 'all',
    },
  }
});

export default client;