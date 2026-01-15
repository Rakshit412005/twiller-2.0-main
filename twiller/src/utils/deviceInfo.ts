export const getDeviceInfo = () => {
  const ua = navigator.userAgent;

  const isMobile = /Android|iPhone|iPad|iPod/i.test(ua);

  let browser = "Unknown";
  if (ua.includes("Chrome") && !ua.includes("Edg")) browser = "Chrome";
  else if (ua.includes("Edg")) browser = "Edge";
  else if (ua.includes("Firefox")) browser = "Firefox";
  else if (ua.includes("Safari")) browser = "Safari";

  let os = "Unknown";
  if (ua.includes("Windows")) os = "Windows";
  else if (ua.includes("Android")) os = "Android";
  else if (ua.includes("iPhone")) os = "iOS";
  else if (ua.includes("Mac")) os = "MacOS";

  return {
    browser,
    os,
    deviceType: isMobile ? "mobile" : "desktop",
  };
};
