/**
 * Demo fixtures
 * --------------------------------------------------------------------------
 * A realistic, statically-defined robot fleet plus a client-side telemetry
 * simulator. Everything here is fake data — there is no backend involved.
 *
 * The fleet spans three vendors (Universal Robots, ABB, FANUC) across two
 * facilities, with a mix of statuses so the dashboard looks populated and
 * alive: online units doing work, idle units, one in maintenance, and one
 * offline/error to make the alerts panel meaningful.
 */

import type { Robot } from '@urfmp/types'

export interface DemoTelemetry {
  robotId: string
  timestamp: Date
  data: {
    position: { x: number; y: number; z: number }
    temperature: { ambient: number; controller: number }
    voltage: { supply: number }
    current: { total: number }
    power: { total: number }
    utilization: number
    safety: { emergencyStop: boolean; protectiveStop: boolean }
  }
}

interface FleetSeed {
  id: string
  name: string
  model: string
  serialNumber: string
  vendor: string
  status: string
  facility: string
  cell: string
  payload: number
  reach: number
  axes: number
  firmwareVersion: string
  // baseline telemetry the simulator drifts around
  baseTemp: number
  baseUtil: number
  basePower: number
}

const FLEET: FleetSeed[] = [
  {
    id: 'demo-ur5e-01',
    name: 'UR5e · Assembly Cell A1',
    model: 'UR5e',
    serialNumber: 'UR5E-2024-1001',
    vendor: 'Universal Robots',
    status: 'online',
    facility: 'Austin Plant',
    cell: 'Assembly A1',
    payload: 5,
    reach: 850,
    axes: 6,
    firmwareVersion: '5.15.0',
    baseTemp: 38,
    baseUtil: 87,
    basePower: 142,
  },
  {
    id: 'demo-ur10e-02',
    name: 'UR10e · Packaging B2',
    model: 'UR10e',
    serialNumber: 'UR10E-2024-1002',
    vendor: 'Universal Robots',
    status: 'online',
    facility: 'Austin Plant',
    cell: 'Packaging B2',
    payload: 10,
    reach: 1300,
    axes: 6,
    firmwareVersion: '5.15.0',
    baseTemp: 41,
    baseUtil: 78,
    basePower: 198,
  },
  {
    id: 'demo-ur16e-03',
    name: 'UR16e · Palletizing C1',
    model: 'UR16e',
    serialNumber: 'UR16E-2023-0907',
    vendor: 'Universal Robots',
    status: 'idle',
    facility: 'Austin Plant',
    cell: 'Palletizing C1',
    payload: 16,
    reach: 900,
    axes: 6,
    firmwareVersion: '5.14.2',
    baseTemp: 33,
    baseUtil: 41,
    basePower: 96,
  },
  {
    id: 'demo-abb-irb1200-04',
    name: 'ABB IRB 1200 · Machine Tending D1',
    model: 'IRB 1200',
    serialNumber: 'ABB-1200-2024-3310',
    vendor: 'ABB',
    status: 'online',
    facility: 'Austin Plant',
    cell: 'Machine Tending D1',
    payload: 7,
    reach: 700,
    axes: 6,
    firmwareVersion: 'RW 7.10',
    baseTemp: 44,
    baseUtil: 92,
    basePower: 168,
  },
  {
    id: 'demo-abb-irb6700-05',
    name: 'ABB IRB 6700 · Spot Welding E1',
    model: 'IRB 6700',
    serialNumber: 'ABB-6700-2023-2218',
    vendor: 'ABB',
    status: 'online',
    facility: 'Reno Plant',
    cell: 'Spot Welding E1',
    payload: 150,
    reach: 2600,
    axes: 6,
    firmwareVersion: 'RW 7.08',
    baseTemp: 52,
    baseUtil: 81,
    basePower: 412,
  },
  {
    id: 'demo-abb-yumi-06',
    name: 'ABB YuMi · Electronics F2',
    model: 'IRB 14000 YuMi',
    serialNumber: 'ABB-YUMI-2024-0455',
    vendor: 'ABB',
    status: 'idle',
    facility: 'Reno Plant',
    cell: 'Electronics F2',
    payload: 0.5,
    reach: 559,
    axes: 14,
    firmwareVersion: 'RW 7.10',
    baseTemp: 31,
    baseUtil: 35,
    basePower: 88,
  },
  {
    id: 'demo-fanuc-lrmate-07',
    name: 'FANUC LR Mate 200iD · Inspection G1',
    model: 'LR Mate 200iD',
    serialNumber: 'FANUC-LRM-2024-7781',
    vendor: 'FANUC',
    status: 'online',
    facility: 'Reno Plant',
    cell: 'Inspection G1',
    payload: 7,
    reach: 717,
    axes: 6,
    firmwareVersion: 'V9.40',
    baseTemp: 39,
    baseUtil: 74,
    basePower: 121,
  },
  {
    id: 'demo-fanuc-m20-08',
    name: 'FANUC M-20iD · Material Handling H1',
    model: 'M-20iD/25',
    serialNumber: 'FANUC-M20-2023-6620',
    vendor: 'FANUC',
    status: 'maintenance',
    facility: 'Reno Plant',
    cell: 'Material Handling H1',
    payload: 25,
    reach: 1831,
    axes: 6,
    firmwareVersion: 'V9.30',
    baseTemp: 29,
    baseUtil: 0,
    basePower: 18,
  },
  {
    id: 'demo-fanuc-r2000-09',
    name: 'FANUC R-2000iC · Heavy Assembly I1',
    model: 'R-2000iC/210F',
    serialNumber: 'FANUC-R2K-2022-4409',
    vendor: 'FANUC',
    status: 'error',
    facility: 'Reno Plant',
    cell: 'Heavy Assembly I1',
    payload: 210,
    reach: 2655,
    axes: 6,
    firmwareVersion: 'V9.30',
    baseTemp: 58,
    baseUtil: 0,
    basePower: 24,
  },
  {
    id: 'demo-ur3e-10',
    name: 'UR3e · Lab Bench J1',
    model: 'UR3e',
    serialNumber: 'UR3E-2024-1188',
    vendor: 'Universal Robots',
    status: 'online',
    facility: 'Austin Plant',
    cell: 'Lab Bench J1',
    payload: 3,
    reach: 500,
    axes: 6,
    firmwareVersion: '5.15.0',
    baseTemp: 36,
    baseUtil: 69,
    basePower: 74,
  },
]

