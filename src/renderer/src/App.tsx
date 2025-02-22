import Projects from './pages/projects/page'
import { ThemeProvider } from '@/components/theme/theme-provider'
import { LanguageProvider } from './context/language-context'
import { PageProvider, usePage } from './context/page-context'
import { MainProjectSetupContextProvider } from './context/main-project-setup-context'

function AppContent() {
  const { page } = usePage()

  return (
    <>
      {page === 'projects' && (
        <div className="h-screen w-full">
          <Projects />
        </div>
      )}

      {page == "dev-page" && (
        <div className=' h-screen w-full'>
          DEV PAGE
        </div>
      )}
    </>
  )
}

function App() {
  return (
    <MainProjectSetupContextProvider>
      <PageProvider>
        <LanguageProvider>
          <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
            <AppContent />
          </ThemeProvider>
        </LanguageProvider>
      </PageProvider>      
    </MainProjectSetupContextProvider>
  )
}

export default App