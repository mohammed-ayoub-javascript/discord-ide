import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { useLanguage } from '@/context/language-context'
import { Check, ChevronDown } from 'lucide-react'
import { dataLanguage } from './language-data'

const ChangeLanguage = () => {
  const { language, toggleLanguage } = useLanguage()
  const currentLanguage = dataLanguage[language]

  return (
    <DropdownMenu dir={currentLanguage.dir as any}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2" aria-label="Change language">
          <span>{currentLanguage.languageName}</span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align={currentLanguage.dir === 'rtl' ? 'start' : 'end'}>
        {Object.entries(dataLanguage).map(([langCode, langData]) => (
          <DropdownMenuItem
            key={langCode}
            onClick={() => toggleLanguage()}
            className={`flex justify-between ${currentLanguage.dir === 'rtl' ? 'pr-2' : 'pl-2'}`}
          >
            <span>{langData.languageName}</span>
            {language === langCode && <Check className="h-4 w-4 ml-2" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default ChangeLanguage
