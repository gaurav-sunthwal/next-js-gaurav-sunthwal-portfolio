import { Box, HStack, Heading, Text, VStack } from "@chakra-ui/react";
import Link from "next/link";
import { useMediaQuery } from "@chakra-ui/react";

interface SocialCardProps {
  link: string;
  icon: string; // Change icon type to string
}

function HomeFooter() {
  const [isLargerThan] = useMediaQuery("(min-width: 1000px)");

  return (
    <div>
      <VStack h={"auto"} bg={"#171717"} justifyContent={"center"}>
        <HStack
          justifyContent={"space-around"}
          p={3}
          w={"100%"}
          flexWrap={"wrap"}
        >
          <Box>
            <Heading size={"md"}>© Build By Team of Gaurav</Heading>
            <HStack mt={2}>
              {/* <Box>{/* <IoMail /> */}</Box> Remove unused component */}
              <Text>gauravsunthwal162022@gmail.com</Text>
            </HStack>
          </Box>
          <Box textAlign={"center"} maxW={isLargerThan ? "50%" : "100%"}>
            <Box p={3}>
              <Heading p={2}>Let’s work together</Heading>
              <Text p={2}>
                I'm currently available for new work. Let me know if you're
                looking for a digital designer. Let’s talk about the next big
                thing!
              </Text>
            </Box>
            <HStack justifyContent={"center"}>
              <SocialCard
                icon={"Instagram"} // Pass icon name as string
                link={"https://instagram.com/gaurav_sunthwal"}
              />
              <SocialCard
                icon={"Github"} // Pass icon name as string
                link={"https://github.com/gaurav-sunthwal"}
              />
              <SocialCard
                icon={"Linkedin"} // Pass icon name as string
                link={"https://www.linkedin.com/in/gaurav-sunthwal/"}
              />
            </HStack>
          </Box>
        </HStack>
      </VStack>
    </div>
  );
}

function SocialCard({ link, icon }: SocialCardProps) {
  return (
    <>
      <Box m={3}>
        <Link href={link} passHref>
          {/* Use 'a' tag instead of 'Heading' */}
          <a>
            <Heading size={"sd"}>{icon}</Heading>
          </a>
        </Link>
      </Box>
    </>
  );
}

export default HomeFooter;
