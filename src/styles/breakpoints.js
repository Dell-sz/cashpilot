export const breakpoints = {
  mobile: '375px',
  mobileLarge: '425px',
  tablet: '768px',
  laptop: '1024px',
  desktop: '1280px',
  widescreen: '1536px'
};

export const devices = {
  mobile: `@media (max-width: ${breakpoints.mobile})`,
  mobileLarge: `@media (max-width: ${breakpoints.mobileLarge})`,
  tablet: `@media (max-width: ${breakpoints.tablet})`,
  laptop: `@media (max-width: ${breakpoints.laptop})`,
  desktop: `@media (max-width: ${breakpoints.desktop})`,
  widescreen: `@media (max-width: ${breakpoints.widescreen})`,

  // Min-width (mobile first)
  minMobile: `@media (min-width: ${breakpoints.mobile})`,
  minTablet: `@media (min-width: ${breakpoints.tablet})`,
  minLaptop: `@media (min-width: ${breakpoints.laptop})`,
  minDesktop: `@media (min-width: ${breakpoints.desktop})`
};

