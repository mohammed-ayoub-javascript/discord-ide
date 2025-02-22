import { createContext, useContext, ReactNode, useState } from 'react'

type mainProjectSetupContextType = {
  path: string
  changePath: (newPage: string) => void
}

const MainProjectSetupContext = createContext<mainProjectSetupContextType | undefined>(undefined)

export function MainProjectSetupContextProvider({ children }: { children: ReactNode }) {
  const [path, setPath] = useState('')

  const changePath = (newPage: string) => {
    setPath(newPage)
  }

  return (
    <MainProjectSetupContext.Provider value={{ path, changePath }}>
      {children}
    </MainProjectSetupContext.Provider>
  )
}

export const useMainProjectSetupContext = () => {
  const context = useContext(MainProjectSetupContext)
  if (!context) {
    throw new Error('MainProjectSetupContext must be used within a PageProvider')
  }
  return context
}