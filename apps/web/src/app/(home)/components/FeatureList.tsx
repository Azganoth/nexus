"use client";

import { motion, stagger, type Variants } from "motion/react";

const features = [
  {
    title: "Crie seu perfil",
    description:
      "Monte um perfil com todos os seus links importantes — redes sociais, portfólio, contatos e mais — em um só lugar.",
  },
  {
    title: "Organize do seu jeito",
    description:
      "Adicione, edite e reorganize seus links, controle visibilidade e personalize seu perfil com avatar, nome e bio.",
  },
  {
    title: "Compartilhe fácil",
    description:
      "Tenha um link único e curto para facilitar o acesso a tudo o que você faz, ideal para freelancers, criadores e devs.",
  },
];

const listVariants: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      delayChildren: stagger(0.2),
    },
  },
};

const itemVariants: Variants = {
  hidden: {
    opacity: 0,
    x: -20,
  },
  visible: {
    opacity: 1,
    x: 0,
  },
};

export function FeatureList() {
  return (
    <motion.ul
      className="space-y-6"
      initial="hidden"
      whileInView="visible"
      variants={listVariants}
      viewport={{ once: true }}
    >
      {features.map((feature) => (
        <motion.li key={feature.title} variants={itemVariants}>
          <h3 className="text-xl font-bold">{feature.title}</h3>
          <p>{feature.description}</p>
        </motion.li>
      ))}
    </motion.ul>
  );
}
