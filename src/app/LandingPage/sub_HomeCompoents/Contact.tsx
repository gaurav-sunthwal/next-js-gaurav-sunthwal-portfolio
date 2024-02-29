"use client"

import {
  Box,
  Button,
  FormControl,
  FormHelperText,
  FormLabel,
  HStack,
  Heading,
  Input,
  Textarea,
  VStack,
  useMediaQuery,
} from "@chakra-ui/react";
import { Link } from "react-router-dom";
import emailjs from "@emailjs/browser";
import { useRef, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import Title from "@/app/Components/Title";

interface FormElementProps {
  label: string;
  type: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  nameId: string;
}

interface SocialCardProps {
  link: string;
  icon: React.ReactNode; // Adjust type as per your icon component
}

function Contact(): JSX.Element {
  const [isLargerThan] = useMediaQuery("(min-width: 1000px)");

  const form = useRef<HTMLFormElement>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const sendEmail = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    emailjs
      .sendForm(
        "service_734aiqi",
        "template_4r1j11q",
        form.current,
        "PCu8cBYWjJNRMZQG2"
      )
      .then(
        (result) => {
          toast.success("Successfully Received!");
        },
        (error) => {
          toast(error.text);
        }
      );
    e.currentTarget.reset();
  };

  const handalClick = () => {};

  return (
    <div>
      <Toaster />
      <Box p={3}>
        <VStack
          minH={isLargerThan ? "100vh" : "auto"}
          justifyContent={"center"}
          w={"100%"}
        >
          <Box p={3}>
            <Title title={"Contact Me"} />
          </Box>
          <HStack
            w={"100%"}
            justifyContent={isLargerThan ? "center" : "normal"}
          >
            <Box maxW={"100%"} w={isLargerThan ? "60%" : "100%"}>
              <form ref={form} onSubmit={sendEmail}>
                <FormElement
                  label={"Enter Name"}
                  type={"text"}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  nameId={"from_name"}
                />
                <FormElement
                  label={"Enter Email"}
                  type={"email"}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  nameId={"user_email"}
                />
                <Box m={3}>
                  <FormControl>
                    <FormLabel>Message</FormLabel>
                    <Textarea
                      rows={isLargerThan ? "10" : "7"}
                      required
                      name="message"
                    />
                  </FormControl>
                </Box>
                <VStack p={3}>
                  <Button type="submit" m={3} w={"60%"} onClick={handalClick}>
                    Submit
                  </Button>
                </VStack>
              </form>
            </Box>
          </HStack>
        </VStack>
      </Box>
    </div>
  );
}

function FormElement({
  label,
  type,
  value,
  onChange,
  nameId,
}: FormElementProps): JSX.Element {
  return (
    <Box m={3}>
      <FormControl>
        <FormLabel>{label}</FormLabel>
        <Input
          type={type}
          value={value}
          onChange={onChange}
          name={nameId}
          required
        />
      </FormControl>
    </Box>
  );
}

function SocialCard({ link, icon }: SocialCardProps): JSX.Element {
  return (
    <Box m={3}>
      <Link to={link} target="blank">
        <Heading>{icon}</Heading>
      </Link>
    </Box>
  );
}

export default Contact;
