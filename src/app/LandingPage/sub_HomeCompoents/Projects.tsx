//@ts-nocheck
"use client";
import Title from "@/app/Components/Title";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
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
import { FaFacebook, FaLinkedin, FaTwitter, FaWhatsapp } from "react-icons/fa";
import { BiLike, BiSolidLike, BiShare } from "react-icons/bi";
import { GoLinkExternal } from "react-icons/go";

import genrateReadme from "/src/assets/Img/genrateReadme.png";
import ecommers from "/src/assets/Img/ecommers.png";
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
            "https://generate-readme.vercel.app/_next/image?url=%2F_next%2Fstatic%2Fmedia%2FGR.3f54d9a7.jpeg&w=128&q=75"
          }
          projectName={"Generate Readme"}
          company={"MIT-WPU"}
          Creator={"Gaurav Sunthwal"}
          imgSrc={genrateReadme}
          discription={`
            I've utilized the awesome capabilities of Next.js and Chakra UI to craft a dynamic and visually stunning GitHub profile readme. With Next.js providing powerful server-side rendering and Chakra UI offering a sleek and customizable component library, this project promises to enhance the presentation of my GitHub profile.
            `}
          projectLink={"https://generate-readme.vercel.app/"}
        />
        <ProjectCard
          projectName={"E commearce"}
          discription={`
          Crafted a comprehensive e-commerce solution utilizing the power of Next.js, merging cutting-edge technology with intuitive design to create a dynamic online shopping experience. Engineered with scalability in mind, the platform seamlessly integrates advanced functionalities to enhance user engagement, optimize performance, and drive business growth.
          `}
          Creator={"Gaurav Sunthwal"}
          company={"Amazon"}
          imgSrc={ecommers}
          projectLink={"https://gocrazy-gaurav.vercel.app/"}
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
}) {
  const [isLargerThan] = useMediaQuery("(min-width: 1000px)");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [like, setLike] = useState(true);
  const twitterShareUrl = `https://twitter.com/intent/tweet?url=${projectLink}&text=${projectName}`;
  const whatsappShareUrl = `https://wa.me/?text=${projectName} - ${projectLink}`;
  const linkedinShareUrl = `https://www.linkedin.com/shareArticle?url=${projectLink}&title=${projectName}`;
  const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${projectLink}&quote=${projectName}`;

  const toggleLike = () => {
    setLike(!like);
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
                  <Avatar name={Creator} src={LogoImg} />

                  <Box>
                    <Heading size="sm">{projectName}</Heading>
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
                />

                <Modal onClose={onClose} isOpen={isOpen} isCentered>
                  <ModalOverlay />
                  <ModalContent color={"white"} bg={"black"} w={"200%"}>
                    <ModalHeader>{projectName}</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody w={"100%"}>
                      <iframe
                        src={projectLink}
                        title="Website Preview"
                        width="100%"
                        height="400"
                      ></iframe>
                    </ModalBody>

                    <ModalFooter>
                      <Button colorScheme="blue" mr={3} onClick={onClose}>
                        Close
                      </Button>
                      <Link href={projectLink}>
                        <Button colorScheme={"purple"}>Open</Button>
                      </Link>
                    </ModalFooter>
                  </ModalContent>
                </Modal>
              </Flex>
            </CardHeader>
            <CardBody>
              <Text h={"180px"} overflow={"auto"}>{discription}</Text>
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

function MenuItemSec({ iconName, title, shereLink }) {
  return (
    <>
      <Link href={`${shereLink}`} target="blank">
        <MenuItem icon={iconName}>{title}</MenuItem>
      </Link>
    </>
  );
}
