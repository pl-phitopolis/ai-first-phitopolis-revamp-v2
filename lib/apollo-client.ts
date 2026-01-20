import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';

// Use proxy in development, environment variable or default URL in production
const graphqlUri = import.meta.env.DEV
  ? '/graphql'
  : import.meta.env.VITE_GRAPHQL_URL || 'http://10.43.0.43:8055/graphql';

const httpLink = new HttpLink({
  uri: graphqlUri,
});

export const apolloClient = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
    },
  },
});
