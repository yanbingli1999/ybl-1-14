import { useGameStore } from '@/store/useGameStore'
import { getDisease } from '@/data/gameData'
import { Wrench, CheckCircle, AlertTriangle, Loader } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function EquipmentPanel() {
  const equipment = useGameStore(s => s.equipment)
  const repairEquipment = useGameStore(s => s.repairEquipment)
  const tickRepairs = useGameStore(s => s.tickRepairs)
  const player = useGameStore(s => s.player)
  const [, setNow] = useState(Date.now())

  useEffect(() => {
    const interval = setInterval(() => {
      tickRepairs()
      setNow(Date.now())
    }, 500)
    return () => clearInterval(interval)
  }, [tickRepairs])

  function formatRemainingTime(ms: number): string {
    if (ms <= 0) return '0s'
    const seconds = Math.ceil(ms / 1000)
    return `${seconds}s`
  }

  function getDurabilityColor(durability: number, maxDurability: number): string {
    const ratio = durability / maxDurability
    if (ratio > 0.6) return 'bg-green-500'
    if (ratio > 0.3) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  return (
    <div className="space-y-2">
      <h3 className="font-display text-xs tracking-widest text-gray-400 uppercase">
        设备状态
      </h3>
      <div className="space-y-2">
        {equipment.map(equip => {
          const isDamaged = equip.status === 'damaged'
          const isRepairing = equip.status === 'repairing'
          const canRepair = isDamaged && player.coins >= equip.repairCost
          const remainingMs = isRepairing ? Math.max(0, equip.repairEndTime - Date.now()) : 0
          const durabilityRatio = equip.durability / equip.maxDurability

          return (
            <div
              key={equip.id}
              className={`
                p-2 rounded-lg border
                ${isDamaged
                  ? 'bg-red-900/20 border-red-800/40'
                  : isRepairing
                  ? 'bg-yellow-900/20 border-yellow-800/40'
                  : 'bg-gray-800/30 border-gray-700/30'
                }
              `}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  {equip.status === 'normal' && (
                    <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                  )}
                  {equip.status === 'damaged' && (
                    <AlertTriangle className="w-3.5 h-3.5 text-red-400 animate-pulse" />
                  )}
                  {equip.status === 'repairing' && (
                    <Loader className="w-3.5 h-3.5 text-yellow-400 animate-spin" />
                  )}
                  <span className={`text-xs ${isDamaged ? 'text-red-300' : isRepairing ? 'text-yellow-300' : 'text-gray-300'}`}>
                    {equip.name}
                  </span>
                </div>
                {isDamaged && (
                  <button
                    onClick={() => canRepair && repairEquipment(equip.id)}
                    disabled={!canRepair}
                    className={`
                      flex items-center gap-1 text-[10px] px-2 py-0.5 rounded
                      ${canRepair
                        ? 'bg-yellow-900/40 text-yellow-300 hover:bg-yellow-900/60 cursor-pointer'
                        : 'bg-gray-800 text-gray-600 cursor-not-allowed'
                      }
                    `}
                  >
                    <Wrench className="w-2.5 h-2.5" />
                    {equip.repairCost} ⬡
                  </button>
                )}
                {isRepairing && (
                  <span className="text-[10px] text-yellow-400 font-mono">
                    {formatRemainingTime(remainingMs)}
                  </span>
                )}
              </div>
              <div className="w-full h-1.5 bg-gray-700/50 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${isDamaged ? 'bg-red-600' : isRepairing ? 'bg-yellow-500' : getDurabilityColor(equip.durability, equip.maxDurability)}`}
                  style={{ width: isRepairing ? `${100 - (remainingMs / equip.repairDuration) * 100}%` : `${durabilityRatio * 100}%` }}
                />
              </div>
              <div className="mt-1 flex justify-between text-[9px] text-gray-500">
                <span>
                  {isRepairing
                    ? '维修中...'
                    : isDamaged
                    ? '已损坏'
                    : `耐久 ${equip.durability}/${equip.maxDurability}`}
                </span>
                {!isRepairing && !isDamaged && (
                  <span>-{equip.durabilityCost}/次</span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
