export interface PremiumCollection {
  id: string;
  title: string;
  description: string;
  image: string;
  href: string;
}

export const premiumCollections: PremiumCollection[] = [
  {
    id: "acrylic",
    title: "Acrylic Invitations",
    description: "Elegant transparent invitations with a modern luxury finish.",
    image: "/images/premium/acrylic.jpg",
    href: "/premium/acrylic",
  },
  {
    id: "velvet",
    title: "Velvet Finish",
    description: "Soft-touch premium invitations with rich texture.",
    image: "/images/premium/velvet.jpg",
    href: "/premium/velvet",
  },
  {
    id: "laser-cut",
    title: "Laser Cut",
    description: "Intricately crafted laser-cut invitation designs.",
    image: "/images/premium/laser-cut.jpg",
    href: "/premium/laser-cut",
  },
  {
    id: "foil",
    title: "Foil Stamped",
    description: "Premium metallic foil stamping for elegant invitations.",
    image: "/images/premium/foil.jpg",
    href: "/premium/foil",
  },
  {
    id: "box",
    title: "Box Invitations",
    description: "Luxury invitation boxes for grand celebrations.",
    image: "/images/premium/box.jpg",
    href: "/premium/box",
  },
];