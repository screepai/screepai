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
};

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

export type SystemCreativeGroup = {
   kind: "creative";
   title: string;
   items: readonly { name: string; mark: string; focus: string }[];
};

export type SystemGroup = SystemRowGroup | SystemStackGroup | SystemCreativeGroup;

type SystemSlide = {
   kind: "system";
   label: string;
   heading: string;
   groups: readonly SystemGroup[];
};

export type MemoryWipeNotePart =
   string | { text: string; url: string } | { text: string; bold: true };

export type MemoryWipePick = {
   note?: string | readonly MemoryWipeNotePart[];
   url: string;
};

export type GameAccount = {
   name: string;
   uid: string;
   server?: string;
};

type InterestsSlide = {
   kind: "interests";
   label: string;
   heading: string;
   memoryPicks: {
      anime: readonly MemoryWipePick[];
      manga: readonly MemoryWipePick[];
      lightNovels: readonly MemoryWipePick[];
      visualNovels: readonly MemoryWipePick[];
   };
   games: readonly GameAccount[];
};

type SocialsSlide = {
   kind: "socials";
   label: string;
   heading: string;
   links: readonly SocialLink[];
   findMe: readonly SocialExtraLink[];
   contact: {
      discordUrl: string;
      email: string;
   };
   note?: string;
};

type CreditsSlide = {
   kind: "credits";
   label: string;
   heading: string;
   credits: readonly Credit[];
};

export type ContentSlide = AboutSlide | SystemSlide | InterestsSlide | SocialsSlide | CreditsSlide;

const aboutItems = [
   "AI researcher / AI & software engineer",
   "programmer / animator / editor",
   "profound mental retardation",
   "visual novel enthusiast",
   "vietnamese / english",
] as const;

const systemGroups: readonly SystemGroup[] = [
   {
      kind: "creative",
      title: "creative",
      items: [
         { name: "Photoshop", mark: "Ps", focus: "cutting & compositing" },
         { name: "Live2D", mark: "L2D", focus: "character rigging" },
         { name: "After Effects", mark: "Ae", focus: "motion graphics" },
         { name: "Premiere Pro", mark: "Pr", focus: "video editing" },
         { name: "Alight Motion", mark: "AM", focus: "mobile editing & motion graphics" },
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
            items: ["C", "C#", "Go", "PHP"],
         },
      ],
   },
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
         {
            label: "Laptop",
            value: "ASUS ROG Flow Z13",
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
            url: "https://github.com/pctrade/end4-pC",
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
];

const credits: readonly Credit[] = [
   {
      name: "background art (light)",
      url: "https://x.com/tubarururu",
      at: "@tubarururu",
   },
   {
      name: "background art (dark)",
      url: "https://x.com/HcpWa",
      at: "@HcpWa",
   },
   {
      name: "og image",
      url: "https://x.com/MikaPikaZo",
      at: "@MikaPikaZo",
   },
];

