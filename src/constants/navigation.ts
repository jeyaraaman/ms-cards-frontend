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
    title: "Collections",
    href: "/catalogue",
  },

  {
    title: "Premium Collections",
    href: "/premium",
  },

  {
    title: "Commercial Printing",
    children: [
      {
        title: "Visiting Cards",
        href: "/printing/visiting-cards",
      },
      {
        title: "Bill Books",
        href: "/printing/bill-books",
      },
      {
        title: "Letterheads",
        href: "/printing/letterheads",
      },
      {
        title: "Flyers",
        href: "/printing/flyers",
      },
      {
        title: "Pamphlets",
        href: "/printing/pamphlets",
      },
      {
        title: "Product Labels",
        href: "/printing/product-labels",
      },
      {
        title: "Product Stickers",
        href: "/printing/product-stickers",
      },
      {
        title: "Office Covers",
        href: "/printing/office-covers",
      },
      {
        title: "Calendars",
        href: "/printing/calendars",
      },
      {
        title: "Sunpack Boards",
        href: "/printing/sunpack-boards",
      },
      {
        title: "Moi Covers",
        href: "/printing/moi-covers",
      },
      {
        title: "Viboothi Covers",
        href: "/printing/viboothi-covers",
      },
    ],
  },

  {
    title: "Accessories",
    children: [
      {
        title: "Thamboolam Bags",
        href: "/accessories/thamboolam-bags",
      },
      {
        title: "Festival Bags",
        href: "/accessories/festival-bags",
      },
      {
        title: "Family Function Bags",
        href: "/accessories/family-function-bags",
      },
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