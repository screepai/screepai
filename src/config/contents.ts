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

type AboutSlide = {
   kind: "about";
   label: string;
   heading: string;
   items: readonly string[];
};

type SocialsSlide = {
   kind: "socials";
   label: string;
   heading: string;
   links: readonly SocialLink[];
   note: string;
};

type CreditsSlide = {
   kind: "credits";
   label: string;
   heading: string;
   credits: readonly Credit[];
};

export type ContentSlide = AboutSlide | SocialsSlide | CreditsSlide;

const aboutItems = [
   "programmer / animator / editor",
   "profound mental retardation",
   "visual novel enthusiast",
   "vietnamese / english",
] as const;

const credits: readonly Credit[] = [
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

const socialLinks: readonly SocialLink[] = [
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

export const contentSlides = [
   {
      kind: "about",
      label: "About",
      heading: "About me",
      items: aboutItems,
   },
   {
      kind: "socials",
      label: "Socials",
      heading: "Socials",
      links: socialLinks,
      note: "(i dont post anything, just here for the fancy)",
   },
   {
      kind: "credits",
      label: "Credits",
      heading: "Credits",
      credits,
   },
] as const satisfies readonly ContentSlide[];
