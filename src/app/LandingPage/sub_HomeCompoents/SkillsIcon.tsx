"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { useState } from "react"

interface SkillIconProps {
  name: string
  icon: string
  color: string
  delay?: number
}

const SkillIcon = ({ name, icon, color, delay = 0 }: SkillIconProps) => {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="relative group"
    >
      <div
        className={`
        relative rounded-xl overflow-hidden p-6 
        bg-gradient-to-br from-slate-800 to-slate-900
        border border-slate-700 hover:border-slate-600
        shadow-lg hover:shadow-xl transition-all duration-300
        flex flex-col items-center justify-center
        h-full min-h-[180px]
      `}
      >
        {/* Glowing background effect */}
        <div
          className={`
          absolute inset-0 opacity-0 group-hover:opacity-20 
          transition-opacity duration-300 blur-xl
          ${color}
        `}
        ></div>

        {/* Icon container with subtle animation */}
        <div className="relative mb-4 p-2 rounded-full">
          <motion.div
            animate={
              isHovered
                ? {
                    y: [0, -5, 0],
                    transition: { repeat: Number.POSITIVE_INFINITY, duration: 1.5 },
                  }
                : {}
            }
            className="relative z-10"
          >
            <Image src={icon || "/placeholder.svg"} alt={name} width={60} height={60} className="object-contain" />
          </motion.div>

          {/* Subtle ring animation on hover */}
          <motion.div
            className={`absolute inset-0 rounded-full ${color} opacity-0 group-hover:opacity-20`}
            animate={
              isHovered
                ? {
                    scale: [1, 1.2, 1],
                    opacity: [0.1, 0.2, 0.1],
                    transition: { repeat: Number.POSITIVE_INFINITY, duration: 2 },
                  }
                : {}
            }
          />
        </div>

        {/* Skill name */}
        <h3 className="text-lg font-semibold text-white relative z-10">{name}</h3>

        {/* Animated underline on hover */}
        <motion.div
          className={`h-0.5 ${color} mt-2 w-0 group-hover:w-16 transition-all duration-300`}
          initial={{ width: 0 }}
          animate={isHovered ? { width: 60 } : { width: 0 }}
          transition={{ duration: 0.3 }}
        />
      </div>
    </motion.div>
  )
}

export default SkillIcon
