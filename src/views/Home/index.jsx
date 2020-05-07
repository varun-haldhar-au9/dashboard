import React from 'react'
import { useLazyQuery } from '@apollo/react-hooks'

import { useAuth } from '../../store/auth'

import { FETCH_USER } from '../../graphql'

import { StyledSection } from './styled'

const Home = () => {
   const { user } = useAuth()
   const [organization, setOrganization] = React.useState(null)
   const [fetchUser, { loading, data }] = useLazyQuery(FETCH_USER)
   React.useEffect(() => {
      if (user.email) {
         fetchUser({
            variables: {
               where: {
                  email: { _eq: user.email },
               },
            },
         })
      }
   }, [user])
   React.useEffect(() => {
      if (!loading && Array.isArray(data?.organizationAdmins)) {
         const userOrg = data.organizationAdmins[0].organization
         setOrganization({
            name: userOrg.organizationName,
         })
      }
   }, [loading, data])

   if (loading) return <div>Loading...</div>
   return (
      <div>
         <StyledSection>
            <h2>
               Hello, {user.firstName} {user.lastName}
            </h2>
            <span>Organization: {organization?.name}</span>
         </StyledSection>
      </div>
   )
}

export default Home
