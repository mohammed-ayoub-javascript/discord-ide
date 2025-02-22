import { useState, useEffect } from 'react'
import { Treebeard } from 'react-treebeard'
import { useMainProjectSetupContext } from '@/context/main-project-setup-context';
import { Editor } from '@monaco-editor/react';
type FileNode = {
  name: string
  path: string
  children?: FileNode[]
  toggled?: boolean
}

const FileExplorer = ({ onSelectFile }: { onSelectFile: (path: string) => void }) => {
  const { path } = useMainProjectSetupContext()
  const [data, setData] = useState<FileNode>({ name: '', path: '', children: [] })
  const [cursor, setCursor] = useState<any>(null)

  useEffect(() => {
    const fetchFiles = async () => {
      if (!path) {
        console.log("err");
        
      }
      
      const response = await fetch(`http://localhost:3000/projects/1/files`)
      const files = await response.json()
      
      const buildTree = (items: any[]): FileNode[] => items.map(item => ({
        name: item.path.split('/').pop() || '',
        path: item.path,
        children: item.isDirectory ? buildTree(item.children) : undefined
      }))
      
      setData({
        name: 'Project',
        path: path,
        children: buildTree(files),
        toggled: true
      })
    }

    fetchFiles()
  }, [path])

  const onToggle = (node: FileNode, toggled: boolean) => {
    setCursor(node)
    node.toggled = toggled
    setData({ ...data })
    
    if (!node.children && !node.path.includes('node_modules')) {
      onSelectFile(node.path)
    }
  }

  return <Treebeard data={data} onToggle={onToggle} />
}

const CodeEditor = ({ filePath }: { filePath: string | null }) => {
  const [content, setContent] = useState('')
  
  useEffect(() => {
    if (!filePath) return
    
    const loadFile = async () => {
      try {
        const content = await window.electronAPI.readFile(filePath)
        setContent(content)
      } catch (error) {
        console.error('Error loading file:', error)
      }
    }
    
    loadFile()
  }, [filePath])

  const handleSave = async (value?: string) => {
    if (!filePath || !value) return
    
    try {
      await window.electronAPI.writeFile(filePath, value)
      console.log('File saved successfully')
    } catch (error) {
      console.error('Error saving file:', error)
    }
  }

  return (
    <Editor
      height="90vh"
      defaultLanguage="typescript"
      theme="vs-dark"
      value={content}
      onChange={handleSave}
      options={{ 
        minimap: { enabled: true },
        fontSize: 14,
        automaticLayout: true 
      }}
    />
  )
}

const EditorMain = () => {
  const [selectedFile, setSelectedFile] = useState<string | null>(null)

  return (
    <div className="flex h-screen">
      <div className="w-64 border-r overflow-auto">
        <FileExplorer onSelectFile={setSelectedFile} />
      </div>
      
      <div className="flex-1">
        {selectedFile ? (
          <CodeEditor filePath={selectedFile} />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            اختر ملفاً لبدء التحرير
          </div>
        )}
      </div>
    </div>
  )
}

export default EditorMain