import React from 'react'
import axios from 'axios'
import styled from 'styled-components'
import { Gif } from '@giphy/react-components'
import { useLocation } from 'react-router-dom'
import { GiphyFetch } from '@giphy/js-fetch-api'
import { useMutation, useSubscription } from '@apollo/react-hooks'

import { useTabs } from '../../store/tabs'
import { UserContext } from '../../store/user'

import { StyledSection, StyledIllo, StyledButton } from './styled'

import { Modal } from '../../components'

import { INITIATE_SETUP, INSTANCE_STATUS } from '../../graphql'

const Home = () => {
   const { addTab } = useTabs()
   const location = useLocation()
   const { state: user } = React.useContext(UserContext)
   const [status, setStatus] = React.useState(null)
   const { data: { organization = {} } = {} } = useSubscription(
      INSTANCE_STATUS,
      {
         variables: { id: user.organization.id },
      }
   )

   React.useEffect(() => {
      if (organization?.instanceStatus) {
         setStatus(organization.instanceStatus)
      }
   }, [organization])

   React.useEffect(() => {
      if (location.search.includes('code')) {
         const code = new URLSearchParams(location.search).get('code')
         ;(async () => {
            if (code.length > 0 && user?.organization?.id) {
               await axios.get(
                  `${process.env.REACT_APP_DAILYKEY_URL}/api/account-id/?code=${code}&org_id=${user?.organization?.id}`
               )
            }
         })()
      }
   }, [user.organization, location])

   return (
      <div>
         <StyledSection>
            <div className="flex justify-between">
               <section>
                  <h2>Hello, {user.name}</h2>
                  <span>Organization: {user.organization.name}</span>
               </section>
               <a
                  target="__blank"
                  rel="noopener noreferrer"
                  href={`http://${user.organization.url}/desktop`}
                  className="border border-green-300 hover:border-green-500 hover:bg-green-500 hover:text-white rounded flex items-center px-3 h-10"
               >
                  Go to DailyOS
               </a>
            </div>
            <hr className="mt-2 mb-4" />
            <h3 className="text-sm font-medium uppercase tracking-wider text-gray-500 mb-2">
               Sections
            </h3>
            <main className="grid grid-cols-2 gap-2">
               <div
                  tabIndex="0"
                  role="button"
                  className="border border-l-4 rounded p-3 focus:outline-none focus:border-teal-600 hover:border-teal-600"
                  onClick={() => addTab('Account', '/account')}
                  onKeyDown={e =>
                     [32, 13].includes(e.keyCode) &&
                     addTab('Account', '/account')
                  }
               >
                  <h1 className="text-xl text-teal-800">Account</h1>
                  <p className="text-gray-500">View your account details.</p>
               </div>
               <div
                  tabIndex="0"
                  role="button"
                  className="border border-l-4 rounded p-3 focus:outline-none focus:border-teal-600 hover:border-teal-600"
                  onClick={() => addTab('Instance', '/dailyos')}
                  onKeyDown={e =>
                     [32, 13].includes(e.keyCode) &&
                     addTab('Instance', '/dailyos')
                  }
               >
                  <h1 className="text-xl text-teal-800">Daily OS</h1>
                  <p className="text-gray-500">View your dailyos details.</p>
               </div>
               <div
                  tabIndex="0"
                  role="button"
                  className="border border-l-4 rounded p-3 focus:outline-none focus:border-teal-600 hover:border-teal-600"
                  onClick={() =>
                     addTab('Delivery Partnerships', '/partnerships/delivery')
                  }
                  onKeyDown={e =>
                     [32, 13].includes(e.keyCode) &&
                     addTab('Delivery Partnerships', '/partnerships/delivery')
                  }
               >
                  <h1 className="text-xl text-teal-800">
                     Delivery Partnerships
                  </h1>
                  <p className="text-gray-500">
                     View your delivery partnerships details.
                  </p>
               </div>
               <div
                  tabIndex="0"
                  role="button"
                  className="border border-l-4 rounded p-3 focus:outline-none focus:border-teal-600 hover:border-teal-600"
                  onClick={() => addTab('Payment', '/payment')}
                  onKeyDown={e =>
                     [32, 13].includes(e.keyCode) &&
                     addTab('Payment', '/payment')
                  }
               >
                  <h1 className="text-xl text-teal-800">Payment</h1>
                  <p className="text-gray-500">Manage your payments account.</p>
               </div>
               <div
                  tabIndex="0"
                  role="button"
                  className="border border-l-4 rounded p-3 focus:outline-none focus:border-teal-600 hover:border-teal-600"
                  onClick={() => addTab('Device Hub', '/device')}
                  onKeyDown={e =>
                     [32, 13].includes(e.keyCode) &&
                     addTab('Device Hub', '/device')
                  }
               >
                  <h1 className="text-xl text-teal-800">Device Hub</h1>
                  <p className="text-gray-500">Manage your device account.</p>
               </div>
               <div
                  tabIndex="0"
                  role="button"
                  className="border border-l-4 rounded p-3 focus:outline-none focus:border-teal-600 hover:border-teal-600"
                  onClick={() =>
                     addTab('Email Integrations', '/email-integrations')
                  }
                  onKeyDown={e =>
                     [32, 13].includes(e.keyCode) &&
                     addTab('Email Integrations', '/email-integrations')
                  }
               >
                  <h1 className="text-xl text-teal-800">Email Integrations</h1>
                  <p className="text-gray-500">
                     Manage your email integrations.
                  </p>
               </div>
            </main>

            {status && status !== 'SETUP_COMPLETED' && <InitiateModal />}
         </StyledSection>
      </div>
   )
}

