/* แทนไอคอน Launcher ของ Android (ทุก density) ด้วยรูปหนังสือ พื้นเขียวเต็ม */
const { chromium } = require("playwright");
const path = require("path");
const RES = path.resolve(__dirname, "..", "android", "app", "src", "main", "res");

function svg(size) {
  return '<svg xmlns="http://www.w3.org/2000/svg" width="' + size + '" height="' + size + '" viewBox="0 0 512 512">' +
    '<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#22c56e"/><stop offset="1" stop-color="#148a48"/></linearGradient></defs>' +
    '<rect width="512" height="512" fill="url(#g)"/>' +
    '<g fill="#ffffff">' +
    '<path d="M256 168 C 216 142 162 140 124 154 L 124 366 C 162 352 216 354 256 376 Z"/>' +
    '<path d="M256 168 C 296 142 350 140 388 154 L 388 366 C 350 352 296 354 256 376 Z"/>' +
    '</g>' +
    '<rect x="249" y="168" width="14" height="208" rx="7" fill="#bfe6cd"/>' +
    '<g stroke="#bfe6cd" stroke-width="9" stroke-linecap="round">' +
    '<line x1="158" y1="198" x2="234" y2="207"/><line x1="158" y1="232" x2="234" y2="241"/><line x1="158" y1="266" x2="234" y2="275"/>' +
    '<line x1="278" y1="207" x2="354" y2="198"/><line x1="278" y1="241" x2="354" y2="232"/><line x1="278" y1="275" x2="354" y2="266"/>' +
    '</g></svg>';
}

(async () => {
  const b = await chromium.launch();
  const render = async (size, file) => {
    const p = await b.newPage({ viewport: { width: size, height: size } });
    await p.setContent('<!doctype html><html><head><style>*{margin:0;padding:0}html,body{width:' + size + 'px;height:' + size + 'px;overflow:hidden}</style></head><body>' + svg(size) + '</body></html>');
    await p.screenshot({ path: file });
    await p.close();
  };
  const legacy = { "mipmap-mdpi": 48, "mipmap-hdpi": 72, "mipmap-xhdpi": 96, "mipmap-xxhdpi": 144, "mipmap-xxxhdpi": 192 };
  const fore = { "mipmap-mdpi": 108, "mipmap-hdpi": 162, "mipmap-xhdpi": 216, "mipmap-xxhdpi": 324, "mipmap-xxxhdpi": 432 };
  for (const dir in legacy) { await render(legacy[dir], path.join(RES, dir, "ic_launcher.png")); await render(legacy[dir], path.join(RES, dir, "ic_launcher_round.png")); }
  for (const dir in fore) { await render(fore[dir], path.join(RES, dir, "ic_launcher_foreground.png")); }
  await b.close();
  console.log("launcher icons replaced (book) in all densities");
})().catch((e) => { console.error(e); process.exit(1); });
