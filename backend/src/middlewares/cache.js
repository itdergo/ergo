function cachePublic(seconds = 60, staleWhileRevalidate = 300) {
  return (_req, res, next) => {
    res.setHeader(
      "Cache-Control",
      `public, max-age=${seconds}, stale-while-revalidate=${staleWhileRevalidate}`,
    );
    next();
  };
}
function noStore(_req, res, next) {
  res.setHeader("Cache-Control", "no-store");
  next();
}
export { cachePublic, noStore };
