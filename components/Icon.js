// components/Icon.js
// Every icon in SriGen lives here. To change a logo you have two choices.
//
// CHOICE B IS BETTER IF YOUR FILE IS AN .svg — see below.
//
// CHOICE A — point at an image file
//   1. Put the file in  public/icons/   e.g.  public/icons/mic.png
//   2. Add one line to IMAGES below:     mic: '/icons/mic.png',
//   Works with .png and .svg. The drawback: the picture keeps its own
//   colours, so a dark icon vanishes on the dark green sidebar and you
//   need a white copy listed in IMAGES_ON_DARK.
//
// CHOICE B — paste the drawing in (best, and the only option that recolours)
//   Open your .svg in Notepad, copy the <path> tags from inside it, and
//   replace the entry in PATHS further down. The icon then takes the colour
//   of the text around it: dark on cards, white on the sidebar, all from
//   one file. No second white copy needed.
//   When pasting, rename stroke-width to strokeWidth, stroke-linecap to
//   strokeLinecap, close every tag with  />  and delete any hardcoded
//   fill="#000" or stroke="#333".
//
// Use it like this:
//     import Icon from '@/components/Icon';
//     <Icon name="mic" />
//     <Icon name="pin" size={28} />
//     <Icon name="globe" onDark />     // picks the white version

import Image from 'next/image';

// ---- YOUR OWN IMAGE FILES -------------------------------------------
// Uncomment a line once the file exists in public/icons/.
// Anything left out keeps using the drawn icon below, so you can switch
// them over one at a time. .png and .svg both work.
const IMAGES = {
  // mic: '/icons/mic.svg',
  // pin: '/icons/pin.svg',
  // globe: '/icons/globe.svg',
  // home: '/icons/home.svg',
  // chat: '/icons/chat.svg',
  // doc: '/icons/doc.svg',
  // calculator: '/icons/calculator.svg',
  // download: '/icons/download.svg',
};

// White versions, used on the dark green sidebar.
// Not needed at all if you use CHOICE B.
const IMAGES_ON_DARK = {
   // mic: '/icons/mic-white.svg',
   // pin: '/icons/pin-white.svg',
   // globe: '/icons/globe-white.svg',
};
// ---------------------------------------------------------------------

