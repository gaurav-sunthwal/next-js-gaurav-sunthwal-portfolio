"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { useInView } from "react-intersection-observer"
import SkillIcon from "./SkillsIcon"
import codingImg from "/src/assets/Img/image.png";
import ReactImg from "/src/assets/Img/Skills/react.png";
import tailwind from "/src/assets/Img/Skills/tailwind.png";
import html from "/src/assets/Img/Skills/html.png";
import git from "/src/assets/Img/Skills/git.png";
import js from "/src/assets/Img/Skills/js.png";
import mongoDB from "/src/assets/Img/Skills/mongoDB.png";
import android from "/src/assets/Img/Skills/android.png";
import nodejs from "/src/assets/Img/Skills/nodejs.png";
import chakra from "/src/assets/Img/Skills/chakra.jpeg";
import Title from "@/app/Components/Title";
import NextJS from "/src/assets/Img/Skills/nextjs.webp"
const Skills = () => {
  const [isMobile, setIsMobile] = useState(false)
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: false,
  })

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1000)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const skills = [
    { name: "React JS", icon: ReactImg , color: "bg-blue-500" },
    { name: "Next JS", icon: NextJS, color: "bg-black" },
    { name: "HTML", icon: html, color: "bg-orange-500" },
    { name: "Tailwind CSS", icon: tailwind , color: "bg-cyan-500" },
    { name: "Chakra UI", icon:chakra , color: "bg-teal-500" },
    { name: "Javascript", icon:js , color: "bg-yellow-400" },
    { name: "Node JS", icon: nodejs, color: "bg-green-600" },
    { name: "MongoDB", icon: mongoDB, color: "bg-green-500" },
    { name: "GIT", icon: git, color: "bg-red-500" },
    { name: "Android", icon: android, color: "bg-green-400" },
  ]

  return (
    <div className="relative py-20 overflow-hidden bg-gradient-to-b from-slate-900 to-slate-800 text-white">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -left-10 top-10 w-40 h-40 rounded-full bg-purple-500/10 blur-3xl"></div>
        <div className="absolute right-0 bottom-0 w-80 h-80 rounded-full bg-blue-500/10 blur-3xl"></div>
        <div className="absolute left-1/2 top-1/3 w-60 h-60 rounded-full bg-cyan-500/10 blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
         <Title title="My Skills"/>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto">
           {` Technologies and frameworks I've mastered throughout my journey as a developer`}
          </p>
        </motion.div>

        <div className={`flex flex-col ${isMobile ? "space-y-10" : "lg:flex-row lg:space-x-10"}`}>
          {/* Left side - Image with animation */}
          <motion.div
            ref={ref}
            initial={{ opacity: 0, x: -50 }}
            animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
            transition={{ duration: 0.8 }}
            className={`${isMobile ? "w-full" : "lg:w-1/2"} relative`}
          >
            <div className="relative rounded-lg overflow-hidden shadow-2xl transform hover:scale-[1.02] transition-transform duration-300">
              <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/20 to-cyan-500/20 z-10"></div>
              <Image
                src={codingImg}
                alt="Coding"
                width={800}
                height={600}
                className="w-full object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 z-20">
                <h3 className="text-2xl font-bold text-white">Passionate Developer</h3>
                <p className="text-slate-300">Turning ideas into reality through code</p>
              </div>
            </div>

            {/* Floating code snippets */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              // animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="absolute -top-6 -right-6 bg-slate-800 p-3 rounded-lg shadow-xl border border-slate-700 hidden md:block"
            >
              <code className="text-xs text-cyan-400">const developer = new Developer();</code>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="absolute -bottom-6 -left-6 bg-slate-800 p-3 rounded-lg shadow-xl border border-slate-700 hidden md:block"
            >
              <code className="text-xs text-purple-400">{'<Skills level="Expert" />'}</code>
            </motion.div>
          </motion.div>

          {/* Right side - Skills grid with animations */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            className={`${isMobile ? "w-full" : "lg:w-1/2"}`}
          >
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 gap-4">
              {skills.map((skill, index) => (
                <SkillIcon key={index} name={skill.name} icon={skill.icon.src} color={skill.color} delay={index * 0.1} />
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom wave decoration */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="w-full">
          <path
            fill="#0f172a"
            fillOpacity="1"
            d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,224C672,245,768,267,864,250.7C960,235,1056,181,1152,165.3C1248,149,1344,171,1392,181.3L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          ></path>
        </svg>
      </div>
    </div>
  )
}

export default Skills
