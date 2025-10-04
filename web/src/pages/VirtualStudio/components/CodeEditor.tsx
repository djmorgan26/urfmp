import React, { useState } from 'react'
import Editor from '@monaco-editor/react'
import { Play, Code, LayoutGrid } from 'lucide-react'
import BlocklyEditor from './BlocklyEditor'

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

  const handleRunCode = () => {
    onRunCode(code)
  }

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
