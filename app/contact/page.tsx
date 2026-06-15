"use client";

import React, { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Input, TextArea } from "@/components/Input";
import { Button } from "@/components/Button";

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });
  const [btnState, setBtnState] = useState<"idle" | "sending" | "sent">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBtnState("sending");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      setBtnState("sent");
      setTimeout(() => {
        setFormData({ name: "", email: "", subject: "", message: "" });
        setBtnState("idle");
      }, 3000);
    } catch (error) {
      console.error(error);
      alert("Something went wrong. Please try again later.");
      setBtnState("idle");
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.pageYOffset;
      const heroImg = document.querySelector(".parallax-bg img") as HTMLElement;
      if (heroImg) {
        heroImg.style.transform = `translateY(${scrolled * 0.1}px)`;
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="bg-surface text-on-surface min-h-screen flex flex-col selection:bg-primary/20 selection:text-primary antialiased">
      <Navigation />

      <main className="flex-grow pt-32 pb-20 px-margin-mobile">
        <div className="max-w-[800px] mx-auto">
          {/* Header Title */}
          <section className="text-center mb-16 transition-all duration-1000">
            <h1 className="font-display-lg text-display-lg text-on-surface mb-6 tracking-tight">
              Let's collaborate on something great.
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto leading-relaxed">
              Always open to discussing new projects and technical challenges. Whether you have a specific idea or just want to say hello, my inbox is always open.
            </p>
          </section>

          <div className="grid grid-cols-1 gap-12">
            {/* Contact Form */}
            <form
              onSubmit={handleSubmit}
              className="bg-surface-container-lowest rounded-xl p-8 md:p-12 shadow-sm border border-outline-variant/20 space-y-8 transition-all duration-1000"
              id="contact-form"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Input
                  label="Full Name"
                  id="name"
                  name="name"
                  placeholder="John Doe"
                  required
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-surface-container-low border-none focus:ring-2 focus:ring-primary focus:bg-surface-container-lowest focus:outline-none"
                />
                <Input
                  label="Email Address"
                  id="email"
                  name="email"
                  placeholder="john@example.com"
                  required
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="bg-surface-container-low border-none focus:ring-2 focus:ring-primary focus:bg-surface-container-lowest focus:outline-none"
                />
              </div>
              <Input
                label="Subject"
                id="subject"
                name="subject"
                placeholder="Project Inquiry"
                required
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="bg-surface-container-low border-none focus:ring-2 focus:ring-primary focus:bg-surface-container-lowest focus:outline-none"
              />
              <TextArea
                label="Message"
                id="message"
                name="message"
                placeholder="Tell me about your project..."
                required
                rows={5}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="bg-surface-container-low border-none focus:ring-2 focus:ring-primary focus:bg-surface-container-lowest focus:outline-none resize-none"
              />

              {/* Submit Button */}
              <Button
                disabled={btnState !== "idle"}
                variant="primary"
                className={`w-full py-4 h-auto rounded-lg font-title-md text-title-md flex items-center justify-center gap-3 border-none group ${
                  btnState === "sent" ? "bg-green-600 hover:bg-green-700 text-white" : ""
                }`}
                type="submit"
              >
                {btnState === "idle" && (
                  <>
                    <span>Send Message</span>
                    <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">
                      send
                    </span>
                  </>
                )}
                {btnState === "sending" && (
                  <>
                    <span className="material-symbols-outlined animate-spin">sync</span>
                    <span>Sending...</span>
                  </>
                )}
                {btnState === "sent" && (
                  <>
                    <span className="material-symbols-outlined">check_circle</span>
                    <span>Message Sent!</span>
                  </>
                )}
              </Button>
            </form>

            {/* Social Grid Channels */}
            <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 pt-8 transition-all">
              <a
                className="flex items-center gap-3 text-secondary hover:text-primary transition-colors group"
                href="https://github.com/gaurav-sunthwal"
                target="_blank"
                rel="noreferrer"
              >
                <div className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                  <span className="material-symbols-outlined text-2xl">code</span>
                </div>
                <span className="font-label-md text-label-md">GitHub</span>
              </a>
              <a
                className="flex items-center gap-3 text-secondary hover:text-primary transition-colors group"
                href="https://linkedin.com/in/gaurav-sunthwal"
                target="_blank"
                rel="noreferrer"
              >
                <div className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                  <span className="material-symbols-outlined text-2xl">person_search</span>
                </div>
                <span className="font-label-md text-label-md">LinkedIn</span>
              </a>
              <a
                className="flex items-center gap-3 text-secondary hover:text-primary transition-colors group"
                href="mailto:gauravsunthwalwork@gmail.com"
              >
                <div className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                  <span className="material-symbols-outlined text-2xl">alternate_email</span>
                </div>
                <span className="font-label-md text-label-md">Email</span>
              </a>
            </div>
          </div>
        </div>
      </main>

      {/* Location Parallax Banner */}
      <div className="relative w-full h-[400px] mt-20 overflow-hidden parallax-bg">
        <div className="absolute inset-0 z-0 grayscale opacity-40 hover:opacity-100 transition-opacity duration-700">
          <img
            className="w-full h-full object-cover transition-transform duration-300 ease-out"
            alt="Office background"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCtaqDLfVzcZCJEF2jKtZtagY66U_rFR8UaT_kchy2wAjpX6ZsNU_GK6gAUdpneqCp8STY1BpRg78kp8_0ZP42HtP_fPXdyq4EbALBP-t8HECS8tBHYUhQB9lXrMJVfQs2_K6Dk9alxXrj2dKBcXKEqKRTztUq0ZI7NAxaNSc1XylmV4KLlQ8hb0NdWNA_RmAWbKO1_ZUsbnyjaU7H0hYobMkKU-cb_WS9KQ2_5UmJum3CLdEEJCertAekcmoh69QYi8FPblooPz2nd"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent pointer-events-none"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-surface via-transparent to-transparent pointer-events-none"></div>
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-margin-mobile">
          <div className="bg-surface/60 backdrop-blur-xl p-8 rounded-2xl border border-white/40 shadow-xl max-w-md">
            <span className="material-symbols-outlined text-primary text-4xl mb-4">location_on</span>
            <h3 className="font-headline-lg text-headline-lg mb-2 text-on-surface">Based in Pune, India</h3>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Available for remote work worldwide and local consultations.
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
