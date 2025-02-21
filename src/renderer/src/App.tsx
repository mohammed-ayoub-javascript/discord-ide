import { useState } from 'react'
import Projects from './pages/projects/page'
import { ThemeProvider } from '@/components/theme/theme-provider'
import { LanguageProvider } from './context/languageContext'
function App() {
  const [page, setPage] = useState('projects')

  const changePage = (page: string) => {
    setPage(page)
  }

  let content

  switch (page) {
    case 'projects':
      content = (
        <div className=" h-screen w-full">
          <Projects />
        </div>
      )
  }
  return (
    <>
      <LanguageProvider>
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
          {content}
        </ThemeProvider>
      </LanguageProvider>
    </>
  )
}

export default App
