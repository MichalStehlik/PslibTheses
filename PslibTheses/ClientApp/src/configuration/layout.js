export const breakpoints = {
  mobileS: '320px',
  mobileM: '375px',
  mobileL: '425px',
  tablet: '768px',
  laptop: '1024px',
  laptopL: '1440px',
  desktop: '2560px'
};
export const devices = {
    mobile: `(max-width: ${breakpoints.mobileM})`,
    tablet: `(max-width: ${breakpoints.tablet})`,
    desktop: `(min-width: ${breakpoints.tablet})`
  };