const PATHS = {
  // --- navigation ---
  home: (
    <>
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 10v10h14V10" />
    </>
  ),
  chat: <path d="M21 15a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />,
  // "pin-02" from the downloaded set: a push pin / thumbtack.
  pin: (
     <><path d="M12 16V21"></path><path d="M8 5.2918C8 5.02079 8 4.88529 8.01312 4.77132C8.1194 3.84789 8.84789 3.1194 9.77133 3.01312C9.88529 3 10.0208 3 10.2918 3H13.7082C13.9792 3 14.1147 3 14.2287 3.01312C15.1521 3.1194 15.8806 3.84789 15.9869 4.77132C16 4.88529 16 5.02079 16 5.2918C16 5.37885 16 5.42237 15.9967 5.46264C15.9708 5.78281 15.7927 6.07104 15.5179 6.2374C15.4834 6.25832 15.4444 6.27779 15.3666 6.31672L15.1055 6.44726C14.7021 6.64897 14.5003 6.74983 14.3681 6.90564C14.26 7.03286 14.1856 7.18509 14.1515 7.34846C14.1097 7.54854 14.1539 7.76968 14.2424 8.21197L15 12H15.3333C15.9533 12 16.2633 12 16.5176 12.0681C17.2078 12.2531 17.7469 12.7922 17.9319 13.4824C18 13.7367 18 14.0467 18 14.6667C18 14.9767 18 15.1317 17.9659 15.2588C17.8735 15.6039 17.6039 15.8735 17.2588 15.9659C17.1317 16 16.9767 16 16.6667 16H7.33333C7.02334 16 6.86835 16 6.74118 15.9659C6.39609 15.8735 6.12654 15.6039 6.03407 15.2588C6 15.1317 6 14.9767 6 14.6667C6 14.0467 6 13.7367 6.06815 13.4824C6.25308 12.7922 6.79218 12.2531 7.48236 12.0681C7.73669 12 8.04669 12 8.66667 12H9L9.75761 8.21197C9.84606 7.76968 9.89029 7.54854 9.84852 7.34846C9.81441 7.18509 9.73995 7.03286 9.63194 6.90564C9.49965 6.74983 9.29794 6.64897 8.89452 6.44726L8.63344 6.31672C8.55558 6.27779 8.51665 6.25832 8.48208 6.2374C8.20731 6.07104 8.02917 5.78281 8.00326 5.46264C8 5.42237 8 5.37885 8 5.2918Z"></path></>
  ),

  // The original map marker, kept in case you want it back for locations.
  mapPin: (
    <>
      <path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11z" />
      <circle cx="12" cy="10" r="2.6" />
    </>
  ),
  doc: (
    <>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
      <path d="M8 13h8M8 17h5" />
    </>
  ),
  calculator: (
    <>
      <rect x="4" y="2" width="16" height="20" rx="2" />
      <path d="M8 6h8M8 11h2m3 0h3M8 15h2m3 0h3M8 19h8" />
    </>
  ),
  download: (
    <>
      <path d="M12 3v12" />
      <path d="m7 11 5 5 5-5" />
      <path d="M4 21h16" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4 3.6-6.5 8-6.5s8 2.5 8 6.5" />
    </>
  ),

  // --- language ---
  // "languages" from the downloaded set: a character next to a letter A.
    globe: (
    <>
      <path d="M3.49744 5H7.99744M7.99744 5H13.4974M7.99744 5V3.5M4.99744 13.5C7.49744 11.5 10.4974 7.5 10.9974 5M6.49744 7.5C6.99744 9 8.99744 11.5 9.99744 12" />
      <path d="M4.99744 13.5C7.49744 11.5 10.4974 7.5 10.9974 5" />
      <path d="M11.4974 20.5005L14.1591 14.2898C14.9451 12.456 15.338 11.5391 15.9974 11.5391C16.6568 11.5391 17.0498 12.456 17.8357 14.2898L20.4974 20.5005" />
      <path d="M13.4974 16.5H18.4974" />
    </>
  ),

  // --- voice input ---
   mic: (
    <>
      <path d="M7 6.5C7 4.01472 9.01472 2 11.5 2C13.9853 2 16 4.01472 16 6.5V11.5C16 13.9853 13.9853 16 11.5 16C9.01472 16 7 13.9853 7 11.5V6.5Z" />
      <path d="M11.5 19H11.0828C7.57267 19 4.57706 16.4623 4 13M11.5 19H11.9172C15.4273 19 18.4229 16.4623 19 13M11.5 19V22" />
    </>
  ),
  stop: <rect x="6" y="6" width="12" height="12" rx="2" />,

  // --- home page cards ---
  robot: (
    <>
      <rect x="3" y="8" width="18" height="12" rx="3" />
      <circle cx="9" cy="14" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="15" cy="14" r="1.2" fill="currentColor" stroke="none" />
      <path d="M12 8V5" />
      <circle cx="12" cy="3.6" r="1.4" />
    </>
  ),
  scroll: (
    <>
      <path d="M6 3h11a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6" />
      <path d="M6 3a2 2 0 0 0-2 2v2h4" />
      <path d="M19 21a2 2 0 0 0 2-2v-2h-4" />
      <path d="M9 9h7M9 13h7M9 17h4" />
    </>
  ),
  rupee: (
    <>
      <path d="M7 4h10" />
      <path d="M7 8h10" />
      <path d="M13 4c2.4 0 4 1.7 4 4s-1.6 4-4 4H7l8 8" />
    </>
  ),

  // --- small ui bits ---
  check: <path d="M4 12.5 9 17.5 20 6.5" />,
  close: <path d="M6 6l12 12M18 6 6 18" />,
  key: (
    <>
      <circle cx="7" cy="17" r="3.2" />
      <path d="M9.3 14.7 19 5" />
      <path d="M16 8l2.4 2.4" />
      <path d="M18.6 5.4 21 7.8" />
    </>
  ),
  spark: <path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z" />,
  file: (
    <>
      <path d="M13 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
      <path d="M13 2v6h6" />
    </>
  ),
  bulb: (
    <>
      <path d="M9 18h6" />
      <path d="M10 21h4" />
      <path d="M12 3a6 6 0 0 0-3.5 10.9c.3.3.5.7.5 1.1h6c0-.4.2-.8.5-1.1A6 6 0 0 0 12 3z" />
    </>
  ),
};

// strokeWidth 1.5 matches the downloaded icon set, so every icon in the
// app carries the same line weight.
export default function Icon({ name, size = 20, strokeWidth = 1.5, style, onDark = false }) {
  // An image file wins if one is listed for this name.
  const src = (onDark && IMAGES_ON_DARK[name]) || IMAGES[name];
  if (src) {
    return (
      <Image
        src={src}
        alt=""
        width={size}
        height={size}
        // Next.js refuses to run .svg through its image optimiser unless
        // dangerouslyAllowSVG is switched on, and it answers with a 400.
        // unoptimized serves the file as-is, which is what an icon wants.
        unoptimized={src.endsWith('.svg')}
        style={{ flexShrink: 0, display: 'block', objectFit: 'contain', ...style }}
      />
    );
  }

  const shape = PATHS[name];
  if (!shape) return null;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      style={{ flexShrink: 0, display: 'block', ...style }}
    >
      {shape}
    </svg>
  );
}

// Handy when you want to see everything available.
export const ICON_NAMES = Object.keys(PATHS);