import { ModeToggle } from "@/components/theme/mode-toggle"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { useLanguage } from "@/context/languageContext"
import { useEffect } from "react"
import { useTranslator } from "@/language/translator"
import ChangeLanguage from "@/language/change-language"
const Projects = () => {
    const { language, toggleLanguage } = useLanguage();
    const t = useTranslator();
    useEffect(() => {
        console.log(language);
        
    }  , [])
   return (
    <div className=" w-full h-full">
        <div className=" w-full flex justify-between items-center flex-row border-b border-gray-200 p-3">
            <div className=" text-2xl font-extrabold cursor-pointer">
            {t('home.title') as any}
                
            </div>
            <div className="flex justify-center items-center flex-row gap-2">
                <Button>
                    <Plus />
                </Button>
                <ModeToggle />
                <ChangeLanguage />
            </div>
        </div>
    </div>
  )
}

export default Projects