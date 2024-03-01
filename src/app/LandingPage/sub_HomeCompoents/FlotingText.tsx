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
        LeftToRightText={
          "I Can : Artificial Intelligence • Web Development • App Development"
        }
      />
    </VStack>
  );
}

const MovingTextRightToLeft = ({text}: { text: string }) => {
  useEffect(() => {
    const scrollingText = document.getElementById("scrollingTextRightToLeft");

    if (scrollingText) {
      const updateTextPosition = () => {
        const scrollPosition = window.scrollY;
        scrollingText.style.transform = `translateX(${-scrollPosition / 15}px)`;
        requestAnimationFrame(updateTextPosition);
      };

      updateTextPosition();

      return () => {
        window.removeEventListener("scroll", updateTextPosition);
      };
    }
  }, []);

  return (
    <div className="moving-text" id="scrollingTextRightToLeft">
      <Heading className="leftToRight flotingText">{text}</Heading>
    </div>
  );
};

// MovingTextLeftToRight
const MovingTextLeftToRight = ({LeftToRightText}: { LeftToRightText: string }) => {
  useEffect(() => {
    const scrollingText = document.getElementById("scrollingTextLeftToRight");

    if (scrollingText) {
      const updateTextPosition = () => {
        const scrollPosition = window.scrollY;
        scrollingText.style.transform = `translateX(${scrollPosition / 15}px)`;
        requestAnimationFrame(updateTextPosition);
      };

      updateTextPosition();

      return () => {
        window.removeEventListener("scroll", updateTextPosition);
      };
    }
  }, []);

  return (
    <div className="moving-text" id="scrollingTextLeftToRight">
      <Heading className="RightToLeft flotingText">{LeftToRightText}</Heading>
    </div>
  );
};

export default FlotingText;
