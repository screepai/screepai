export type Credit = {
   name: string;
   url: string;
   at: string;
};

export type SocialLink = {
   url: string;
   icon: string;
   label: string;
   tooltip?: string;
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
   "AI researcher / AI & software engineer",
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
      icon: "#icon-github",
      label: "GitHub",
      tooltip: "i write code to make money now so less active on here, but i do have 3 (three) public repos including this website's source code"
   },
   {
      url: "https://myanimelist.net/animelist/screepy",
      icon: "#icon-mal",
      label: "MyAnimeList",
      tooltip: "i barely watch anime nowadays, manga list is also here if youre interested. i also dont update this list as often as i should"
   },
   {
      url: "https://vndb.org/u326697/ulist?q=&ch=&f=&l=1&l=2&l=3&l=4&l=5&l=6&l=7&mul=1&s=3q02",
      icon: "#icon-vndb",
      label: "VNDB",
      tooltip: "oh my god i love reading romance slop"
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
