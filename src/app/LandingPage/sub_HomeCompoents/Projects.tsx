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
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  useDisclosure,
  useMediaQuery,
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
import Image from "next/image";
import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";

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
        <ProjectCard
          LogoImg={
            "https://gaurav-sunthwal.vercel.app/_next/static/media/me.9e81b52f.jpg"
          }
          projectName={"Portfolio Website"}
          company={"Learning Projects"}
          Creator={"Gaurav Sunthwal"}
          imgSrc={portfolioWebsite}
          discription={`
            I've utilized the awesome capabilities of Next.js and Chakra UI to craft a dynamic and visually stunning GitHub profile readme. With Next.js providing powerful server-side rendering and Chakra UI offering a sleek and customizable component library, this project promises to enhance the presentation of my GitHub profile.
            `}
          projectLink={"https://gaurav-sunthwal.vercel.app/"}
          nameSkills={["Next Js", "Chakra UI"]}
          gitLink={"https://github.com/gaurav-sunthwal/next-js-gaurav-sunthwal-portfolio"}
        />
        <ProjectCard
          LogoImg={
            "https://generate-readme.vercel.app/_next/image?url=%2F_next%2Fstatic%2Fmedia%2FGR.3f54d9a7.jpeg&w=128&q=75"
          }
          projectName={"Generate Readme"}
          company={"Learning Project"}
          Creator={"Gaurav Sunthwal"}
          imgSrc={genrateReadme}
          discription={`
            I've utilized the awesome capabilities of Next.js and Chakra UI to craft a dynamic and visually stunning GitHub profile readme. With Next.js providing powerful server-side rendering and Chakra UI offering a sleek and customizable component library, this project promises to enhance the presentation of my GitHub profile.
            `}
          projectLink={"https://generate-readme.vercel.app/"}
          nameSkills={["Next Js", "Chakra UI"]}
          gitLink={"https://github.com/gaurav-sunthwal/make-git-beautiful"}
        />
        <ProjectCard
          projectName={"LEGITLY"}
          discription={`
          LEGITLY is a PDF verification platform developed during the Hack MIT hackathon project. As a frontend developer, I utilized Next.js and Chakra UI to create a seamless user experience. LEGITLY ensures document integrity through advanced algorithms, providing instant verification results and a user-friendly dashboard. It's a convenient solution for individuals and organizations seeking trust in their digital documents.
          `}
          Creator={"Gaurav and Team"}
          company={"Hackathon Project"}
          imgSrc={legitly}
          projectLink={"https://legitly.yashraj.eu.org/"}
          nameSkills={["Next Js", "Chakra UI", "Node Js"]}
          gitLink={"https://github.com/yashraj-n/legitly"}
        />
        <ProjectCard
          projectName={"OMNISCIENT - TRL Level 5 Project"}
          discription={`
OMNISCIENT is a cutting-edge project that reached Technology Readiness Level (TRL) 5 and was successfully presented in the Smart India Hackathon (SIH) 2024 competition, where it was selected for further development. As the frontend developer, I utilized advanced frameworks like Aeternity UI, Chakra UI, and Next.js to create a seamless, responsive user interface, ensuring a robust and user-friendly experience. OMNISCIENT showcases innovation in real-world applications, offering a glimpse into the future of smart, scalable solutions.          `}
          Creator={"Gaurav and Team"}
          company={"Hackathon Project"}
          imgSrc={OMNISCIENT}
          projectLink={"http://vps.yashraj.eu.org:8001/home/"}
          nameSkills={["Next Js", "Chakra UI", "Aceternity UI" ,  "LAMA AI" ,  "Python"]}
          gitLink={"https://github.com/gaurav-sunthwal/OMNISCIENT.git"}
        />
      </HStack>
    </>
  );
}

// function LinkPreviewCode() {
//   const { isOpen, onOpen, onClose } = useDisclosure();
//   return (
//     <>
//       <Button onClick={onOpen}>Open Modal</Button>

//       <Modal isOpen={isOpen} onClose={onClose}>
//         <ModalOverlay />
//         <ModalContent>
//           <ModalHeader>Modal Title</ModalHeader>
//           <ModalCloseButton />
//           <ModalBody>{/* <Lorem count={2} /> */}</ModalBody>

