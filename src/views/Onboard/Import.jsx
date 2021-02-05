import React from 'react'
import tw from 'tailwind.macro'
import { useHistory } from 'react-router-dom'
import { useMutation, useQuery } from '@apollo/client'

import Layout from './Layout'
import { Radio } from '../../components'
import { useAuth } from '../../store/auth'
import { Button, Main, Footer, Label } from './styled'
import {
   UPDATE_ORGANIZATION,
   MARKETPLACE_COMPANIES,
   INSERT_COMPANY_MENU_IMPORT,
} from '../../graphql'

export const Import = () => {
   const { user } = useAuth()
   const history = useHistory()
   const [url, setUrl] = React.useState('')
   const [error, setError] = React.useState('')
   const [title, setTitle] = React.useState('')
   const [option, setOption] = React.useState('source')
   const [update] = useMutation(UPDATE_ORGANIZATION, {
      onCompleted: () => {
         history.push('/signup/finish-setup')
      },
      onError: error => {
         console.log(error)
      },
   })
   const [create, { loading }] = useMutation(INSERT_COMPANY_MENU_IMPORT, {
      onCompleted: () => {
         next()
      },
      onError: () => {
         setError('Something went wrong, please try again!')
      },
   })
   const { data: { companies = [] } = {} } = useQuery(MARKETPLACE_COMPANIES, {
      onCompleted: ({ companies = [] }) => {
         if (companies.length > 0) {
            const [company] = companies
            setTitle(company.title)
         }
      },
   })

   const onSubmit = () => {
      setError('')
      if (!url.trim()) return setError('Menu URL is required.')
      if (
         !new RegExp(
            /[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/
         ).test(url)
      )
         return setError('Menu URL must be valid!')
      if (!title.trim()) return setError('Company is required.')
      if (url.trim() && title) {
         create({
            variables: {
               object: {
                  exportUrl: url,
                  marketPlaceCompanyTitle: title,
                  organizationId: user?.organization?.id,
               },
            },
         })
      }
   }

   const back = () => history.push('/signup/support')
   const next = () =>
      update({
         variables: {
            id: user.organization.id,
            _set: {
               onboardStatus: 'SETUP_DOMAIN',
            },
         },
      })

   return (
      <Layout>
         <Main>
            <section className="mx-auto w-3/6">
               <h2 className="text-xl text-gray-700 mb-3">Import Data</h2>
               <section>
                  <Radio>
                     <Radio.Option
                        id="source"
                        name="import"
                        value={option}
                        onClick={() => setOption('source')}
                     >
                        Marketplace
                     </Radio.Option>
                     <Radio.Option
                        id="demo"
                        name="import"
                        value={option}
                        onClick={() => setOption('demo')}
                     >
                        Dummy Content
                     </Radio.Option>
                  </Radio>
               </section>
               {option === 'source' && (
                  <section className="mt-3 space-y-3">
                     <fieldset className="flex flex-col">
                        <Label htmlFor="marketPlaceCompany">
                           Select Company
                        </Label>
                        <select
                           value={title}
                           id="marketPlaceCompany"
                           name="marketPlaceCompany"
                           onChange={e => setTitle(e.target.value)}
                           className="h-10 border rounded pl-2 w-64"
                        >
                           {companies.map(company => (
                              <option key={company.title} value={company.title}>
                                 {company.title}
                              </option>
                           ))}
                        </select>
                     </fieldset>
                     <fieldset className=" flex flex-col">
                        <Label htmlFor="menuUrl">Menu URL</Label>
                        <input
                           id="menuUrl"
                           value={url}
                           name="menuUrl"
                           placeholder="Enter menu url"
                           onChange={e => setUrl(e.target.value)}
                           className="h-10 border rounded pl-2 w-full"
                        />
                     </fieldset>
                     <Button
                        type="button"
                        onClick={onSubmit}
                        disabled={!url || loading}
                     >
                        {loading ? 'Saving' : 'Save'}
                     </Button>
                     {error && (
                        <span className="self-start block text-red-500 mt-2">
                           {error}
                        </span>
                     )}
                  </section>
               )}
               {option === 'demo' && (
                  <section className="mt-3">Coming Soon!</section>
               )}
            </section>
         </Main>
         <Footer>
            <Button onClick={back}>Back</Button>
            <Button onClick={next}>Skip</Button>
         </Footer>
      </Layout>
   )
}
