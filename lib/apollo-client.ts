import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';

// Use Vite proxy in development, Netlify function in production
const graphqlUri = import.meta.env.DEV
  ? '/graphql'
  : '/.netlify/functions/graphql';

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