//           <ModalFooter>
//             <Button colorScheme="blue" mr={3} onClick={onClose}>
//               Close
//             </Button>
//             <Button variant="ghost">Secondary Action</Button>
//           </ModalFooter>
//         </ModalContent>
//       </Modal>
//     </>
//   );
// }

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
  const [like, setLike] = useState(true);
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
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: false }}
      >
        <Box p={1} m={isLargerThan ? 1 : 2}>
          <Card maxW="md">
            <CardHeader>
              <Flex spacing="4">
                <Flex flex="1" gap="4" alignItems="center" flexWrap="wrap">
                  <Avatar name={projectName} src={LogoImg} />

                  <Box>
                    <Heading size="sm">
                      <Link href={`${gitLink}`} target="blank">
                        <HStack>
                          <Box>{projectName}</Box> {<FaGithub />}
                        </HStack>
                      </Link>
                    </Heading>
                    <Text>
                      {Creator}, {company}
                    </Text>
                  </Box>
                </Flex>
                <IconButton
                  onClick={onOpen}
                  variant="ghost"
                  colorScheme="gray"
                  aria-label="See menu"
                  icon={<IoEyeSharp />}
                  ref={btnRef}
                />

                <Drawer
                  isOpen={isOpen}
                  placement="right"
                  onClose={onClose}
                  finalFocusRef={btnRef}
                  size={"md"}
                >
                  <DrawerOverlay />
                  <DrawerContent color={"black"} p={0} m={0}>
                    <DrawerCloseButton />
                    <DrawerHeader>{projectName}</DrawerHeader>

                    <DrawerBody p={0} m={0}>
                      <iframe
                        src={projectLink}
                        width={"100%"}
                        height={"100%"}
                        frameborder="0"
                      ></iframe>
                    </DrawerBody>

                    <DrawerFooter>
                      <Button colorScheme="blue" mr={3} onClick={onClose}>
                        Close
                      </Button>
                      <Link href={projectLink}>
                        <Button colorScheme={"purple"}>Open</Button>
                      </Link>
                    </DrawerFooter>
                  </DrawerContent>
                </Drawer>
              </Flex>
            </CardHeader>
            <CardBody>
              <Box h={"180px"} overflow={"auto"}>
                <Box p={2}>
                  <Text>
                    {renderContent()}
                    {discription.length > maxLength && (
                      <button fontWeight={"400px"} onClick={toggleExpansion}>
                        <b>{isExpanded ? "Read Less" : "Read More"}</b>
                      </button>
                    )}
                  </Text>
                  {/* SKILL TAG */}
                </Box>
                <Box p={2}>
                  <HStack flexWrap={"wrap"}>
                    {nameSkills.map((item) => {
                      return (
                        <>
                          <SkillTag key={item} skillName={item} />
                        </>
                      );
                    })}
                  </HStack>
                </Box>
              </Box>
            </CardBody>
            <Image objectFit="cover" src={imgSrc} alt="Chakra UI" />

            <CardFooter
              justify="space-evenly"
              flexWrap="wrap"
              sx={{
                "& > button": {
                  minW: "136px",
                },
              }}
            >
              <Button
                // flex="1"
                variant="ghost"
                onClick={toggleLike}
                leftIcon={like ? <BiLike /> : <BiSolidLike />}
              >
                {like ? "Like" : "UnLike"}
              </Button>
              <Link href={`${projectLink}`} target="blank">
                <Button flex="1" variant="ghost" leftIcon={<GoLinkExternal />}>
                  Visit
                </Button>
              </Link>
              <Menu>
                <MenuButton as={Button} variant="ghost" textAlign={"center"}>
                  <HStack justifyContent={"center"}>
                    <BiShare />
                    <Text size={"sm"}>Share</Text>
                  </HStack>
                </MenuButton>

                <MenuList fontSize={"20px"}>
                  <MenuItemSec
                    shereLink={twitterShareUrl}
                    iconName={<FaTwitter />}
                    title={"Twitter"}
                  />
                  <MenuItemSec
                    shereLink={facebookShareUrl}
                    iconName={<FaFacebook />}
                    title={"Facebook"}
                  />
                  <MenuItemSec
                    shereLink={linkedinShareUrl}
                    iconName={<FaLinkedin />}
                    title={"Linkedin"}
                  />
                  <MenuItemSec
                    shereLink={whatsappShareUrl}
                    iconName={<FaWhatsapp />}
                    title={"Whatsapp"}
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
    <>
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: false }}
      >
        <motion.button whileHover={{ scale: 1.0 }} whileTap={{ scale: 1.1 }}>
          <Box w={"auto"} h={"2"} m={1}>
            <Badge colorScheme={"solid"} p={2}>
              {skillName}
            </Badge>
          </Box>
        </motion.button>
      </motion.div>
    </>
  );
}

function MenuItemSec({ iconName, title, shereLink }) {
  return (
    <>
      <Link href={`${shereLink}`} target="blank">
        <MenuItem icon={iconName}>{title}</MenuItem>
      </Link>
    </>
  );
}
