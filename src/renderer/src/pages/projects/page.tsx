import { ModeToggle } from '@/components/theme/mode-toggle'
import { Button } from '@/components/ui/button'
import { Code, Link2, Plus } from 'lucide-react'
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
import { usePage } from '@/context/page-context'
import axios from 'axios'
import Loading from '@/loading/loading'
import { API } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'

type FormErrors = {
  projectName?: string
  [key: `library-${number}`]: string
}

const Projects = () => {
  const [projectName, setProjectName] = useState('')
  const [description, setDescription] = useState('')
  const [token, setToken] = useState('')
  const [libraries, setLibraries] = useState<string[]>([''])
  const [searchTerm, setSearchTerm] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [newLibraryName, setNewLibraryName] = useState('')
  const [installProgress, setInstallProgress] = useState<string[]>([])
  const [isInstalling, setIsInstalling] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [installComplete, setInstallComplete] = useState(false)
  const [projects, setProjects] = useState<any>([])
  const [isPorjectLoading, setIsPorjectLoading] = useState(false)
  const [reload, setReload] = useState(0)
  const { changePage } = usePage()
  const t = useTranslator()
  const validateField = (name: string, value: string): string => {
    if (!value.trim()) return t('validation.required') as any
    if (name === 'projectName' && !/^[a-z0-9-_]+$/.test(value))
      return t('validation.invalidName') as any
    return ''
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}
    newErrors.projectName = validateField('projectName', projectName)
    libraries.forEach((lib, index) => {
      const error = validateField(`library-${index}`, lib)
      if (error) newErrors[`library-${index}`] = error
    })
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const addLibraryField = () => {
    if (newLibraryName.trim()) {
      setLibraries([...libraries, newLibraryName.trim()])
      setNewLibraryName('')
    } else {
      setLibraries([...libraries, ''])
      setErrors((prev) => ({
        ...prev,
        [`library-${libraries.length}`]: t('validation.required') as any
      }))
    }
  }

  const handleLibraryChange = (index: number, value: string) => {
    const newLibraries = [...libraries]
    newLibraries[index] = value
    setLibraries(newLibraries)
    if (value.trim() && errors[`library-${index}`]) {
      const newErrors = { ...errors }
      delete newErrors[`library-${index}`]
      setErrors(newErrors)
    }
  }

  useEffect(() => {
    if (libraries.length >= 15 && searchTerm.trim()) {
      const index = libraries.findIndex((lib) =>
        lib.toLowerCase().includes(searchTerm.toLowerCase())
      )
      if (index !== -1) setCurrentIndex(index)
    }
  }, [searchTerm, libraries])

  useEffect(() => {
    const progressHandler = (_event: any, data: string) => {
      setInstallProgress((prev) => [...prev, data])
    }

    const completeHandler = (success: boolean) => {
      setInstallComplete(success)
      setIsInstalling(false)
    }

    window.electron.ipcRenderer.on('install-progress', progressHandler)
    window.electron.ipcRenderer.on('install-complete', completeHandler as any)

    return () => {
      window.electron.ipcRenderer.removeAllListeners('install-progress')
      window.electron.ipcRenderer.removeAllListeners('install-complete')
    }
  }, [])

  const handleCreateProject = async () => {
    if (!validateForm()) {
      console.log('error')
    }

    const result = await window.electron.ipcRenderer.invoke('open-directory-dialog')

    if (!result.canceled && result.filePaths[0]) {
      const projectPath = result.filePaths[0]
      setIsInstalling(true)
      setInstallComplete(false)

      window.electron.ipcRenderer.send('create-project', {
        projectData: {
          name: projectName,
          description,
          token,
          libraries: libraries.filter((l) => l.trim())
        },
        path: projectPath
      })

      window.electron.ipcRenderer.send('install-dependencies', projectPath)

      setReload((reload) => reload + 1)
    }
  }

  const handlePrev = () =>
    setCurrentIndex((prev) => (prev - 1 + libraries.length) % libraries.length)
  const handleNext = () => setCurrentIndex((prev) => (prev + 1) % libraries.length)

  useEffect(() => {
    axios
      .get(`${API}/projects`)
      .then((res) => {
        setProjects(res.data)
        console.log(res.data)
        setIsPorjectLoading(false)
      })
      .catch((err) => {
        setIsPorjectLoading(false)
        console.log(err)
      })
  }, [])

  const goToProject = () => {
    changePage('dev-page')
  }

  return (
    <div className="w-full h-full">
      <div className="w-full flex justify-between items-center flex-row border-b border-gray-200 p-3">
        <div className="text-2xl font-extrabold cursor-pointer">{t('home.title') as any}</div>
        <div className="flex items-center gap-2">
          <Dialog>
            <DialogTrigger>
              <Button>
                <Plus />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t('home.dialog.title') as any}</DialogTitle>
                <DialogDescription className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      {t('home.dialog.form.projectname') as any}
                    </label>
                    <Input
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                      className={errors.projectName ? 'border-red-500' : ''}
                      placeholder="my-project"
                    />
                    {errors.projectName && (
                      <p className="text-red-500 text-xs mt-1">{errors.projectName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      {t('home.dialog.form.description') as any}
                    </label>
                    <Input value={description} onChange={(e) => setDescription(e.target.value)} />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      {t('home.dialog.form.token') as any}
                    </label>
                    <Input value={token} onChange={(e) => setToken(e.target.value)} />
                  </div>

                  {libraries.length >= 15 ? (
                    <div className="space-y-4">
                      <Input
                        placeholder="بحث"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                      <div className="flex items-center gap-2">
                        <Button onClick={handlePrev}>{'<'}</Button>
                        <Input
                          value={libraries[currentIndex] || ''}
                          onChange={(e) => handleLibraryChange(currentIndex, e.target.value)}
                          className={errors[`library-${currentIndex}`] ? 'border-red-500' : ''}
                        />
                        <Button onClick={handleNext}>{'>'}</Button>
                      </div>
                      {errors[`library-${currentIndex}`] && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors[`library-${currentIndex}`]}
                        </p>
                      )}
                      <Input
                        placeholder={t('home.dialog.form.libraryName') as any}
                        value={newLibraryName}
                        onChange={(e) => setNewLibraryName(e.target.value)}
                      />
                      <Button onClick={addLibraryField} variant="outline" className="w-full">
                        <Plus className="h-4 w-4 mr-2" />
                        {t('home.dialog.form.addLibrary') as any}
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {libraries.map((library, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Input
                            value={library}
                            onChange={(e) => handleLibraryChange(index, e.target.value)}
                            className={errors[`library-${index}`] ? 'border-red-500' : ''}
                            placeholder={`Library ${index + 1}`}
                          />
                          {index === libraries.length - 1 && (
                            <Button onClick={addLibraryField} variant="outline" size="icon">
                              <Plus className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                      {Object.keys(errors).map(
                        (key) =>
                          key.startsWith('library-') && (
                            <p key={key} className="text-red-500 text-xs mt-1 ml-2">
                              {errors[key]}
                            </p>
                          )
                      )}
                    </div>
                  )}

                  <Button
                    onClick={handleCreateProject}
                    className="w-full mt-4"
                    disabled={isInstalling}
                  >
                    {isInstalling
                      ? (t('home.dialog.form.installing') as any)
                      : (t('home.dialog.form.button') as any)}
                  </Button>

                  {installComplete && (
                    <Button
                      className=" w-full"
                      onClick={() => {
                        changePage('dev-page')
                      }}
                    >
                      <Code />
                    </Button>
                  )}

                  {isInstalling && (
                    <div className="mt-4 p-4 bg-gray-100 rounded-md max-h-40 overflow-y-auto">
                      <pre className="text-sm">
                        {installProgress.map((line, index) => (
                          <div key={index}>{line}</div>
                        ))}
                      </pre>
                    </div>
                  )}
                </DialogDescription>
              </DialogHeader>
            </DialogContent>
          </Dialog>

          <ModeToggle />
          <ChangeLanguage />
        </div>
      </div>
      {isPorjectLoading == true && (
        <div className=" w-full h-[80%] flex justify-center items-center flex-col">
          <Loading />
        </div>
      )}

      {isPorjectLoading == false && (
        <div className=" w-full p-2  h-[90%]">
          {projects.length == 0 && (
            <div className="w-full   h-[90%]  flex justify-center items-center flex-col">
              <h1 className=" text-4xl font-extrabold">You don't have projects yet!!</h1>
              <h1 className=" text-2xl font-bold">Click (+) to create your first project</h1>
            </div>
          )}
          <ScrollArea className=" h-screen w-full">
            {projects.map((item) => (
              <div
                className=" w-full mt-3 cursor-pointer"
                onClick={() => {
                  goToProject()
                }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className=" text-2xl font-extrabold">{item.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className=" w-full flex justify-start items-center flex-row gap-5">
                      <Link2 />
                      <code>{item.path}</code>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </ScrollArea>
        </div>
      )}
    </div>
  )
}

export default Projects
