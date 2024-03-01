"use client";

import { useState } from "react";
import { Box, HStack, Heading, Text, useMediaQuery } from "@chakra-ui/react";
import { IoMenu, IoCloseSharp } from "react-icons/io5";
import { Link, ScrollLink } from "react-scroll";

interface ManuProps {
  title: string;
  hashLink: string;
}

function Navbar() {
  const [openManu, setOpenManu] = useState(false);
  const [isLargerThan] = useMediaQuery("(min-width: 1000px)");
  const handalOpenClick = () => {
    setOpenManu(true);
  };

  const handalCloseClick = () => {
    setOpenManu(false);
  };

  return (
    <nav
      style={{
        width: "100%",
        position: "fixed",
        backdropFilter: "blur(10px)",
        backgroundColor: "#171717b3",
        zIndex: 1000,
      }}
    >
      <HStack p={3} justifyContent="space-between">
        <Box>
          <Link to="/" smooth={true} duration={500} >
            <Heading cursor={"pointer"} size="lg">Gaurav Sunthwal</Heading>
          </Link>
        </Box>
        {isLargerThan ? (
          <>
            <HStack className="manu">
              <Manu title={"Home"} hashLink={"#Home"} />
              <Manu title={"Skills"} hashLink={"#skills"} />
              <Manu title={"Services"} hashLink={"#Services"} />
              <Manu title={"Contact"} hashLink={"#Contact"} />
            </HStack>
          </>
        ) : (
          <>
            {openManu === true ? (
              <Box
                fontSize={"25px"}
                onClick={handalCloseClick}
                cursor={"pointer"}
              >
                <IoCloseSharp />
              </Box>
            ) : (
              <>
                <Box
                  fontSize={"25px"}
                  onClick={handalOpenClick}
                  cursor={"pointer"}
                >
                  <IoMenu />
                </Box>
              </>
            )}
          </>
        )}
      </HStack>

      {openManu && (
        <Box bg="#171717" color="white" m={2} border="2px">
          <Box p={2}>
            <Manu title="Home" hashLink="#Home" />
            <Manu title="Skills" hashLink="#skills" />
            <Manu title="Services" hashLink="#Services" />
            <Manu title="Contact" hashLink="#Contact" />
          </Box>
        </Box>
      )}
    </nav>
  );
}

function Manu({ title, hashLink }: ManuProps) {
  const handleClick = () => {};

  return (
    <Box cursor="pointer" m={2} onClick={handleClick}>
      <Link to={title} spy={true} smooth={true} offset={50} duration={500}>
        <Text fontSize="21px" fontWeight="500">
          {title}
        </Text>
      </Link>
    </Box>
  );
}

export default Navbar;
