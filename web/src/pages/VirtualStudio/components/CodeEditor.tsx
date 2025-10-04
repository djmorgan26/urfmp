import React, { useState, useEffect, useRef } from 'react'
import Editor from '@monaco-editor/react'
import { Play, Code, LayoutGrid, BookOpen, ChevronDown } from 'lucide-react'
import BlocklyEditor from './BlocklyEditor'
import { codeExamples, exampleCategories, getExampleById } from '../data/codeExamples'

interface CodeEditorProps {
  onRunCode: (code: string) => void
  isPlaying: boolean
}

const defaultCode = `// Control your virtual robot with code!
// Available API:
// - robot.move(x, y, z)
// - robot.rotate(angle)
// - robot.setSpeed(speed)
// - robot.sendTelemetry(data)

async function main() {
  // Move robot forward
  await robot.move(0, 0, -2);

  // Rotate 90 degrees
  await robot.rotate(90);

  // Move again
  await robot.move(-2, 0, 0);

  // Send telemetry
  robot.sendTelemetry({
    position: robot.getPosition(),
    timestamp: Date.now()
  });

  console.log('Robot program complete!');
}

main();
`

const CodeEditor: React.FC<CodeEditorProps> = ({ onRunCode, isPlaying }) => {
  const [code, setCode] = useState(defaultCode)
  const [editorMode, setEditorMode] = useState<'code' | 'visual'>('code')
  const [showExamplesMenu, setShowExamplesMenu] = useState(false)
  const examplesMenuRef = useRef<HTMLDivElement>(null)

  // Store code in window for keyboard shortcuts to access
  useEffect(() => {
    ;(window as any).monacoEditorValue = code
  }, [code])

  const handleRunCode = () => {
    onRunCode(code)
  }

  const loadExample = (exampleId: string) => {
    const example = getExampleById(exampleId)
    if (example) {
      setCode(example.code)
      setShowExamplesMenu(false)
    }
  }

  // Close examples menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (examplesMenuRef.current && !examplesMenuRef.current.contains(event.target as Node)) {
        setShowExamplesMenu(false)
      }
    }

    if (showExamplesMenu) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showExamplesMenu])

  return (
    <div className="flex flex-col h-full bg-gray-900 dark:bg-gray-950 border-t border-gray-200 dark:border-gray-700">
      {/* Editor Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-gray-800 dark:bg-gray-900 border-b border-gray-700 dark:border-gray-800">
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setEditorMode('code')}
            className={`px-2.5 py-1 rounded-md text-xs flex items-center space-x-1.5 transition-colors ${
              editorMode === 'code'
                ? 'bg-blue-500 text-white'
                : 'text-gray-400 dark:text-gray-500 hover:text-white hover:bg-gray-700 dark:hover:bg-gray-800'
            }`}
          >
            <Code size={14} />
            <span>Code</span>
          </button>
          <button
            onClick={() => setEditorMode('visual')}
            className={`px-2.5 py-1 rounded-md text-xs flex items-center space-x-1.5 transition-colors ${
              editorMode === 'visual'
                ? 'bg-blue-500 text-white'
                : 'text-gray-400 dark:text-gray-500 hover:text-white hover:bg-gray-700 dark:hover:bg-gray-800'
            }`}
          >
            <LayoutGrid size={14} />
            <span>Blocks</span>
          </button>
        </div>

        <div className="flex items-center space-x-2">
          {/* Code Examples Dropdown */}
          <div className="relative" ref={examplesMenuRef}>
            <button
              onClick={() => setShowExamplesMenu(!showExamplesMenu)}
              className="px-2.5 py-1 rounded-md text-xs flex items-center space-x-1.5 transition-colors text-gray-400 dark:text-gray-500 hover:text-white hover:bg-gray-700 dark:hover:bg-gray-800"
            >
              <BookOpen size={14} />
              <span>Examples</span>
              <ChevronDown size={12} />
            </button>

            {/* Examples Menu */}
            {showExamplesMenu && (
              <div className="absolute top-full right-0 mt-1 w-72 bg-gray-800 border border-gray-700 rounded-md shadow-xl z-50 max-h-96 overflow-y-auto">
                {exampleCategories.map((category) => {
                  const examples = codeExamples.filter((ex) => ex.category === category.id)
                  if (examples.length === 0) return null

                  return (
                    <div key={category.id} className="border-b border-gray-700 last:border-b-0">
                      <div className="px-3 py-2 bg-gray-750 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                        {category.icon} {category.label}
                      </div>
                      {examples.map((example) => (
                        <button
                          key={example.id}
                          onClick={() => loadExample(example.id)}
                          className="w-full px-3 py-2 text-left hover:bg-gray-700 transition-colors"
                        >
                          <div className="text-xs font-medium text-white">{example.title}</div>
                          <div className="text-xs text-gray-400 mt-0.5">{example.description}</div>
                          {example.robotType && example.robotType !== 'any' && (
                            <div className="text-xs text-blue-400 mt-0.5">
                              {example.robotType.toUpperCase()} robot
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          <button
            onClick={handleRunCode}
            disabled={isPlaying}
            className={`px-3 py-1 rounded-md text-xs flex items-center space-x-1.5 transition-colors ${
              isPlaying
                ? 'bg-gray-700 dark:bg-gray-800 text-gray-500 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700 text-white shadow-sm'
            }`}
          >
            <Play size={14} />
            <span>Run Code</span>
          </button>
        </div>
      </div>

      {/* Monaco Editor */}
      {editorMode === 'code' && (
        <div className="flex-1">
          <Editor
            height="100%"
            defaultLanguage="typescript"
            value={code}
            onChange={(value) => setCode(value || '')}
            theme="vs-dark"
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              lineNumbers: 'on',
              roundedSelection: false,
              scrollBeyondLastLine: false,
              automaticLayout: true,
              tabSize: 2,
              wordWrap: 'on',
            }}
          />
        </div>
      )}

      {/* Blockly Visual Programming */}
      {editorMode === 'visual' && (
        <div className="flex-1 bg-white dark:bg-gray-800 overflow-hidden">
          <BlocklyEditor onCodeChange={setCode} initialCode={code} />
        </div>
      )}
    </div>
  )
}

export default CodeEditor
