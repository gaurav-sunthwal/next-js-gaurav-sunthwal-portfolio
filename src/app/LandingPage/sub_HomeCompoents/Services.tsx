//@ts-nocheck
"use client"
import Image from "next/image";
import { motion } from "framer-motion";
import { useMediaQuery } from "@chakra-ui/react";
import Title from "@/app/Components/Title";
import {
  VStack,
  Box,
  HStack,
  Card,
  CardBody,
  Heading,
  Text,
  Stack,
} from "@chakra-ui/react";

import fullstack from "/src/assets/ServicesImg/fullstack.png";
import backend from "/src/assets/ServicesImg/backend.png";
import frontend from "/src/assets/ServicesImg/frontend.png";
import reactNative from "/src/assets/ServicesImg/frontend.png"; // Add this import
import path from "path";
import { Url } from "next/dist/shared/lib/router/router";

interface ServicesCardProps {
  imgUrl: string;
  title: string;
  description: string;
}

function Services() {
  const [isLargerThan] = useMediaQuery("(min-width:1000px)");
  return (
    <VStack h={"auto"} justifyContent={"center"}>
      <Box p={3}>
        <Title title={"Services"} />
      </Box>
      <HStack
        p={3}
        flexWrap={"wrap"}
        justifyContent={isLargerThan ? "space-evenly" : "center"}
      >
        <ServicesCard
          imgUrl={fullstack} // Example path, replace it with your actual path
          title={"Fullstack Web App"}
          description={
            "As a full-stack developer, I provide end-to-end solutions for your web development projects. From concept to deployment, I leverage my expertise in both front-end and back-end technologies to deliver comprehensive solutions tailored to your needs. Whether you're starting from scratch or enhancing an existing application, I offer seamless integration, streamlined workflows, and ongoing support to ensure your project's success from start to finish."
          }
        />
        <ServicesCard
          imgUrl={backend} // Example path, replace it with your actual path
          title={"Backend Development"}
          description={
            "With expertise in Node.js and MongoDB, I offer robust back-end development services to power your web applications. Whether you need to build scalable APIs, manage complex data structures, or integrate with third-party services, I've got you covered. I design efficient server-side solutions that handle data seamlessly, ensuring your application performs optimally and delivers value to your users."
          }
        />
        <ServicesCard
          imgUrl={frontend} // Example path, replace it with your actual path
          title={"Frontend Developer"}
          description={
            "I specialize in front-end development using cutting-edge technologies like React.js and Next.js. From crafting responsive user interfaces to implementing interactive features, I create engaging web experiences that captivate users and drive results. With a keen eye for design and a focus on usability, I ensure that your website not only looks stunning but also delivers an exceptional user experience across devices."
          }
        />
        <ServicesCard
          imgUrl={reactNative}
          title={"Mobile App Development"}
          description={
            "I specialize in creating cross-platform mobile applications using React Native. From concept to deployment, I develop high-performance, native-like apps that work seamlessly on both iOS and Android platforms. With a focus on user experience and efficient code, I deliver mobile solutions that are both visually appealing and functionally robust, helping you reach your target audience on their preferred devices."
          }
        />
      </HStack>
    </VStack>
  );
}

function ServicesCard({ imgUrl, title, description }: ServicesCardProps) {
  const [isLargerThan] = useMediaQuery("(min-width:1000px)");
  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: false }}
      >
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Box p={3} m={isLargerThan ? 4 : 2}>
            <Card 
              maxW={"sm"} 
              h={isLargerThan ? "700px" : "auto"} 
              bg={"#171717"} 
              color={"white"}
              boxShadow="0 4px 6px rgba(0, 0, 0, 0.1)"
              borderRadius="lg"
              transition="all 0.3s ease-in-out"
              _hover={{
                transform: "translateY(-5px)",
                boxShadow: "0 6px 8px rgba(0, 0, 0, 0.15)",
              }}
            >
              <CardBody>
                <Image
                  src={imgUrl}
                  alt={`${title} illustration`}
                  sizes="lg"
                />
                <Stack mt="6" spacing="3">
                  <Heading size="md" color="teal.300">{title}</Heading>
                  <Text>{description}</Text>
                </Stack>
              </CardBody>
            </Card>
          </Box>
        </motion.button>
      </motion.div>
    </>
  );
}

export default Services;