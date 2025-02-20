import { useLanguage } from "@/context/languageContext"
import { dataLanguage } from "./language-data";

export const useTranslator = () => {
    const { language } = useLanguage();
    
    return (keyPath: string) => {
        const keys = keyPath.split('.');
        return keys.reduce((obj, key) => obj?.[key], dataLanguage[language]);
    };
};