/** Build the static fleet as Robot objects the rest of the app understands. */
export function generateDemoRobots(): Robot[] {
  const now = new Date()
  return FLEET.map((r) => {
    const offlineish = r.status === 'error' || r.status === 'maintenance'
    return {
      id: r.id,
      name: r.name,
      model: r.model,
      type: r.model,
      serialNumber: r.serialNumber,
      vendor: r.vendor,
      status: r.status,
      organizationId: 'demo-org',
      location: {
        facility: r.facility,
        area: 'Production Floor',
        cell: r.cell,
        coordinates: {
          x: Math.round((100 + Math.random() * 300) * 10) / 10,
          y: Math.round((100 + Math.random() * 300) * 10) / 10,
          z: Math.round((250 + Math.random() * 80) * 10) / 10,
        },
      },
      configuration: {
        axes: r.axes,
        joints: r.axes,
        payload: r.payload,
        reach: r.reach,
        capabilities: [],
        customSettings: {},
      },
      firmwareVersion: r.firmwareVersion,
      createdAt: new Date('2023-06-01'),
      updatedAt: now,
      lastSeen: offlineish ? new Date(now.getTime() - 1000 * 60 * 12) : now,
    } as unknown as Robot
  })
}

// --- live telemetry simulation -------------------------------------------

const seedById = new Map(FLEET.map((f) => [f.id, f]))

function drift(base: number, jitterPct: number): number {
  const jitter = base * jitterPct
  return base + (Math.random() - 0.5) * 2 * jitter
}

/** Produce one telemetry sample for a robot, drifting around its baseline. */
export function generateDemoTelemetry(robotId: string): DemoTelemetry {
  const seed = seedById.get(robotId)
  const base = seed ?? {
    baseTemp: 35,
    baseUtil: 60,
    basePower: 120,
    status: 'online' as string,
  }
  const isError = base.status === 'error'
  const isDown = base.status === 'error' || base.status === 'maintenance'

  const temp = Math.round(drift(base.baseTemp, 0.06) * 10) / 10
  return {
    robotId,
    timestamp: new Date(),
    data: {
      position: {
        x: Math.round(drift(200, 0.4) * 10) / 10,
        y: Math.round(drift(200, 0.4) * 10) / 10,
        z: Math.round(drift(290, 0.05) * 10) / 10,
      },
      temperature: {
        ambient: temp,
        controller: Math.round((temp + 8 + Math.random() * 6) * 10) / 10,
      },
      voltage: { supply: Math.round(drift(48, 0.02) * 10) / 10 },
      current: { total: Math.round(drift(2.2, 0.2) * 100) / 100 },
      power: { total: Math.round(drift(base.basePower, 0.1)) },
      utilization: isDown ? 0 : Math.max(0, Math.min(100, Math.round(drift(base.baseUtil, 0.08)))),
      safety: {
        emergencyStop: isError,
        protectiveStop: isError,
      },
    },
  }
}

/** Telemetry for the whole fleet, keyed by robot id. */
export function generateDemoFleetTelemetry(): Map<string, DemoTelemetry> {
  const map = new Map<string, DemoTelemetry>()
  for (const f of FLEET) {
    map.set(f.id, generateDemoTelemetry(f.id))
  }
  return map
}
