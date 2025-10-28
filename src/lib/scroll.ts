export const scrollToTop = (e?: React.MouseEvent) => {
  e?.preventDefault();
  window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
};
