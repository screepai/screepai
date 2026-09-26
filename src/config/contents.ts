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

export type SocialExtraLink = {
   label: string;
   value: string;
   url: string;
}

type AboutSlide = {
   kind: "about";
   label: string;
   heading: string;
   items: readonly string[];
};

export type SystemItem = {
   label: string;
   value: string;
   url?: string;
};

export type SystemRowGroup = {
   kind: "rows";
   title: string;
   items: readonly SystemItem[];
};

export type StackLevel = {
   label: string;
   items: readonly string[];
};

export type SystemStackGroup = {
   kind: "stack";
   title: string;
   levels: readonly StackLevel[];
};

export type SystemGroup =
   | SystemRowGroup
   | SystemStackGroup;

type SystemSlide = {
   kind: "system";
   label: string;
   heading: string;
   groups: readonly SystemGroup[];
};

export type MemoryWipePick = {
   title: string;
   note: string;
   url?: string;
};

type InterestsSlide = {
   kind: "interests";
   label: string;
   heading: string;

   memoryPicks: {
      anime: readonly MemoryWipePick[];
      manga: readonly MemoryWipePick[];
      visualNovels: readonly MemoryWipePick[];
   };
};

type SocialsSlide = {
   kind: "socials";
   label: string;
   heading: string;
   links: readonly SocialLink[];
   findMe: readonly SocialExtraLink[];
   note?: string;
};

type CreditsSlide = {
   kind: "credits";
   label: string;
   heading: string;
   credits: readonly Credit[];
};

export type ContentSlide =
   | AboutSlide
   | SystemSlide
   | InterestsSlide
   | SocialsSlide
   | CreditsSlide;

const aboutItems = [
   "AI researcher / AI & software engineer",
   "programmer / animator / editor",
   "profound mental retardation",
   "visual novel enthusiast",
   "vietnamese / english",
] as const;

const systemGroups: readonly SystemGroup[] = [
   {
      kind: "rows",
      title: "hardware",
      items: [
         {
            label: "CPU",
            value: "Intel Core i5-13500",
         },
         {
            label: "GPU",
            value: "AMD Radeon RX 6700 XT",
         },
         {
            label: "Memory",
            value: "32 GiB",
         },
         {
            label: "Storage",
            value: "~2 TiB / Btrfs",
         },
      ],
   },
   {
      kind: "rows",
      title: "environment",
      items: [
         {
            label: "OS",
            value: "CachyOS",
         },
         {
            label: "Kernel",
            value: "CachyOS BORE LTO",
         },
         {
            label: "WM",
            value: "Hyprland / Wayland",
         },
         {
            label: "Desktop",
            value: "end4-pC",
            url: "https://github.com/pctrade/end4-pC"
         },
         {
            label: "Cursor",
            value: "Cyrene",
            url: "https://vsthemes.org/en/cursors/anime/74422-cyrene-honkai.html",
         },
         {
            label: "Shell",
            value: "fish",
         },
         {
            label: "Terminal",
            value: "kitty",
         },
      ],
   },
   {
      kind: "rows",
      title: "display",
      items: [
         {
            label: "Main",
            value: '24" / 1080p / 165 Hz',
         },
         {
            label: "Second",
            value: '24" / 1080p / 100 Hz',
         },
         {
            label: "TV",
            value: '72" Sony / 1080p / 60 Hz',
         },
      ],
   },
   {
      kind: "stack",
      title: "stack",
      levels: [
         {
            label: "comfortable",
            items: [
               "TypeScript",
               "JavaScript",
               "Python",
               "Svelte",
               "React",
               "Next.js",
               "MySQL",
               "PostgreSQL",
               "Redis",
               "Docker",
               "MongoDB",
               "Firebase",
               "Git",
               "Codex 🤑",
               "Claude Code 🤑",
            ],
         },
         {
            label: "familiar",
            items: [
               "C++",
               "Java",
               "Lua",
               "Rust",
               "Tailwind CSS",
               "TensorFlow",
               "Keras",
               "NumPy",
               "Jupyter",
               "Kaggle",
            ],
         },
         {
            label: "creative",
            items: [
               "Photoshop",
               "Live2D",
               "After Effects",
               "Premiere Pro",
               "Alight Motion",
            ],
         },
         {
            label: "learning",
            items: [
               "PyTorch",
               "pandas",
               "scikit-learn",
               "Hugging Face",
               "Transformers",
               "llama.cpp",
               "vLLM",
               "FAISS",
               "Qdrant",
               "FastAPI",
               "CUDA",
            ],
         },
         {
            label: "touched",
            items: [
               "C",
               "C#",
               "Go",
               "PHP",
            ],
         },
      ],
   },
];

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

