import { createContext, useContext, ReactNode, useState } from 'react'

type PageContextType = {
  page: string
  changePage: (newPage: string) => void
}

const PageContext = createContext<PageContextType | undefined>(undefined)

export function PageProvider({ children }: { children: ReactNode }) {
  const [page, setPage] = useState('projects')

  const changePage = (newPage: string) => {
    setPage(newPage)
  }

  return (
    <PageContext.Provider value={{ page, changePage }}>
      {children}
    </PageContext.Provider>
  )
}

export const usePage = () => {
  const context = useContext(PageContext)
  if (!context) {
    throw new Error('usePage must be used within a PageProvider')
  }
  return context
}