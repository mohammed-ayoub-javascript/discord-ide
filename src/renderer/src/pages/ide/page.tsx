import { useState, useEffect } from 'react'
import { Treebeard } from 'react-treebeard'
import { useMainProjectSetupContext } from '@/context/main-project-setup-context'
import { Editor } from '@monaco-editor/react'

type FileNode = {
  name: string
  path: string
  children?: FileNode[]
  toggled?: boolean
  isDirectory?: boolean
}

const FileExplorer = ({ onSelectFile }: { onSelectFile: (path: string) => void }) => {
  const { path: projectPath } = useMainProjectSetupContext()
  const [data, setData] = useState<FileNode>({
    name: '📁 Project',
    path: '',
    children: [],
    isDirectory: true
  })
  const [showNodeModules, setShowNodeModules] = useState(false)
  const [loading, setLoading] = useState(false)

  const matchEmoji = (fileName: string): string => {
    const ext = fileName.split('.').pop()?.toLowerCase()
    const emojiMap: { [key: string]: string } = {
      js: '📜',
      ts: '📘',
      json: '📁',
      md: '📖',
      html: '🌐',
      css: '🎨',
      scss: '🎨',
      svg: '🖼️',
      png: '🖼️',
      jpg: '🖼️',
      ico: '🖼️',
      gitignore: '🙈',
      env: '🔧',
      lock: '🔒',
      map: '🗺️',
      sample: '📋'
    }
    return emojiMap[ext || ''] || (fileName.includes('.') ? '📄' : '📂')
  }

  const fetchFiles = async (path: string): Promise<FileNode[]> => {
    try {
      const response = await fetch(
        `http://localhost:3000/projects/1/files?path=${encodeURIComponent(path)}`
      )
      const items = await response.json()

      return items
        .filter((item: any) => showNodeModules || !item.path.includes('node_modules'))
        .map((item: any) => ({
          name: `${matchEmoji(item.name)} ${item.name}`,
          path: item.path,
          isDirectory: item.isDirectory,
          children: item.isDirectory ? [] : undefined,
          toggled: false
        }))
    } catch (error) {
      console.error('Failed to fetch files:', error)
      return []
    }
  }

  useEffect(() => {
    const initialize = async () => {
      if (!projectPath) return
      setLoading(true)
      try {
        const initialChildren = await fetchFiles('')
        setData({ ...data, path: projectPath, children: initialChildren })
      } finally {
        setLoading(false)
      }
    }
    initialize()
  }, [projectPath, showNodeModules])

  const onToggle = async (node: FileNode, toggled: boolean) => {
    if (!node.isDirectory) {
      onSelectFile(join(projectPath, node.path))
      return
    }

    if (toggled && node.children?.length === 0) {
      setLoading(true)
      try {
        const children = await fetchFiles(node.path)
        node.children = children
      } finally {
        setLoading(false)
      }
    }

    node.toggled = toggled
    setData({ ...data })
  }

  return (
    <div className="relative h-full bg-gray-900 text-gray-100">
      <div className="p-2 flex justify-between items-center bg-gray-800 border-b border-gray-700">
        <span className="text-sm">مستكشف الملفات</span>
        <button
          onClick={() => setShowNodeModules(!showNodeModules)}
          className="px-3 py-1 text-xs bg-gray-700 rounded hover:bg-gray-600 transition-colors"
          disabled={loading}
        >
          {showNodeModules ? '🙈 إخفاء التبعيات' : '🐵 إظهار التبعيات'}
        </button>
      </div>

      {loading ? (
        <div className="p-4 text-center text-gray-500">جاري التحميل...</div>
      ) : (
        <Treebeard
          data={data}
          onToggle={onToggle}
          style={{
            tree: {
              base: { backgroundColor: '#1a1a1a', padding: '0.5rem' },
              node: {
                header: {
                  base: {
                    padding: '8px',
                    '&:hover': { backgroundColor: '#2d2d2d' }
                  },
                  title: { fontSize: '14px' }
                },
                subtree: { paddingLeft: '1.5rem' }
              }
            }
          }}
        />
      )}
    </div>
  )
}

const CodeEditor = ({ filePath }: { filePath: string | null }) => {
  const [content, setContent] = useState('')
  const [isDirty, setIsDirty] = useState(false)

  useEffect(() => {
    const loadFile = async () => {
      if (!filePath) return
      try {
        const content = await window.electronAPI.readFile(filePath)
        setContent(content)
        setIsDirty(false)
      } catch (error) {
        console.error('فشل تحميل الملف:', error)
      }
    }
    loadFile()
  }, [filePath])

  const handleSave = async (value?: string) => {
    if (!filePath || !value) return
    try {
      await window.electronAPI.writeFile(filePath, value)
      setIsDirty(false)
    } catch (error) {
      console.error('خطأ في الحفظ:', error)
    }
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-2 bg-gray-800 text-sm text-gray-400 border-b border-gray-700">
        {filePath || 'لم يتم اختيار ملف'}
        {isDirty && <span className="ml-2 text-yellow-500">● غير محفوظ</span>}
      </div>

      <Editor
        height="100%"
        defaultLanguage="typescript"
        theme="vs-dark"
        value={content}
        onChange={(value) => {
          setContent(value || '')
          setIsDirty(true)
        }}
        options={{
          minimap: { enabled: true },
          fontSize: 14,
          automaticLayout: true
        }}
      />
    </div>
  )
}

const EditorMain = () => {
  const [selectedFile, setSelectedFile] = useState<string | null>(null)

  return (
    <div className="flex h-screen bg-gray-900">
      <div className="w-72 border-r border-gray-700 flex flex-col">
        <FileExplorer onSelectFile={setSelectedFile} />
      </div>

      <div className="flex-1 flex flex-col">
        {selectedFile ? (
          <CodeEditor filePath={selectedFile} />
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500 text-lg">
            ← اختر ملفًا من القائمة لبدء التحرير
          </div>
        )}
      </div>
    </div>
  )
}

export default EditorMain
