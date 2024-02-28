"use client"

import { Box, HStack, Heading, VStack, useMediaQuery } from "@chakra-ui/react";
import { useEffect } from "react";

function FlotingText() {
  const [isLargerThan] = useMediaQuery("(min-width: 1000px)");
  return (
    <VStack
      h={isLargerThan ? "90vh" : "40vh"}
      justifyContent={"center"}
      whiteSpace={"nowrap"}
      overflow={"hidden"}
      fontSize={"134px"}
    >
      <MovingTextRightToLeft
        text={
          "I Konw : Python • JavaScript • ReactJS • JavaScript  • Java • Next JS • TailWind CSS"
        }
      />
      <MovingTextLeftToRight
        text={
          "I Can : Artificial Intelligence • Web Development • App Development"
        }
      />
    </VStack>
  );
}

const MovingTextRightToLeft = (props) => {
  useEffect(() => {
    const scrollingText = document.getElementById("scrollingTextRightToLeft");

    const updateTextPosition = () => {
      const scrollPosition = window.scrollY;
      scrollingText.style.transform = `translateX(${-scrollPosition / 15}px)`;
      requestAnimationFrame(updateTextPosition);
    };

    updateTextPosition();

    return () => {
      window.removeEventListener("scroll", updateTextPosition);
    };
  }, []);

  return (
    <div className="moving-text" id="scrollingTextRightToLeft">
      <Heading className="leftToRight flotingText">{props.text}</Heading>
    </div>
  );
};

// MovingTextLeftToRight

const MovingTextLeftToRight = (props) => {
  useEffect(() => {
    const scrollingText = document.getElementById("scrollingTextLeftToRight");

    const updateTextPosition = () => {
      const scrollPosition = window.scrollY;
      scrollingText.style.transform = `translateX(${scrollPosition / 15}px)`;
      requestAnimationFrame(updateTextPosition);
    };

    // Initial positioning
    updateTextPosition();

    // Cleanup function to remove the event listener when the component unmounts
    return () => {
      window.removeEventListener("scroll", updateTextPosition);
    };
  }, []); // Empty dependency array ensures that the effect runs only once (on mount)

  return (
    <div className="moving-text" id="scrollingTextLeftToRight">
      <Heading className="RightToLeft flotingText">{props.text}</Heading>
    </div>
  );
};

export default FlotingText;