const socialLinks: readonly SocialLink[] = [
   {
      url: "https://github.com/screepai",
      icon: "#icon-github",
      label: "GitHub",
      tooltip:
         "i write code to make money now so less active on here, but i do have 3 (three) public repos including this website's source code",
   },
   {
      url: "https://myanimelist.net/animelist/screepy",
      icon: "#icon-mal",
      label: "MyAnimeList",
      tooltip:
         "i barely watch anime nowadays, manga list is also here if youre interested. i also dont update this list as often as i should",
   },
   {
      url: "https://vndb.org/u326697/ulist?q=&ch=&f=&l=1&l=2&l=3&l=4&l=5&l=6&l=7&mul=1&s=3q02",
      icon: "#icon-vndb",
      label: "VNDB",
      tooltip: "oh my god i love reading romance slop",
   },
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
         url: "https://myanimelist.net/anime/23277/Saenai_Heroine_no_Sodatekata",
         note: "the movie is the main point about why i like this series, all the build up is just to make the movie more impactful, and it did its job",
      },
      {
         url: "https://myanimelist.net/anime/16417/Tamako_Market",
         note: [
            "similar to ",
            {
               text: "Saekano",
               url: "https://myanimelist.net/anime/23277/Saenai_Heroine_no_Sodatekata",
            },
            ", the movie is also the main point about why i like this series",
         ],
      },
      {
         url: "https://myanimelist.net/anime/27775/Plastic_Memories",
      },
      {
         url: "https://myanimelist.net/anime/6547/Angel_Beats",
      },
      {
         url: "https://myanimelist.net/anime/2167/Clannad",
      },
      {
         url: "https://myanimelist.net/anime/34822/Tsuki_ga_Kirei",
      },
      {
         url: "https://myanimelist.net/anime/32281/Kimi_no_Na_wa",
      },
      {
         url: "https://myanimelist.net/anime/38826/Tenki_no_Ko",
      },
      {
         url: "https://myanimelist.net/anime/35249/Uma_Musume__Pretty_Derby",
         note: "genuinely emotional asl for a series about horse girls racing",
      },
      {
         url: "https://myanimelist.net/anime/31953/New_Game",
      },
      {
         url: "https://myanimelist.net/anime/12291/Acchi_Kocchi",
      },
      {
         url: "https://myanimelist.net/anime/1195/Zero_no_Tsukaima",
         note: "the og knows this one for sure",
      },
      {
         url: "https://myanimelist.net/anime/11757/Sword_Art_Online",
         note: "say what you want about this series, but it is actually good",
      },
      {
         url: "https://myanimelist.net/anime/52991/Sousou_no_Frieren",
      },
      {
         url: "https://myanimelist.net/anime/33502/Shuumatsu_Nani_Shitemasu_ka_Isogashii_desu_ka_Sukutte_Moratte_Ii_desu_ka",
      },
   ],

   manga: [
      {
         url: "https://myanimelist.net/manga/164252/Akanabe-sensei_wa_Tereshirazu",
      },
      {
         url: "https://myanimelist.net/manga/149804/Class_de_2-banme_ni_Kawaii_Onnanoko_to_Tomodachi_ni_Natta",
      },
      {
         url: "https://myanimelist.net/manga/159216/Maou_ga_Inaka_ni_Totsuidara",
      },
      {
         url: "https://myanimelist.net/manga/118063/Okusama_wa_Niizuma-chan",
      },
      {
         url: "https://myanimelist.net/manga/182521/Osake_to_Senpai_Kanojo_to_no_Amaama_Doukyo_Love_Comedy_wa_Hatachi_ni_Natte_kara",
      },
      {
         url: "https://myanimelist.net/manga/130934/Otonari_no_Tenshi-sama_ni_Itsunomanika_Dame_Ningen_ni_Sareteita_Ken",
      },
      {
         url: "https://myanimelist.net/manga/171011/Sasaki-san_wa_Chotto_dake_Sugoi",
      },
      {
         url: "https://myanimelist.net/manga/118196/Kawaii_dake_ja_Nai_Shikimori-san",
      },
      {
         url: "https://myanimelist.net/manga/117332/Suki_na_Ko_ga_Megane_wo_Wasureta",
      },
      {
         url: "https://myanimelist.net/manga/172522/Boku_no_Kanojo_wa_Dekkawaii",
      },
      {
         url: "https://myanimelist.net/manga/137313/Isshiki-san_wa_Koi_wo_Shiritai",
      },
      {
         url: "https://myanimelist.net/manga/130633/Yaiteru_Futari",
      },
      {
         url: "https://myanimelist.net/manga/127084/Cuprum_no_Hanayome",
      },
   ],

   lightNovels: [
      {
         url: "https://myanimelist.net/manga/141043",
      },
      {
         url: "https://myanimelist.net/manga/150680",
      },
      {
         url: "https://myanimelist.net/manga/138406",
      },
      {
         url: "https://myanimelist.net/manga/180396",
      },
   ],

   visualNovels: [
      {
         url: "https://vndb.org/v19829",
      },
      {
         note: [
            "quite frankly i will and had read anything from ",
            { text: "Azarashi Soft", url: "https://vndb.org/p4542" },
            ", this series is just one of the best examples of their work",
         ],
         url: "https://vndb.org/v15679",
      },
      {
         note: "if you do ever read this, dont skip out on the extra fandiscs, theyre are really good too, misaki best girl (i like mashiro's too)",
         url: "https://vndb.org/v12849",
      },
      {
         url: "https://vndb.org/v27448",
         note: [
            "the writer of this VN, ",
            { text: "Konno Asta", url: "https://vndb.org/s1641" },
            ", also wrote some fire VNs like ",
            { text: "GINKA", url: "https://vndb.org/v38430" },
            " (scrumptious art from ",
            { text: "Yusano", url: "https://vndb.org/s20182" },
            " btw (also did the art for the visual novel ",
            { text: "KANADE", url: "https://vndb.org/v52778" },
            " which you should also checkout)) and ",
            { text: "COCORO", url: "https://vndb.org/v52780" },
            ", i recommend checking them out if you like this one",
         ],
      },
      {
         url: "https://vndb.org/v21852",
      },
      {
         url: "https://vndb.org/v24717",
         note: [
            "must if youve read ",
            { text: "Kinkoi: Golden Loveriche", url: "https://vndb.org/v21852" },
         ],
      },
      {
         url: "https://vndb.org/v20424",
         note: [
            "if you plan to read this then skip original ",
            { text: "Summer Pockets", url: "https://vndb.org/v20424" },
            ", ",
            { text: "Reflection Blue", url: "https://vndb.org/r102263" },
            " is packed with more content containing the original story",
         ],
      },
      {
         url: "https://vndb.org/v18852",
      },
      {
         url: "https://vndb.org/v21523",
      },
      {
         url: "https://vndb.org/v57252",
      },
      {
         url: "https://vndb.org/p4542",
      },
      {
         url: "https://vndb.org/p98",
         note: "ive already read all of their selection available aside from the ones that are not translated and i lowkey enjoyed all of them, so i suppose putting their entire catalog here is gonna make this list a bit too long",
      },
      {
         url: "https://vndb.org/p371",
         note: [
            "similar to Yuzusoft, ive already read (mostly) all of their selection available, its a mediocre read at best (no shade, i still enjoyed their works) but the jokes are rubbing off on me and i cant lie sometimes the writing does get fire (",
            { text: "Yuna", url: "https://vndb.org/c92165" },
            " and ",
            { text: "Renai Royale", url: "https://vndb.org/v28633" },
            " best girl)",
         ],
      },
      {
         url: "https://vndb.org/p391",
         note: [
            "similar to the two above, ive already read (mostly, starting from ",
            { text: "PRIMAL×HEARTS", url: "https://vndb.org/v14887" },
            ") all of their selection available, maybe im just a sucker from romance (duh) but i do enjoy their works, especially the ones that are more on the comedy side of things. they do have some misses like ",
            { text: "Study § Steady", url: "https://vndb.org/v24689" },
            " that i genuinely cannot finish reading because the animation is too uncanny",
         ],
      },
      {
         url: "https://vndb.org/p8310",
         note: "not similar to the three above, they genuinely have only made 4 VNs, i have only read 2 of them because its translated but the other 2 are not and i enjoyed the 2 that i have read, so rather than putting the 2 that i have read here, i just put their entire catalog here because so the list doesnt get too long and also because i genuinely want to read the other 2 VNs that are not translated yet",
      },
   ],
};