export default Home

const giphy = new GiphyFetch(process.env.REACT_APP_GIPHY_KEY)

const InitiateModal = () => {
   const [gifs, setGifs] = React.useState([])
   const [current, setCurrent] = React.useState(0)
   const [initiateSetup] = useMutation(INITIATE_SETUP)
   const { state: user } = React.useContext(UserContext)
   const [isClicked, setIsClicked] = React.useState(false)

   React.useEffect(() => {
      ;(async () => {
         try {
            const gifs = [
               { tag: 'launch', id: 'tXLpxypfSXvUc' },
               { tag: 'waiting', id: 'tXL4FHPSnVJ0A' },
               { tag: 'popcorn', id: 'nWg4h2IK6jYRO' },
               { tag: 'bean watch', id: 'QBd2kLB5qDmysEXre9' },
               { tag: 'dancing', id: 'F9hQLAVhWnL56' },
               { tag: 'pigeon walking', id: '3o7WTEpjuzzkhNYCMU' },
               { tag: 'celebrate', id: 'lMameLIF8voLu8HxWV' },
            ]

            const gifsData = await Promise.all(
               gifs.map(async gif => {
                  const { data } = await giphy.gif(gif.id)
                  return data
               })
            )
            setGifs(gifsData)
         } catch (error) {
            console.log(error.message)
         }
      })()
   }, [])

   React.useEffect(() => {
      const interval = setInterval(() => {
         const next = (current + 1) % gifs.length
         setCurrent(next)
      }, 10000)
      return () => clearInterval(interval)
   }, [current, gifs])

   return (
      <Modal>
         <div className="text-center">
            <StyledIllo>
               {gifs.length > 0 && <Gif gif={gifs[current]} width={420} />}
               <StyledCredit>
                  <img src="/giphy.png" alt="Powered by Giphy" />
               </StyledCredit>
            </StyledIllo>
            {!isClicked && (
               <StyledButton
                  onClick={() =>
                     setIsClicked(true) ||
                     initiateSetup({
                        variables: {
                           instanceRequested: true,
                           email: { _eq: user.email },
                        },
                     })
                  }
               >
                  Initiate Setup
               </StyledButton>
            )}
         </div>
      </Modal>
   )
}

const StyledCredit = styled.span`
   position: absolute;
   bottom: 12px;
   right: 12px;
   img {
      height: 16px;
   }
`
