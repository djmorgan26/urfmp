// @ts-nocheck - Blockly type definitions are incompatible with strict TypeScript
import React, { useEffect, useRef, useState } from 'react'
import * as Blockly from 'blockly'
import { javascriptGenerator } from 'blockly/javascript'

interface BlocklyEditorProps {
  onCodeChange: (code: string) => void
  initialCode?: string
}

// Define custom blocks for robot control
const defineRobotBlocks = () => {
  // Move block
  Blockly.Blocks['robot_move'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('move robot to x:')
        .appendField(new Blockly.FieldNumber(0, -10, 10, 0.1), 'X')
        .appendField('y:')
        .appendField(new Blockly.FieldNumber(0, 0, 5, 0.1), 'Y')
        .appendField('z:')
        .appendField(new Blockly.FieldNumber(0, -10, 10, 0.1), 'Z')
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour(230)
      this.setTooltip('Move the robot to a specific position')
    },
  }

  javascriptGenerator.forBlock['robot_move'] = function (block: any) {
    const x = block.getFieldValue('X')
    const y = block.getFieldValue('Y')
    const z = block.getFieldValue('Z')
    return `await robot.move(${x}, ${y}, ${z});\n`
  }

  // Rotate block
  Blockly.Blocks['robot_rotate'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('rotate robot')
        .appendField(new Blockly.FieldNumber(90, -360, 360, 1), 'ANGLE')
        .appendField('degrees')
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour(230)
      this.setTooltip('Rotate the robot by a specific angle')
    },
  }

  javascriptGenerator.forBlock['robot_rotate'] = function (block: any) {
    const angle = block.getFieldValue('ANGLE')
    return `await robot.rotate(${angle});\n`
  }

  // Set speed block
  Blockly.Blocks['robot_speed'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('set speed to')
        .appendField(new Blockly.FieldNumber(1, 0.1, 10, 0.1), 'SPEED')
        .appendField('m/s')
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour(230)
      this.setTooltip('Set the robot movement speed')
    },
  }

  javascriptGenerator.forBlock['robot_speed'] = function (block: any) {
    const speed = block.getFieldValue('SPEED')
    return `await robot.setSpeed(${speed});\n`
  }

  // Send telemetry block
  Blockly.Blocks['robot_telemetry'] = {
    init: function () {
      this.appendDummyInput().appendField('send telemetry data')
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour(160)
      this.setTooltip('Send current robot telemetry to URFMP')
    },
  }

  javascriptGenerator.forBlock['robot_telemetry'] = function () {
    return `robot.sendTelemetry({
  position: robot.getPosition(),
  timestamp: Date.now()
});\n`
  }

  // Wait block
  Blockly.Blocks['robot_wait'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('wait')
        .appendField(new Blockly.FieldNumber(1, 0.1, 10, 0.1), 'TIME')
        .appendField('seconds')
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour(120)
      this.setTooltip('Wait for a specified time')
    },
  }

  javascriptGenerator.forBlock['robot_wait'] = function (block: any) {
    const time = block.getFieldValue('TIME')
    return `await new Promise(resolve => setTimeout(resolve, ${time * 1000}));\n`
  }

  // Console log block
  Blockly.Blocks['robot_log'] = {
    init: function () {
      this.appendValueInput('TEXT').setCheck('String').appendField('log message:')
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour(290)
      this.setTooltip('Print a message to console')
    },
  }

  javascriptGenerator.forBlock['robot_log'] = function (block: any) {
    const text = javascriptGenerator.valueToCode(block, 'TEXT', javascriptGenerator.ORDER_ATOMIC)
    return `console.log(${text});\n`
  }
}

const BlocklyEditor: React.FC<BlocklyEditorProps> = ({ onCodeChange, initialCode }) => {
  const blocklyDiv = useRef<HTMLDivElement>(null)
  const [workspace, setWorkspace] = useState<Blockly.WorkspaceSvg | null>(null)

  useEffect(() => {
    if (!blocklyDiv.current) return

    // Define custom blocks
    defineRobotBlocks()

    // Create workspace
    const ws = Blockly.inject(blocklyDiv.current, {
      toolbox: {
        kind: 'categoryToolbox',
        contents: [
          {
            kind: 'category',
            name: 'Robot Control',
            colour: 230,
            contents: [
              { kind: 'block', type: 'robot_move' },
              { kind: 'block', type: 'robot_rotate' },
              { kind: 'block', type: 'robot_speed' },
            ],
          },
          {
            kind: 'category',
            name: 'Data',
            colour: 160,
            contents: [{ kind: 'block', type: 'robot_telemetry' }],
          },
          {
            kind: 'category',
            name: 'Timing',
            colour: 120,
            contents: [{ kind: 'block', type: 'robot_wait' }],
          },
          {
            kind: 'category',
            name: 'Logic',
            colour: 210,
            contents: [
              { kind: 'block', type: 'controls_if' },
              { kind: 'block', type: 'controls_repeat_ext' },
              { kind: 'block', type: 'logic_compare' },
            ],
          },
          {
            kind: 'category',
            name: 'Math',
            colour: 230,
            contents: [
              { kind: 'block', type: 'math_number' },
              { kind: 'block', type: 'math_arithmetic' },
            ],
          },
          {
            kind: 'category',
            name: 'Text',
            colour: 160,
            contents: [
              { kind: 'block', type: 'text' },
              { kind: 'block', type: 'robot_log' },
            ],
          },
        ],
      },
      grid: {
        spacing: 20,
        length: 3,
        colour: '#ccc',
        snap: true,
      },
      zoom: {
        controls: true,
        wheel: true,
        startScale: 1.0,
        maxScale: 3,
        minScale: 0.3,
        scaleSpeed: 1.2,
      },
      trashcan: true,
    })

    setWorkspace(ws)

    // Listen for changes
    ws.addChangeListener(() => {
      const code = generateCode(ws)
      onCodeChange(code)
    })

    // Cleanup
    return () => {
      ws.dispose()
    }
  }, [])

  const generateCode = (ws: Blockly.WorkspaceSvg): string => {
    const code = javascriptGenerator.workspaceToCode(ws)
    return `// Generated from Blockly blocks
async function main() {
${code}
  console.log('Robot program complete!');
}

main();
`
  }

  return (
    <div ref={blocklyDiv} className="w-full h-full" style={{ minHeight: '100%', height: '100%' }} />
  )
}

export default BlocklyEditor
