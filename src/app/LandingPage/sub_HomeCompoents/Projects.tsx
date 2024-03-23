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
import { BiChat, BiLike, BiShare } from "react-icons/bi";
import { GoLink } from "react-icons/go";

import genrateReadme from "/src/assets/Img/genrateReadme.png";
import Image from "next/image";
import { motion } from "framer-motion";
import Link from "next/link";

export default function Projects() {
  return (
    <>
      <Title title="Projects" />

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
                      <Button variant="ghost">Secondary Action</Button>
                    </ModalFooter>
                  </ModalContent>
                </Modal>
              </Flex>
            </CardHeader>
            <CardBody>
              <Text>{discription}</Text>
            </CardBody>
            <Image objectFit="cover" src={imgSrc} alt="Chakra UI" />

            <CardFooter
              justify="space-between"
              flexWrap="wrap"
              sx={{
                "& > button": {
                  minW: "136px",
                },
              }}
            >
              <Button flex="1" variant="ghost" leftIcon={<BiLike />}>
                Like
              </Button>
              <Link href={`${projectLink}`} target="blank">
                <Button flex="1" variant="ghost" leftIcon={<GoLink />}>
                  GoTo Link
                </Button>
              </Link>
              <Button flex="1" variant="ghost" leftIcon={<BiShare />}>
                Share
              </Button>
            </CardFooter>
          </Card>
        </Box>
      </motion.div>
    </>
  );
}
