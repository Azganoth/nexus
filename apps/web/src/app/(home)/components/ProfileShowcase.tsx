"use client";

import { Tilt } from "$/components/ui/Tilt";
import profile from "$/images/Profile1.png";
import { motion, type Variants } from "motion/react";
import Image from "next/image";

const variants: Variants = {
  hidden: {
    opacity: 0,
    x: 20,
  },
  visible: {
    opacity: 1,
    x: 0,
  },
};

export function ProfileShowcase() {
  return (
    <Tilt>
      <motion.div
        variants={variants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <Image
          className="max-desktop:max-w-[311px] max-tablet:mx-auto rounded-[3rem] shadow-2xl"
          src={profile}
          alt="Exemplo de um perfil."
        />
      </motion.div>
    </Tilt>
  );
}
