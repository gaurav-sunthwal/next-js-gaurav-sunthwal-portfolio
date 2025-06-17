"use client";

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
import { useForm, ValidationError } from '@formspree/react';
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
  icon: React.ReactNode;
}

function Contact(): JSX.Element {
  const [isLargerThan] = useMediaQuery("(min-width: 1000px)");
  
  // Formspree hook
  const [state, handleSubmit] = useForm("mblykjrr");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [ShowContact, setShowContact] = useState(true);

  // Handle form submission
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Create FormData object
    const formData = new FormData();
    formData.append('from_name', name);
    formData.append('user_email', email);
    formData.append('message', message);

    // Submit using Formspree
    const result = await handleSubmit(formData);
    
    // Show success message and reset form if successful
    if (state.succeeded) {
      toast.success("Successfully Received!");
      setName("");
      setEmail("");
      setMessage("");
      setShowContact(false);
    } else if (state.errors && Object.keys(state.errors).length > 0) {
      toast.error("Something went wrong. Please try again.");
    }
  };

  const handalClick = () => {
    // Additional click handler if needed
  };

  return (
    <div>
      {ShowContact === true ? (
        <>
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
                  <form onSubmit={onSubmit}>
                    <FormElement
                      label={"Enter Name"}
                      type={"text"}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      nameId={"from_name"}
                    />
                    <ValidationError 
                      prefix="Name" 
                      field="from_name"
                      errors={state.errors}
                    />
                    
                    <FormElement
                      label={"Enter Email"}
                      type={"email"}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      nameId={"user_email"}
                    />
                    <ValidationError 
                      prefix="Email" 
                      field="user_email"
                      errors={state.errors}
                    />
                    
                    <Box m={3}>
                      <FormControl>
                        <FormLabel>Message</FormLabel>
                        <Textarea
                          rows={isLargerThan ? 10 : 7}
                          required
                          name="message"
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                        />
                      </FormControl>
                    </Box>
                    <ValidationError 
                      prefix="Message" 
                      field="message"
                      errors={state.errors}
                    />
                    
                    <VStack p={3}>
                      <Button
                        type="submit"
                        m={3}
                        w={"60%"}
                        onClick={handalClick}
                        isLoading={state.submitting}
                        loadingText="Submitting..."
                        disabled={state.submitting}
                      >
                        Submit
                      </Button>
                    </VStack>
                  </form>
                </Box>
              </HStack>
            </VStack>
          </Box>
        </>
      ) : (
        <>
          <VStack h={"100vh"} justifyContent={"center"}>
            <Heading>Thanks for Submitting The form</Heading>
            <Button
              mt={4}
              onClick={() => setShowContact(true)}
              colorScheme="blue"
            >
              Submit Another Form
            </Button>
          </VStack>
        </>
      )}
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