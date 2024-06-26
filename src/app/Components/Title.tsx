import { Box, Heading } from "@chakra-ui/react";

interface TitleProps {
  title: string;
}

function Title({ title }: TitleProps) {
  return (
    <div>
      <Box p={3} textAlign={"center"}>
        <Heading color={"#E4E4E7"} size={"2xl"} className="title">
          {title}
        </Heading>
      </Box>
    </div>
  );
}

export default Title;
