export interface Category {
  id: string;
  title: string;
  description: string;
  image: string;
  href: string;
}

export const categories: Category[] = [
  {
    id: "wedding",
    title: "Wedding Invitations",
    description: "Elegant invitations crafted for your special day.",
    image: "/images/categories/wedding.jpg",
    href: "/catalogue/wedding",
  },
  {
    id: "reception",
    title: "Reception Invitations",
    description: "Celebrate unforgettable receptions with premium designs.",
    image: "/images/categories/reception.jpg",
    href: "/catalogue/reception",
  },
  {
    id: "engagement",
    title: "Engagement Invitations",
    description: "Beautiful engagement invitation collections.",
    image: "/images/categories/engagement.jpg",
    href: "/catalogue/engagement",
  },
  {
    id: "housewarming",
    title: "Housewarming Invitations",
    description: "Invite loved ones to your new beginning.",
    image: "/images/categories/housewarming.jpg",
    href: "/catalogue/housewarming",
  },
  {
    id: "baby-shower",
    title: "Baby Shower",
    description: "Celebrate precious new beginnings.",
    image: "/images/categories/baby-shower.jpg",
    href: "/catalogue/baby-shower",
  },
  {
    id: "birthday",
    title: "Birthday Invitations",
    description: "Make every birthday memorable.",
    image: "/images/categories/birthday.jpg",
    href: "/catalogue/birthday",
  },
  {
    id: "shop-opening",
    title: "Shop Opening",
    description: "Professional invitations for grand openings.",
    image: "/images/categories/shop-opening.jpg",
    href: "/catalogue/shop-opening",
  },
  {
    id: "premium",
    title: "Premium Collections",
    description: "Luxury invitation collections.",
    image: "/images/categories/premium.jpg",
    href: "/premium",
  },
];