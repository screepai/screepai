export type Credit = {
   name: string;
   url: string;
   at: string;
};

export type SocialLink = {
   url: string;
   icon: string;
   label: string;
};

export const menu = ["About", "Socials", "Credits"] as const;

export const cards = [
   "programmer / animator / editor",
   "profound mental retardation",
   "visual novel enthusiast",
   "vietnamese / english",
] as const;

export const credits: Credit[] = [
   {
      name: "background art (light)",
      url: "https://x.com/tubarururu",
      at: "@tubarururu"
   },
   {
      name: "background art (dark)",
      url: "https://x.com/HcpWa",
      at: "@HcpWa"
   },
   {
      name: "og image",
      url: "https://x.com/MikaPikaZo",
      at: "@MikaPikaZo"
   }
];

export const socialLinks: SocialLink[] = [
   {
      url: "https://github.com/screepai",
      icon: "#icon-905",
      label: "GitHub"
   },
   {
      url: "https://x.com/akihitokamikoto",
      icon: "#icon-910",
      label: "X"
   },
   {
      url: "https://www.youtube.com/channel/UCmLrPwbAiDpiPbXjPrD22Hw",
      icon: "#icon-969",
      label: "YouTube"
   }
];
