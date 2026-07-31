export interface NavigationItem {
  title: string;
  href?: string;
  children?: NavigationItem[];
}

export const navigation: NavigationItem[] = [
  {
    title: "Home",
    href: "/",
  },
  {
    title: "Invitations",
    children: [
      { title: "Wedding Invitations", href: "/catalogue/wedding" },
      { title: "Reception Invitations", href: "/catalogue/reception" },
      { title: "Engagement Invitations", href: "/catalogue/engagement" },
      { title: "Housewarming Invitations", href: "/catalogue/housewarming" },
      { title: "Baby Shower Invitations", href: "/catalogue/baby-shower" },
      { title: "Birthday Invitations", href: "/catalogue/birthday" },
      { title: "Puberty Invitations", href: "/catalogue/puberty" },
      { title: "Shop Opening Invitations", href: "/catalogue/shop-opening" },
      { title: "Yellow Rose Traditional", href: "/catalogue/yellow-rose" },
    ],
  },
  {
    title: "Premium Collections",
    children: [
      { title: "Acrylic Invitations", href: "/premium/acrylic" },
      { title: "Velvet Finish", href: "/premium/velvet" },
      { title: "Luxury Invitations", href: "/premium/luxury" },
      { title: "Box Invitations", href: "/premium/box" },
      { title: "Laser Cut", href: "/premium/laser-cut" },
      { title: "Foil Stamped", href: "/premium/foil" },
      { title: "Metallic Finish", href: "/premium/metallic" },
      { title: "Embossed & Debossed", href: "/premium/embossed" },
      { title: "Custom Luxury", href: "/premium/custom" },
    ],
  },
  {
    title: "Commercial Printing",
    children: [
      { title: "Visiting Cards", href: "/printing/visiting-cards" },
      { title: "Bill Books", href: "/printing/bill-books" },
      { title: "Letterheads", href: "/printing/letterheads" },
      { title: "Flyers", href: "/printing/flyers" },
      { title: "Pamphlets", href: "/printing/pamphlets" },
      { title: "Product Labels", href: "/printing/product-labels" },
      { title: "Product Stickers", href: "/printing/product-stickers" },
      { title: "Office Covers", href: "/printing/office-covers" },
      { title: "Calendars", href: "/printing/calendars" },
      { title: "Sunpack Boards", href: "/printing/sunpack-boards" },
      { title: "Moi Covers", href: "/printing/moi-covers" },
      { title: "Viboothi Covers", href: "/printing/viboothi-covers" },
    ],
  },
  {
    title: "Accessories",
    children: [
      { title: "Thamboolam Bags", href: "/accessories/thamboolam-bags" },
      { title: "Festival Bags", href: "/accessories/festival-bags" },
      { title: "Family Function Bags", href: "/accessories/family-function-bags" },
    ],
  },
  {
    title: "About",
    href: "/about",
  },
  {
    title: "Contact",
    href: "/contact",
  },
];