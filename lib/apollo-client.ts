import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';

// Use Vite proxy in development, Directus directly in production
const graphqlUri = import.meta.env.DEV
  ? '/graphql'
  : 'https://directus.phitopolis.io/graphql';

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