const gameAccounts: readonly GameAccount[] = [
   {
      name: "Honkai: Star Rail",
      uid: "801340359",
      server: "Asia",
   },
   {
      name: "Zenless Zone Zero",
      uid: "1301456607",
      server: "Asia",
   },
   {
      name: "Arknights: Endfield",
      uid: "4463391480",
      server: "Asia",
   },
   {
      name: "Wuthering Waves",
      uid: "907809557",
      server: "SEA",
   },
];

export const contentSlides = [
   {
      kind: "about",
      label: "About",
      heading: "About me",
      items: aboutItems,
   },
   {
      kind: "system",
      label: "Setup",
      heading: "Setup",
      groups: systemGroups,
   },
   {
      kind: "interests",
      label: "Interests",
      heading: "Interests",

      memoryPicks: interestMemoryPicks,

      games: gameAccounts,
   },
   {
      kind: "socials",
      label: "Socials",
      heading: "Socials",
      links: socialLinks,
      findMe: findMeLinks,
      contact: {
         discordUrl: "https://discord.com/users/534375062099460097",
         email: "screepy@screepai.moe",
      },
      note: "(i dont post anything, just here for the fancy)",
   },
   {
      kind: "credits",
      label: "Credits",
      heading: "Credits",
      credits,
   },
] as const satisfies readonly ContentSlide[];
