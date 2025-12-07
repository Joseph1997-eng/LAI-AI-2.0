"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-primary/20 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-blue-500/10 rounded-full blur-[120px] -z-10" />

      <div className="z-10 flex flex-col items-center text-center space-y-8 max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="p-2 rounded-2xl glass inline-block mb-4"
        >
          <div className="w-24 h-24 rounded-full overflow-hidden">
            <Image
              src="/joseph.jpg"
              alt="Joseph AI"
              width={96}
              height={96}
              className="object-cover"
            />
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-5xl md:text-7xl font-bold tracking-tight text-foreground"
        >
          Joseph&apos;s Assistant <br />
          <span className="text-primary">LAI AI</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-xl text-muted-foreground max-w-xl"
        >
          Hmailei AI biaruahnak sining cu a tu ah rak hman ve. A tha bik, a rang i zeitik caan paoh ah hman khawh a si.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex gap-4"
        >
          <Link
            href="/chat"
            className="group relative inline-flex h-12 items-center justify-center overflow-hidden rounded-full bg-primary px-8 font-medium text-primary-foreground transition-all duration-300 hover:bg-primary/90 hover:scale-105 hover:shadow-[0_0_40px_8px_rgba(124,58,237,0.5)]"
          >
            <span className="mr-2">Start Chatting</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>

          <Link
            href="/login"
            className="inline-flex h-12 items-center justify-center rounded-full border border-input bg-background/50 px-8 font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground backdrop-blur-sm"
          >
            Sign In
          </Link>
        </motion.div>
      </div>
    </main>
  );
}
