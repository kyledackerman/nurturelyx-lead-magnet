export const scrollToTopIfHomeLink = (e?: React.MouseEvent) => {
  if (window.location.pathname === "/") {
    e?.preventDefault();
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  }
};
