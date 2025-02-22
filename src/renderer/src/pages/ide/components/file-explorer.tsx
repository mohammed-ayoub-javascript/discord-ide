import { useEffect, useState } from 'react'
import { Treebeard } from 'react-treebeard'
import { DirectoryEntry, FileEntry } from '@/types/files'
import { useElectron } from '@/context/electronContext'

const FileExplorer = ({ onFileSelect }: { onFileSelect: (path: string) => void }) => {
  const { ipcRenderer } = useElectron()
  const [structure, setStructure] = useState<DirectoryEntry>()
  const [cursor, setCursor] = useState<any>(null)

  useEffect(() => {
    const loadStructure = async () => {
      const structure = await ipcRenderer.invoke('get-project-structure')
      setStructure(structure)
    }

    loadStructure()
    const watcher = ipcRenderer.on('file-structure-changed', loadStructure)

    return () => {
      watcher.removeListener()
    }
  }, [])

  const onToggle = (node: any, toggled: boolean) => {
    setCursor(node)
    node.toggled = toggled
  }

  return (
    <div className="h-full overflow-y-auto bg-[#252526] text-[#CCCCCC]">
      {structure && (
        <Treebeard
          data={structure}
          onToggle={onToggle}
          style={{
            tree: {
              base: { 
                paddingLeft: '10px',
                userSelect: 'none'
              },
              node: {
                base: { position: 'relative' },
                header: {
                  base: { 
                    padding: '2px 5px',
                    cursor: 'pointer',
                    ':hover': {
                      backgroundColor: '#2A2D2E'
                    }
                  },
                  connector: { display: 'none' }
                },
                subtree: { paddingLeft: '15px' }
              }
            }
          }}
          decorators={{
            Header: ({ node }) => (
              <div 
                className="flex items-center gap-2"
                onClick={() => node.type === 'file' && onFileSelect(node.path)}
              >
                <span className={`icon ${node.type}`}>
                  {node.type === 'directory' ? '📁' : '📄'}
                </span>
                <span>{node.name}</span>
              </div>
            )
          }}
        />
      )}
    </div>
  )
}

export default FileExplorer;