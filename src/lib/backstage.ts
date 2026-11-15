declare global {
   interface Window {
      wink?: () => string;
   }
}

let greeted = false;

export function installConsoleEasterEgg(accent: string) {
   const previous = Object.getOwnPropertyDescriptor(window, "wink");
   const wink = () => "(´•ω<`) ✦";

   Object.defineProperty(window, "wink", { value: wink, configurable: true, writable: true });

   if (!greeted) {
      greeted = true;
      console.log(
         "%c(´•ω<`) ✦ oh, you found the backstage.%c\n\nsome stories are worth forgetting,\njust to fall in love with them again.\n\nwhich one would you read again?\n\n%ctry wink()",
         `color:${accent};font-family:'Inter Tight',sans-serif;font-size:14px;font-weight:600;`,
         "color:#8b8998;font-family:'Inter Tight',sans-serif;font-size:12px;font-style:italic;line-height:1.8;",
         `color:${accent};font-family:'Inter Tight',sans-serif;font-size:11px;font-style:normal;`
      );
   }

   return () => {
      if (Object.getOwnPropertyDescriptor(window, "wink")?.value !== wink) return;
      if (previous) Object.defineProperty(window, "wink", previous);
      else delete window.wink;
   };
}
