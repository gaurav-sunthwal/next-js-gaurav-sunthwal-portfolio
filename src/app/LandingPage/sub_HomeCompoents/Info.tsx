//@ts-nocheck
"use client";

import {
  Box,
  HStack,
  Heading,
  Image,
  Text,
  VStack,
  useMediaQuery,
} from "@chakra-ui/react";
import myImg from "/src/assets/Img/me.jpg";

function Info() {
  const [isLargerThan] = useMediaQuery("(min-width: 1000px)");
  return (
    <div>
      <VStack m={5}>
        <HStack justify={"space-evenly"} color={"#F4E7D4"} flexWrap={"wrap"}>
          <VStack>
            <Heading
              fontSize={isLargerThan ? "124px" : "52px"}
              color={"#F4E7D4"}
            >
              Designing emotional digital experiences that people love
            </Heading>
            <HStack
              justifyContent={"space-between"}
              mt={5}
              flexWrap={"wrap-reverse"}
            >
              <Box
                maxW={isLargerThan ? "50%" : "100%"}
                display={"block"}
                m={isLargerThan ? "auto" : "10px"}
                p={2}
                position={"relative"}
                // left={isLargerThan ? "0%" : "60%"}
              >
                <HStack>
                  <Image
                    w={isLargerThan ? "180px" : "100%"}
                    borderRadius={"50%"}
                    src={myImg.src}
                    alt="My Image"
                  />
                </HStack>
              </Box>
              <Box maxW={isLargerThan ? "50%" : "100%"}>
                <Text
                  className="info"
                  fontSize={"20px"}
                  fontWeight={400}
                  color={"#F4E7D4"}
                >
                  I am a passionate Computer Science student at MIT-WPU,
                  specializing in web and app development. My technical toolkit
                  includes Next.js, ReactJS, HTML, CSS, Node.js, and MongoDB for
                  web development, and React Native for app development. With a
                  strong commitment to continuous learning and innovation, I am
                  eager to collaborate on projects that drive impactful tech
                  solutions. Let’s connect and explore the exciting
                  possibilities together! 🚀
                </Text>
              </Box>
            </HStack>
          </VStack>
        </HStack>
      </VStack>
    </div>
  );
}

export default Info;
