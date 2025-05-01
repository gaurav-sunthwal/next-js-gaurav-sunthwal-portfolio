//@ts-nocheck
"use client";
import Title from "@/app/Components/Title";
import React from "react";

import {
  Avatar,
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  HStack,
  Heading,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
  useDisclosure,
  useMediaQuery,
  Tag,
  TagLabel,
  Tooltip,
  Image as ChakraImage,
  VStack,
  Stack,
  Divider,
} from "@chakra-ui/react";
import { IoEyeSharp } from "react-icons/io5";
import {
  FaFacebook,
  FaGithub,
  FaLinkedin,
  FaTwitter,
  FaWhatsapp,
} from "react-icons/fa";
import { BiLike, BiSolidLike, BiShare } from "react-icons/bi";
import { GoLinkExternal } from "react-icons/go";

import portfolioWebsite from "/src/assets/Img/project6.png";
import genrateReadme from "/src/assets/Img/genrateReadme.png";
import ecommers from "/src/assets/Img/ecommers.png";
import legitly from "/src/assets/Img/legitly.png";
import OMNISCIENT from "/src/assets/Img/OMNISCIENT.png";
import CourseCrafterAI from "/src/assets/Img/project7.png";
import astitva from "@/assets/Img/Astitva.jpeg";
import aimockinterview from "/src/assets/Img/aimockinterview.png";
import aitrippanner from "/src/assets/Img/AITripPlanner.png";
import Image from "next/image";
import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";

