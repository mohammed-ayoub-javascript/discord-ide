import { ModeToggle } from '@/components/theme/mode-toggle'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { useLanguage } from '@/context/languageContext'
import { useEffect, useState } from 'react'
import { useTranslator } from '@/language/translator'
import ChangeLanguage from '@/language/change-language'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'

const Projects = () => {
  const { language } = useLanguage()
  const t = useTranslator()

  useEffect(() => {
    console.log(language)
  }, [])

  const [libraries, setLibraries] = useState<string[]>([''])
  const [searchTerm, setSearchTerm] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [newLibraryName, setNewLibraryName] = useState('')

  const addLibraryField = () => {
    if (newLibraryName.trim() !== '') {
      setLibraries([...libraries, newLibraryName.trim()])
      setNewLibraryName('')
    } else {
      setLibraries([...libraries, ''])
    }
  }

  const handleLibraryChange = (index: number, value: string) => {
    const newLibraries = [...libraries]
    newLibraries[index] = value
    setLibraries(newLibraries)
  }

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + libraries.length) % libraries.length)
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % libraries.length)
  }

  useEffect(() => {
    if (libraries.length >= 15 && searchTerm.trim() !== '') {
      const index = libraries.findIndex((lib) =>
        lib.toLowerCase().includes(searchTerm.toLowerCase())
      )
      if (index !== -1) {
        setCurrentIndex(index)
      }
    }
  }, [searchTerm, libraries])

  return (
    <div className="w-full h-full">
      <div className="w-full flex justify-between items-center flex-row border-b border-gray-200 p-3">
        <div className="text-2xl font-extrabold cursor-pointer">{t('home.title') as any}</div>
        <div className="flex justify-center items-center flex-row gap-2">
          <Dialog>
            <DialogTrigger>
              <Button>
                <Plus />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t('home.dialog.title') as any}</DialogTitle>
                <DialogDescription>
                  {t('home.dialog.form.projectname') as any}
                  <Input
                    className="w-full mt-2 mb-2"
                    placeholder={t('home.dialog.form.projectname') as any}
                  />

                  {t('home.dialog.form.description') as any}
                  <Input
                    className="w-full mt-2 mb-2"
                    placeholder={t('home.dialog.form.description') as any}
                  />

                  {t('home.dialog.form.token') as any}
                  <Input
                    className="w-full mt-2 mb-2"
                    placeholder={t('home.dialog.form.token') as any}
                  />
                  {libraries.length >= 15 ? (
                    <div className="flex flex-col gap-2">
                      <Input
                        className="w-full mt-2 mb-2"
                        placeholder="بحث"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                      <div className="flex items-center gap-2">
                        <Button onClick={handlePrev}>{'<'}</Button>
                        <Input
                          className="w-full mt-2 mb-2"
                          placeholder={t('home.dialog.form.library') as any}
                          value={libraries[currentIndex] ?? ''}
                          onChange={(e) => {
                            const newLibraries = [...libraries]
                            newLibraries[currentIndex] = e.target.value
                            setLibraries(newLibraries)
                          }}
                        />
                        <Button onClick={handleNext}>{'>'}</Button>
                      </div>
                      <Input
                        className="w-full mt-2 mb-2"
                        placeholder={(t('home.dialog.form.libraryName') as any) || 'اسم المكتبة'}
                        value={newLibraryName}
                        onChange={(e) => setNewLibraryName(e.target.value)}
                      />
                      <Button
                        type="button"
                        onClick={addLibraryField}
                        variant="outline"
                        className="w-full mt-2"
                      >
                        <Plus className="h-4 w-4" />{' '}
                        {(t('home.dialog.form.addLibrary') as any) || 'إضافة مكتبة'}
                      </Button>
                    </div>
                  ) : (
                    <div
                      className={
                        libraries.length >= 12
                          ? 'grid grid-cols-4 gap-2'
                          : libraries.length >= 8
                            ? 'grid grid-cols-3 gap-2'
                            : 'space-y-2'
                      }
                    >
                      {libraries.map((library, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Input
                            className="w-full mt-2 mb-2"
                            placeholder={t('home.dialog.form.library') as any}
                            value={library}
                            onChange={(e) => handleLibraryChange(index, e.target.value)}
                          />
                          {index === libraries.length - 1 && (
                            <Button
                              type="button"
                              onClick={addLibraryField}
                              variant="outline"
                              size="icon"
                              className="ml-2"
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  <Button className="w-full">{t('home.dialog.form.button') as any}</Button>
                </DialogDescription>
              </DialogHeader>
            </DialogContent>
          </Dialog>

          <ModeToggle />
          <ChangeLanguage />
        </div>
      </div>
    </div>
  )
}

export default Projects
