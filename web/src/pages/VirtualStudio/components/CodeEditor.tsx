import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import { Play, Code, Eye } from 'lucide-react';

interface CodeEditorProps {
  onRunCode: (code: string) => void;
  isPlaying: boolean;
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
`;

const CodeEditor: React.FC<CodeEditorProps> = ({ onRunCode, isPlaying }) => {
  const [code, setCode] = useState(defaultCode);
  const [editorMode, setEditorMode] = useState<'code' | 'visual'>('code');

  const handleRunCode = () => {
    onRunCode(code);
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 border-t border-gray-700">
      {/* Editor Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setEditorMode('code')}
            className={`px-3 py-1.5 rounded text-sm flex items-center space-x-2 transition-colors ${
              editorMode === 'code'
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
          >
            <Code size={16} />
            <span>Code</span>
          </button>
          <button
            onClick={() => setEditorMode('visual')}
            className={`px-3 py-1.5 rounded text-sm flex items-center space-x-2 transition-colors ${
              editorMode === 'visual'
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
            disabled
          >
            <Eye size={16} />
            <span>Visual (Coming Soon)</span>
          </button>
        </div>

        <button
          onClick={handleRunCode}
          disabled={isPlaying}
          className={`px-4 py-1.5 rounded flex items-center space-x-2 transition-colors ${
            isPlaying
              ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
              : 'bg-green-600 hover:bg-green-700 text-white'
          }`}
        >
          <Play size={16} />
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

      {/* Visual Programming (Placeholder) */}
      {editorMode === 'visual' && (
        <div className="flex-1 flex items-center justify-center text-gray-500">
          <div className="text-center">
            <Eye size={48} className="mx-auto mb-4 opacity-50" />
            <p className="text-lg">Visual Programming</p>
            <p className="text-sm mt-2">Blockly integration coming soon...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CodeEditor;