// Project data array
const projectsData = [
  {
    logoImg: "https://gaurav-sunthwal.vercel.app/_next/static/media/me.9e81b52f.jpg",
    projectName: "AI Mock Interview App",
    company: "Personal Project",
    creator: "Gaurav Sunthwal",
    imgSrc: aimockinterview,
    description: `Built and deployed a full-stack AI mock interview app using Next.js, React, Drizzle ORM,
Gemini AI, and Clerk.
Integrated AI-driven mock interview functionality for a realistic, interactive interview experience.
Enhanced user experience with a clean, intuitive interface, helping developers improve their skills.`,
    projectLink: "https://mockinterviewai.vercel.app/",
    skills: ["Next Js", "Chakra UI", "Drizzle ORM", "Gemini AI", "Clerk"],
    gitLink: "https://github.com/gaurav-sunthwal/ai-mock-interview"
  },
  {
    logoImg: "https://gaurav-sunthwal.vercel.app/_next/static/media/me.9e81b52f.jpg",
    projectName: "CourseCrafter AI",
    company: "Personal Project",
    creator: "Gaurav Sunthwal",
    imgSrc: CourseCrafterAI,
    description: `CourseCrafter AI is an innovative platform that generates AI-powered courses instantly, making learning seamless and accessible. Whether you're exploring new technologies or sharpening your skills, CourseCrafter AI delivers structured learning modules with just one click. Built with Next.js, PostgreSQL, shadcn/ui, and Gemini API, it offers a smooth user experience and intelligent course creation.`,
    projectLink: "https://coursegenerator-ai.vercel.app/",
    skills: ["Next Js", "Chakra UI", "Drizzle ORM", "Gemini AI", "Clerk"],
    gitLink: "https://github.com/gaurav-sunthwal/course-generator"
  },
  {
    logoImg: "https://gaurav-sunthwal.vercel.app/_next/static/media/me.9e81b52f.jpg",
    projectName: "Portfolio Website",
    company: "Learning Projects",
    creator: "Gaurav Sunthwal",
    imgSrc: portfolioWebsite,
    description: `I've utilized the awesome capabilities of Next.js and Chakra UI to craft a dynamic and visually stunning GitHub profile readme. With Next.js providing powerful server-side rendering and Chakra UI offering a sleek and customizable component library, this project promises to enhance the presentation of my GitHub profile.`,
    projectLink: "https://gaurav-sunthwal.vercel.app/",
    skills: ["Next Js", "Chakra UI"],
    gitLink: "https://github.com/gaurav-sunthwal/next-js-gaurav-sunthwal-portfolio"
  },
  {
    logoImg: "https://generate-readme.vercel.app/_next/image?url=%2F_next%2Fstatic%2Fmedia%2FGR.3f54d9a7.jpeg&w=128&q=75",
    projectName: "Generate Readme",
    company: "Learning Project",
    creator: "Gaurav Sunthwal",
    imgSrc: genrateReadme,
    description: `I've utilized the awesome capabilities of Next.js and Chakra UI to craft a dynamic and visually stunning GitHub profile readme. With Next.js providing powerful server-side rendering and Chakra UI offering a sleek and customizable component library, this project promises to enhance the presentation of my GitHub profile.`,
    projectLink: "https://generate-readme.vercel.app/",
    skills: ["Next Js", "Chakra UI"],
    gitLink: "https://github.com/gaurav-sunthwal/make-git-beautiful"
  },
  {
    logoImg: "",
    projectName: "Astitva",
    company: "Hackathon Project",
    creator: "Gaurav and Team",
    imgSrc: astitva,
    description: `🖼 Astitva is an AI-driven platform that transforms images into captivating stories, heartfelt poems, and creative captions.`,
    projectLink: "https://astitva-frontend.yashrajn.com/",
    skills: ["Next Js", "Shadcn UI", "Python", "WorqHat APIs", "Tailwind CSS", "Clerk"],
    gitLink: "https://github.com/gaurav-sunthwal/astitva-hackathon"
  },
  {
    logoImg: "",
    projectName: "OMNISCIENT - TRL Level 5 Project",
    company: "Hackathon Project",
    creator: "Gaurav and Team",
    imgSrc: OMNISCIENT,
    description: `OMNISCIENT is a cutting-edge project that reached Technology Readiness Level (TRL) 5 and was successfully presented in the Smart India Hackathon (SIH) 2024 competition, where it was selected for further development. As the frontend developer, I utilized advanced frameworks like Aeternity UI, Chakra UI, and Next.js to create a seamless, responsive user interface, ensuring a robust and user-friendly experience. OMNISCIENT showcases innovation in real-world applications, offering a glimpse into the future of smart, scalable solutions.`,
    projectLink: "http://vps.yashraj.eu.org:8001/home/",
    skills: ["Next Js", "Chakra UI", "Aceternity UI", "LAMA AI", "Python"],
    gitLink: "https://github.com/gaurav-sunthwal/OMNISCIENT.git"
  },
  {
    logoImg: "",
    projectName: "LEGITLY",
    company: "Hackathon Project",
    creator: "Gaurav and Team",
    imgSrc: legitly,
    description: `LEGITLY is a PDF verification platform developed during the Hack MIT hackathon project. As a frontend developer, I utilized Next.js and Chakra UI to create a seamless user experience. LEGITLY ensures document integrity through advanced algorithms, providing instant verification results and a user-friendly dashboard. It's a convenient solution for individuals and organizations seeking trust in their digital documents.`,
    projectLink: "https://legitly.yashraj.eu.org/",
    skills: ["Next Js", "Chakra UI", "Node Js"],
    gitLink: "https://github.com/yashraj-n/legitly"
  },
  {
    logoImg: "",
    projectName: "AI Trip Planner",
    company: "Hackathon Project",
    creator: "Gaurav and Team",
    imgSrc: aitrippanner, // Add appropriate image source if available
    description: `AI Trip Planner is an intelligent travel planning application built during a hackathon. It helps users effortlessly plan their trips by providing personalized hotel recommendations and detailed trip itineraries. As a full-stack developer, I utilized Next.js, NeonDB, Drizzle ORM, and ShadCN UI to ensure a smooth and modern user experience. This tool simplifies travel planning with AI-powered suggestions and a sleek, responsive interface.`,
    projectLink: "https://tripplanner-ai-xi.vercel.app/",
    skills: ["NeonDB", "Drizzle ORM", "Next.js", "ShadCN UI"],
    gitLink: "https://github.com/gaurav-sunthwal/AI-TripPlanner"
  }
];

export default function Projects() {
  return (
    <>
      <Box m={2}>
        <Title title="Projects" />
      </Box>

      <HStack
        justifyContent={"space-evenly"}
        p={3}
        flexWrap={"wrap"}
        w={"100%"}
      >
        {projectsData.map((project, index) => (
          <ProjectCard
            key={index}
            LogoImg={project.logoImg}
            projectName={project.projectName}
            company={project.company}
            Creator={project.creator}
            imgSrc={project.imgSrc}
            discription={project.description}
            projectLink={project.projectLink}
            nameSkills={project.skills}
            gitLink={project.gitLink}
          />
        ))}
      </HStack>
    </>
  );
}

