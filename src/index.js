import React from 'react'
import ReactDOM from 'react-dom'

import { ApolloClient } from 'apollo-client'
import { setContext } from 'apollo-link-context'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { HttpLink } from 'apollo-link-http'
import { split } from 'apollo-link'
import { WebSocketLink } from 'apollo-link-ws'
import { getMainDefinition } from 'apollo-utilities'
import { ApolloProvider } from '@apollo/react-hooks'

import App from './App'

import { AuthProvider } from './store/auth'
import { TabProvider } from './store/tabs'
import { UserProvider } from './store/user'

import './index.css'
import './styles.css'

const authLink = setContext((_, { headers }) => {
   return {
      headers: {
         ...headers,
         'x-hasura-admin-secret': `${process.env.REACT_APP_ADMIN_SECRET}`,
      },
   }
})

const wsLink = new WebSocketLink({
   uri: process.env.REACT_APP_DAILYCLOAK_SUBS_URL,
   options: {
      reconnect: true,
      connectionParams: {
         headers: {
            'x-hasura-admin-secret': `${process.env.REACT_APP_ADMIN_SECRET}`,
         },
      },
   },
})

const httpLink = new HttpLink({
   uri: process.env.REACT_APP_DAILYCLOAK_URL,
})

const link = split(
   ({ query }) => {
      const definition = getMainDefinition(query)
      return (
         definition.kind === 'OperationDefinition' &&
         definition.operation === 'subscription'
      )
   },
   wsLink,
   authLink.concat(httpLink)
)

const client = new ApolloClient({
   link,
   cache: new InMemoryCache(),
})

ReactDOM.render(
   <AuthProvider>
      <ApolloProvider client={client}>
         <UserProvider>
            <TabProvider>
               <App />
            </TabProvider>
         </UserProvider>
      </ApolloProvider>
   </AuthProvider>,
   document.getElementById('root')
)
