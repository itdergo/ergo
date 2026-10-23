import imageManifest from "./image-manifest.json";
const asset = (file) => `${import.meta.env.BASE_URL}images/${file}`;
const webpAsset = (file) => {
  const dir = file.includes("/") ? `${file.slice(0, file.lastIndexOf("/"))}/` : "";
  const stem = file.slice(file.lastIndexOf("/") + 1).replace(/\.(jpg|jpeg|png)$/i, "");
  return `${import.meta.env.BASE_URL}images/webp/${dir}${stem}`;
};
const webpLogo = (file) => {
  const slug = file
    .replace(/\.(jpg|jpeg|png)$/i, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `${import.meta.env.BASE_URL}images/webp/partners/${slug}-400.webp`;
};
const srcSet = (file) => {
  const rungs = imageManifest[file];
  if (!rungs || rungs.length === 0) return void 0;
  const base = webpAsset(file);
  return rungs.map((w) => `${base}-${w}.webp ${w}w`).join(", ");
};
export { asset, srcSet, webpAsset, webpLogo };