function ProjectCard({
  LogoImg,
  projectName,
  Creator,
  company,
  discription,
  imgSrc,
  projectLink,
  maxLength = 190,
  nameSkills = [],
  gitLink,
}) {
  const [isLargerThan] = useMediaQuery("(min-width: 1000px)");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const btnRef = React.useRef();
  const [like, setLike] = useState(false);
  const twitterShareUrl = `https://twitter.com/intent/tweet?url=${projectLink}&text=${projectName}`;
  const whatsappShareUrl = `https://wa.me/?text=${projectName} - ${projectLink}`;
  const linkedinShareUrl = `https://www.linkedin.com/shareArticle?url=${projectLink}&title=${projectName}`;
  const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${projectLink}&quote=${projectName}`;

  const toggleLike = () => {
    setLike(!like);
  };
  const [isExpanded, setIsExpanded] = React.useState(false);

  // Function to toggle the expansion state
  const toggleExpansion = () => {
    setIsExpanded(!isExpanded);
  };

  // Render the content based on the expansion state
  const renderContent = () => {
    if (isExpanded) {
      return discription; // Render full content if expanded
    } else {
      return (
        discription.slice(0, maxLength) +
        (discription.length > maxLength ? "..." : "")
      ); // Render truncated content with ellipsis
    }
  };
  
  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: false }}
      >
        <Box 
          p={3} 
          m={isLargerThan ? 3 : 2}
          transform="auto"
          _hover={{ translateY: "-8px" }}
          transition="transform 0.3s ease"
        >
          <Card 
            maxW="sm"
            boxShadow="lg"
            borderRadius="xl"
            overflow="hidden"
            bg="white"
            _hover={{ boxShadow: "2xl" }}
            transition="all 0.3s ease"
          >
            <CardHeader pb={2}>
              <Flex spacing="4">
                <Flex flex="1" gap="4" alignItems="center" flexWrap="wrap">
                  <Avatar 
                    name={projectName} 
                    src={LogoImg} 
                    size="md"
                    boxShadow="md"
                  />

                  <Box>
                    <Heading size="md" fontWeight="bold" color="#333">
                      <Link href={`${gitLink}`} target="blank">
                        <HStack>
                          <Text>{projectName}</Text> 
                          <Box 
                            as={FaGithub} 
                            color="gray.600" 
                            transition="color 0.2s"
                            _hover={{ color: "purple.500" }}
                          />
                        </HStack>
                      </Link>
                    </Heading>
                    <Text fontSize="sm" color="gray.600">
                      <b>{Creator}</b>, {company}
                    </Text>
                  </Box>
                </Flex>
                <Tooltip label="Preview Project" placement="top">
                  <IconButton
                    onClick={onOpen}
                    variant="ghost"
                    colorScheme="purple"
                    aria-label="Preview project"
                    icon={<IoEyeSharp />}
                    ref={btnRef}
                    size="lg"
                    borderRadius="full"
                    _hover={{ bg: "purple.100" }}
                  />
                </Tooltip>

                <Drawer
                  isOpen={isOpen}
                  placement="right"
                  onClose={onClose}
                  finalFocusRef={btnRef}
                  size={"md"}
                >
                  <DrawerOverlay backdropFilter="blur(2px)" />
                  <DrawerContent color={"black"} p={0} m={0}>
                    <DrawerCloseButton />
                    <DrawerHeader 
                      bgGradient="linear(to-r, purple.400, blue.500)"
                      color="white"
                    >
                      {projectName}
                    </DrawerHeader>

                    <DrawerBody p={0} m={0}>
                      <iframe
                        src={projectLink}
                        width={"100%"}
                        height={"100%"}
                        frameborder="0"
                      ></iframe>
                    </DrawerBody>

                    <DrawerFooter 
                      borderTopWidth="1px" 
                      borderColor="gray.200"
                    >
                      <Button colorScheme="gray" mr={3} onClick={onClose}>
                        Close
                      </Button>
                      <Link href={projectLink} target="_blank">
                        <Button colorScheme="purple">Open in New Tab</Button>
                      </Link>
                    </DrawerFooter>
                  </DrawerContent>
                </Drawer>
              </Flex>
            </CardHeader>

            <Box position="relative" height="200px" overflow="hidden">
              <Image 
                objectFit="cover" 
                src={imgSrc} 
                alt={projectName}
                style={{ width: '100%', height: '100%', objectPosition: 'center' }} 
              />
              <Box 
                position="absolute" 
                bottom="0" 
                left="0" 
                right="0" 
                bg="blackAlpha.700" 
                p={2}
              >
                <HStack flexWrap="wrap" spacing={2} justify="center">
                  {nameSkills.slice(0, 3).map((item, index) => (
                    <SkillTag key={index} skillName={item} />
                  ))}
                  {nameSkills.length > 3 && (
                    <Tooltip 
                      label={nameSkills.slice(3).join(", ")} 
                      placement="top"
                    >
                      <Badge 
                        colorScheme="gray" 
                        p={2} 
                        borderRadius="full"
                      >
                        +{nameSkills.length - 3}
                      </Badge>
                    </Tooltip>
                  )}
                </HStack>
              </Box>
            </Box>

            <CardBody>
              <Box maxH={"150px"} overflowY={"auto"} px={2}>
                <Text 
                  fontSize="sm" 
                  color="gray.700"
                  lineHeight="1.6"
                >
                  {renderContent()}
                  {discription.length > maxLength && (
                    <Button 
                      variant="link" 
                      colorScheme="purple" 
                      size="sm" 
                      onClick={toggleExpansion}
                      ml={2}
                    >
                      {isExpanded ? "Read Less" : "Read More"}
                    </Button>
                  )}
                </Text>
              </Box>
            </CardBody>

            <Divider />

            <CardFooter
              justify="space-between"
              alignItems="center"
              flexWrap="wrap"
              px={4}
              py={3}
              bg="gray.50"
            >
              <Button
                variant="ghost"
                onClick={toggleLike}
                leftIcon={like ? <BiSolidLike color="#6B46C1" /> : <BiLike />}
                color={like ? "purple.500" : "gray.600"}
                size="sm"
                borderRadius="full"
                _hover={{ bg: "purple.50" }}
              >
                {like ? "Liked" : "Like"}
              </Button>
              
              <Link href={`${projectLink}`} target="blank">
                <Button 
                  variant="solid" 
                  leftIcon={<GoLinkExternal />}
                  size="sm"
                  colorScheme="purple"
                  borderRadius="full"
                >
                  Visit Site
                </Button>
              </Link>
              
              <Menu>
                <MenuButton 
                  as={Button} 
                  variant="ghost" 
                  size="sm"
                  borderRadius="full"
                  _hover={{ bg: "purple.50" }}
                >
                  <HStack>
                    <BiShare />
                    <Text>Share</Text>
                  </HStack>
                </MenuButton>

                <MenuList>
                  <MenuItemSec
                    shereLink={twitterShareUrl}
                    iconName={<FaTwitter color="#1DA1F2" />}
                    title={"Twitter"}
                  />
                  <MenuItemSec
                    shereLink={facebookShareUrl}
                    iconName={<FaFacebook color="#4267B2" />}
                    title={"Facebook"}
                  />
                  <MenuItemSec
                    shereLink={linkedinShareUrl}
                    iconName={<FaLinkedin color="#0077B5" />}
                    title={"LinkedIn"}
                  />
                  <MenuItemSec
                    shereLink={whatsappShareUrl}
                    iconName={<FaWhatsapp color="#25D366" />}
                    title={"WhatsApp"}
                  />
                </MenuList>
              </Menu>
            </CardFooter>
          </Card>
        </Box>
      </motion.div>
    </>
  );
}

function SkillTag({ skillName }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: false }}
    >
      <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
        <Badge 
          colorScheme="purple" 
          p={2} 
          borderRadius="full" 
          fontWeight="medium"
          boxShadow="sm"
          fontSize="xs"
          textTransform="none"
        >
          {skillName}
        </Badge>
      </motion.button>
    </motion.div>
  );
}

function MenuItemSec({ iconName, title, shereLink }) {
  return (
    <Link href={`${shereLink}`} target="blank">
      <MenuItem 
        icon={iconName} 
        _hover={{ bg: "purple.50" }}
        fontSize="sm"
      >
        {title}
      </MenuItem>
    </Link>
  );
}