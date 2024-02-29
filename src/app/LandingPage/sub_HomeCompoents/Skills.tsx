"use client";

import { Box, HStack, Heading, VStack, useMediaQuery } from "@chakra-ui/react";
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
import { motion } from "framer-motion";
import Title from "@/app/Components/Title";
import Image from "next/image";
interface SkillIconsProps {
  imgUrl: string;
  skillName: string;
}

function Skills() {
  const [isLargerThan] = useMediaQuery("(min-width: 1000px)");

  return (
    <div>
      <VStack
        h={isLargerThan ? "100vh" : "auto"}
        justifyContent="center"
        w="100%"
      >
        <Title title="My Skills" />

        <HStack
          w="100%"
          flexWrap={isLargerThan ? "nowrap" : "wrap"}
          justifyContent="normal"
        >
          <Box
            maxW={isLargerThan ? "50%" : "100%"}
            display="block"
            m="auto"
            p={5}
          >
            <Image
              style={{
                width: "100%",
              }}
              src={codingImg}
            />
          </Box>
          <Box maxW={isLargerThan ? "50%" : "100%"}>
            <HStack
              overflow="auto"
              flexWrap={isLargerThan ? "wrap" : "nowrap"}
              justifyContent="normal"
            >
              <SkillIcons imgUrl={ReactImg} skillName="React Js" />
              {/* <SkillIcons
                imgUrl="https://chirag.codes/skills/nextjs.webp"
                skillName="Next Js"
              /> */}
              <SkillIcons imgUrl={html} skillName="HTML" />
              <SkillIcons imgUrl={tailwind} skillName="Tailwind CSS" />
              <SkillIcons imgUrl={chakra} skillName="Chakra UI" />
              <SkillIcons imgUrl={js} skillName="Javascript" />
              <SkillIcons imgUrl={nodejs} skillName="Node JS" />
              <SkillIcons imgUrl={mongoDB} skillName="MongoDB" />
              <SkillIcons imgUrl={git} skillName="GIT" />
              <SkillIcons imgUrl={android} skillName="Android" />
            </HStack>
          </Box>
        </HStack>
      </VStack>
    </div>
  );
}

function SkillIcons({ imgUrl, skillName }: SkillIconsProps) {
  return (
    <>
      <VStack m={3} p={2} justifyContent="center">
        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
          <Box p={2} h="120px" alignItems="center">
            <Image width={100} height={100} src={imgUrl} alt={skillName} />
          </Box>
          <Heading size="md" m={3}>
            {skillName}
          </Heading>
        </motion.button>
      </VStack>
    </>
  );
}

export default Skills;