const findMeLinks: readonly SocialExtraLink[] = [
   {
      label: "Xitter",
      value: "@akihitokamikoto",
      url: "https://x.com/akihitokamikoto",
   },
   {
      label: "TikTok",
      value: "@screepai",
      url: "https://www.tiktok.com/@screepai",
   },
   {
      label: "YouTube",
      value: "@screepai",
      url: "https://www.youtube.com/@screepai",
   },
];

const interestMemoryPicks: InterestsSlide["memoryPicks"] = {
   anime: [
      {
         title: "Saenai Heroine no Sodatekata",
         note: "oh my god i absolutely love the romance in this anime, say what you want but megumi best girl and i love the movie so much",
         url: "https://myanimelist.net/anime/23277/Saenai_Heroine_no_Sodatekata",
      },
      {
         title: "Plastic Memories",
         note: "first anime that made me cry when i started watching anime, that sense of impending doom and the bittersweet romance is just so good",
         url: "https://myanimelist.net/anime/27775/Plastic_Memories",
      },
      {
         title: "Acchi Kocchi",
         note: "my comfort anime, the romance is so cute and wholesome and the comedy is just so good, i put it on whenever i work on something and the ost is really relaxing too",
         url: "https://myanimelist.net/anime/12291/Acchi_Kocchi",
      },
      {
         title: "Shuumatsu Nani Shitemasu ka? Isogashii desu ka? Sukutte Moratte Ii desu ka?",
         note: "gang, what word do i need for this?",
         url: "https://myanimelist.net/anime/33502/Shuumatsu_Nani_Shitemasu_ka_Isogashii_desu_ka_Sukutte_Moratte_Ii_desu_ka",
      },
      {
         title: "anything by Makoto Shinkai",
         note: "wonderful animation, beautiful romance, amazing music, and the stories are just so good for first time watching, i love the bittersweet romance in his works",
         url: "https://myanimelist.net/people/1117/Makoto_Shinkai",
      },
   ],

   manga: [
      {
         title: "anything in my list",
         note: "honestly i am very selective with manga, i only read romance manga and some shounen manga, i dont update the list as often as i should, but i do have a lot of manga in my list that i would love to read again if i could",
         url: "https://myanimelist.net/mangalist/screepy",
      },
   ],

   visualNovels: [
      {
         title: "Summer Pockets: Reflection Blue",
         note: "Key strikes again with a wonderful romance story, the music is amazing and the art is beautiful, i love the bittersweet romance in this visual novel. the anime butchered the story but the visual novel is just so good, i would love to play it again if i could",
         url: "https://vndb.org/v20424",
      },
      {
         title: "Amakano series and anything by Azarashi Soft",
         note: "best romance visual novel series i have ever played, literally nothing is happening but lovey dovey couples",
         url: "https://vndb.org/p4542",
      },
      {
         title: "Atri: My Dear Moments",
         note:
            "Asta Konno's writing and Yusano's art made up a very cute high performance robot, i love the bittersweet romance in this visual novel, the music is amazing and the art is beautiful, i would love to play it again if i could",
         url: "https://vndb.org/v27448",
      },
      {
         title: "anything by Yuzusoft",
         note:
            "no words, i played most of their visual novels and how i wish they can pump out more",
         url: "https://vndb.org/p98",
      },
      {
         title: "everything else in my list",
         note: "im not very selective with visual novels, i just read whatever is romance and has a good story",
         url: "https://vndb.org/u326697/ulist?q=&ch=&f=&l=1&l=2&l=3&l=4&l=5&l=6&l=7&mul=1&s=3q02",
      },
   ],
};

export const contentSlides = [
   {
      kind: "about",
      label: "About",
      heading: "About me",
      items: aboutItems,
   },
   {
      kind: "system",
      label: "System",
      heading: "System",
      groups: systemGroups,
   },
   {
      kind: "interests",
      label: "Interests",
      heading: "Interests",

      memoryPicks:
         interestMemoryPicks,
      },
   {
      kind: "socials",
      label: "Socials",
      heading: "Socials",
      links: socialLinks,
      findMe: findMeLinks,
      note: "(i dont post anything, just here for the fancy)",
   },
   {
      kind: "credits",
      label: "Credits",
      heading: "Credits",
      credits,
   },
] as const satisfies readonly ContentSlide[];
