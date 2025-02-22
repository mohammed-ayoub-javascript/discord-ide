import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useElectron } from '@/context/electronContext'
import FileExplorer from "@/pages/ide/components/file-explorer"
const DevPage = () => {
  const { ipcRenderer } = useElectron()
  const [activeTab, setActiveTab] = useState<string | null>(null)
  const [openTabs, setOpenTabs] = useState<string[]>([])

  const handleFileSelect = (path: string) => {
    if (!openTabs.includes(path)) {
      setOpenTabs([...openTabs, path])
    }
    setActiveTab(path)
  }

  const closeTab = (path: string) => {
    const newTabs = openTabs.filter(tab => tab !== path)
    setOpenTabs(newTabs)
    if (activeTab === path) {
      setActiveTab(newTabs[newTabs.length - 1] || null)
    }
  }

  return (
    <div className="h-screen flex">
      <div className="w-64 border-r border-gray-700">
        <FileExplorer onFileSelect={handleFileSelect} />
      </div>

      <div className="flex-1 flex flex-col">
        <div className="h-9 bg-[#2d2d2d] flex items-center px-2 border-b border-gray-700">
          {openTabs.map(tab => (
            <div
              key={tab}
              className={`px-3 py-1 flex items-center gap-2 cursor-pointer ${
                activeTab === tab ? 'bg-[#1e1e1e]' : 'bg-[#252526]'
              }`}
            >
              <span onClick={() => setActiveTab(tab)}>
                {tab.split('/').pop()}
              </span>
              <button 
                className="hover:bg-gray-600 rounded-sm px-1"
                onClick={() => closeTab(tab)}
              >
                ×
              </button>
            </div>
          ))}
        </div>

        <div className="flex-1 overflow-hidden">
          {activeTab ? (
            <CodeEditor activeTab={activeTab} />
          ) : (
            <div className="h-full flex items-center justify-center bg-[#1e1e1e] text-gray-400">
              اختر ملفاً لبدء التحرير
            </div>
          )}
        </div>

        <div className="h-48 bg-[#252526] border-t border-gray-700 p-2">
          <Tabs defaultValue="terminal" className="h-full">
            <TabsList className="bg-transparent">
              <TabsTrigger value="terminal">Terminal</TabsTrigger>
              <TabsTrigger value="problems">Problems</TabsTrigger>
              <TabsTrigger value="output">Output</TabsTrigger>
            </TabsList>
            <TabsContent value="terminal" className="h-full">
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}