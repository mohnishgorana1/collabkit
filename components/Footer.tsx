"use client";

import Link from "next/link";
import { Command} from "lucide-react";
import { BsGithub, BsLinkedin, BsTwitter } from "react-icons/bs";
import Logo from "./Logo";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    {
      title: "Product",
      links: [
        { name: "Features", href: "#features" },
        { name: "Integrations", href: "#" },
        { name: "Pricing", href: "#" },
        { name: "Changelog", href: "#" },
      ],
    },
    {
      title: "Resources",
      links: [
        { name: "Documentation", href: "#" },
        { name: "Blog", href: "#" },
        { name: "Community", href: "#" },
        { name: "Help Center", href: "#" },
      ],
    },
    {
      title: "Company",
      links: [
        { name: "About Us", href: "#" },
        { name: "Careers", href: "#" },
        { name: "Legal", href: "#" },
        { name: "Contact", href: "#" },
      ],
    },
  ];

  return (
    <footer className="w-full border-t border-border/50 bg-background/40 backdrop-blur-md pt-20 pb-10 px-4 relative z-10">
      <div className="max-w-6xl mx-auto flex flex-col gap-16">
        
        {/* Top Section: Brand & Links Grid */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-12 md:gap-8">
          
          {/* Brand Identity */}
          <div className="flex flex-col gap-4 max-w-sm">
            <Logo />
            <p className="text-muted-foreground text-sm leading-relaxed font-medium">
              Bundle your team&apos;s chat, task boards, and lightweight docs into a single, blazing-fast workspace.
            </p>
          </div>

          {/* Links Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-10 md:gap-16 lg:gap-24">
            {footerLinks.map((section, idx) => (
              <div key={idx} className="flex flex-col gap-4">
                <h4 className="font-semibold text-foreground text-sm tracking-tight">
                  {section.title}
                </h4>
                <ul className="flex flex-col gap-3">
                  {section.links.map((link, linkIdx) => (
                    <li key={linkIdx}>
                      <Link 
                        href={link.href}
                        className="text-[15px] font-medium text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Section: Copyright & Socials */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-8 border-t border-border/50">
          <p className="text-sm font-medium text-muted-foreground">
            &copy; {currentYear} CollabKit Inc. All rights reserved.
          </p>
          
          <div className="flex items-center gap-5 text-muted-foreground">
            <Link href="#" className="hover:text-foreground transition-colors hover:scale-110 active:scale-95">
              <BsTwitter size={18} />
              <span className="sr-only">Twitter</span>
            </Link>
            <Link href="#" className="hover:text-foreground transition-colors hover:scale-110 active:scale-95">
              <BsGithub size={18} />
              <span className="sr-only">GitHub</span>
            </Link>
            <Link href="#" className="hover:text-foreground transition-colors hover:scale-110 active:scale-95">
              <BsLinkedin size={18} />
              <span className="sr-only">LinkedIn</span>
            </Link>
          </div>
        </div>

      </div>
    </footer>
  );
}