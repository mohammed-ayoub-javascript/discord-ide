import Projects from './pages/projects/page'
import { ThemeProvider } from '@/components/theme/theme-provider'
import { LanguageProvider } from './context/languageContext'
import { PageProvider, usePage } from './context/pageContext'

function AppContent() {
  const { page } = usePage()

  return (
    <>
      {page === 'projects' && (
        <div className="h-screen w-full">
          <Projects />
        </div>
      )}
    </>
  )
}

function App() {
  return (
    <PageProvider>
      <LanguageProvider>
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
          <AppContent />
        </ThemeProvider>
      </LanguageProvider>
    </PageProvider>
  )
}

export default App