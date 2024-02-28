"use client"

import {
    Box,
    Button,
    Card,
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
  function Contact() {
    const [isLargerThan] = useMediaQuery("(min-width: 1000px)");
  
    // Form Data
    const form = useRef();
  
    const sendEmail = (e) => {
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
      e.target.reset();
    };
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    // const [message, setMessage] = useState("");
  
    function handalClick() {}
  
    return (
      <div>
        <Toaster />
        <Box  p={3}>
          <VStack minH={isLargerThan ? "100vh" : "auto"} justifyContent={"center"} w={"100%"}>
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
                    lable={"Enter Name"}
                    type={"name"}
                    // value={name}
                    name_id={"from_name"}
                    // onChange={(e) => {
                    //   setName(e.target.value);
                    // }}
                  />
                  <FormElement
                    lable={"Enter Email"}
                    type={"email"}
                    name_id={"user_email"}
                    // value={email}
                    // onChange={(e) => {
                    //   setEmail(e.target.value);
                    // }}
                  />
                  <Box m={3}>
                    <FormControl>
                      <FormLabel>Message</FormLabel>
                      <Textarea
                        rows={isLargerThan ? "10" : "7"}
                        required
                        // value={message}
                        name="message"
                        // onChange={(e) => {
                        //   setMessage(e.target.value);
                        // }}
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
            {/* <HStack justifyContent={"space-around"} w={"70%"} flexWrap={"wrap"}>
              <HStack>
                <SocalCard icon={<FaInstagram />} link={"https:/instagram.com/gaurav_sunthwal"}/>
                <SocalCard icon={<VscGithubInverted />} link={"https://github.com/gaurav-sunthwal"} />
                <SocalCard icon={<FaLinkedin />} link={"https://www.linkedin.com/in/gaurav-sunthwal/"} />
              </HStack>
              <Box>
                <a href="mailto:gauravsunthwal162022@gmail.com" target="blank">
                  <Heading size={"sm"}>gauravsunthwal162022@gmail.com</Heading>
                </a>
              </Box>
            </HStack> */}
          </VStack>
        </Box>
      </div>
    );
  }
  
  function FormElement({ lable, type, value, onChange, name_id }) {
    return (
      <>
        <Box m={3}>
          <FormControl>
            <FormLabel>{lable}</FormLabel>
            <Input
              type={type}
              value={value}
              onChange={onChange}
              name={name_id}
              required
            />
          </FormControl>
        </Box>
      </>
    );
  }
  
  function SocalCard({ link, icon }) {
    return (
      <>
        <Box m={3}>
          <Link to={link} target="blank">
            <Heading>{icon}</Heading>
          </Link>
        </Box>
      </>
    );
  }
  export default Contact;
  