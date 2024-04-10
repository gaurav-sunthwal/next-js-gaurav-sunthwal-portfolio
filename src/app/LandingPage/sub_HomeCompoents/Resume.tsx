//@ts-nocheck
"use client";

import { Box, Button, HStack, Heading, Text, VStack, useMediaQuery } from "@chakra-ui/react";
import Image from "next/image";
import ContactImg from "/src/assets/Img/contact.svg";
import downlode from "/src/assets/Img/downlode.gif";
import imagination from "/src/assets/Img/imagination.gif";
import {
  FaDownload,
  FaGithub,
  FaLinkedin,
  FaMailBulk,
  FaMailchimp,
  FaTwitter,
} from "react-icons/fa";
import { IoMail } from "react-icons/io5";
import Link from "next/link";
import { useState } from "react";
export default function Resume() {
    const [isLargerThan] = useMediaQuery("(min-width: 1000px)");

  const [downlodeCLick, setDownloadClick] = useState(false);
  function DownldeMeBtn() {
    setDownloadClick(true);
    document.querySelector(".nextBtn").style = "display:none";
    setTimeout(() => {
      document.querySelector(".nextBtn").style = "display:flex";
      setDownloadClick(false);
    }, 4600);
  }
  return (
    <>
      <VStack justifyContent={"center"} h={"auto"} m={"20px"}>
        <HStack
          w={"100%"}
          justifyContent={"space-around"}
          flexWrap={"wrap-reverse"}
        >
          <Box p={2}>
            <Image src={ContactImg} alt="contact" />
          </Box>
          <Box textAlign={"center"} m={3}>
            <Heading size={"3xl"} color={"#FDE68A"}>
              CONTACT
            </Heading>
            <HStack p={3} justifyContent={"center"} flexWrap={"wrap"}>
              <SocalIcons
                bgcolor={"#F5D0FE"}
                iconcolor={"purple"}
                socalLink={"http://github.com/gaurav-sunthwal"}
                icon={<FaGithub />}
              />
              <SocalIcons
                bgcolor={"#FECDD3"}
                iconcolor={"brown"}
                icon={<FaTwitter />}
                socalLink={"http://x.com/gaurav162022"}
              />
              <SocalIcons
                bgcolor={"#F5D0FE"}
                iconcolor={"#0077B5"}
                icon={<FaLinkedin />}
                socalLink={"http://linkedin.com/in/gaurav-sunthwal"}
              />
              <SocalIcons
                bgcolor={"#FECDD3"}
                iconcolor={"brown"}
                icon={<IoMail />}
                socalLink={"mailto:gauravsunthwal162022@gmail.com"}
              />
            </HStack>
            <HStack justifyContent={"center"} w={"100%"}>
              <a href="https://internshala.com/download/resume" download>
                <Button
                  m={5}
                  w={isLargerThan ? "300px" : "100%"}
                  h={"70px"}
                  fontSize={"60px"}
                  className="nextBtn"
                  onClick={DownldeMeBtn}

                  // display={downlodeCLick === false ? "block" : "none" }
                  // textAlign={"center"}
                >
                  <HStack>
                    <Text>
                      <FaDownload />
                    </Text>
                    <Text> Downlode</Text>
                  </HStack>
                </Button>
              </a>
              <Box
                p={2}
                mixBlendMode={"hard-light"}
                w={"300px"}
                display={downlodeCLick === true ? "block" : "none"}
                margin={"auto"}
              >
                <Image src={downlode} alt="downlode" />
              </Box>
            </HStack>
          </Box>
        </HStack>
      </VStack>

      <VStack p={3}>
        <Heading color={"#F5D0FE"} textAlign={"center"} size={isLargerThan ? "4xl" : "2xl"}>
          Turning Imagination into Reality
        </Heading>
        <HStack justifyContent={"center"}>
          <Box w={isLargerThan ? "50%" : "100%"} p={4}  mixBlendMode={"hard-light"}>
            <Image src={imagination} alt="downlode" />
          </Box>
        </HStack>
      </VStack>
    </>
  );
}

function SocalIcons({ icon, bgcolor, iconcolor, socalLink }) {
  return (
    <>
      <Link href={`${socalLink}`} target="blank">
        <Box
          bg={bgcolor}
          p={5}
          borderRadius={"50%"}
          m={3}
          border={"4px solid"}
          _hover={{ fontSize: "50px" }}
          fontSize={"20px"}
        >
          <Heading color={iconcolor}>{icon}</Heading>
        </Box>
      </Link>
    </>
  );
}
