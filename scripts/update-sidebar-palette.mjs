import { readFileSync, writeFileSync } from "node:fs";

let code = readFileSync("preview/app.js", "utf8");

const coastalSidebarCss = `
  #mortusoft-sidebar {
    position: fixed;
    z-index: 30;
    inset: 0 auto 0 0;
    width: 260px;
    padding: 24px 16px 20px;
    background: #EAE3DA;
    color: #071739;
    display: flex;
    flex-direction: column;
    box-shadow: 2px 0 18px rgba(7, 23, 57, 0.03);
    border-right: 1px solid #DDD5CB;
    font-family: 'Plus Jakarta Sans', -apple-system, sans-serif;
  }
  #mortusoft-sidebar[hidden] { display: none !important; }
  .ms-side-brand {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 4px 10px 24px;
    font: 800 20px 'Plus Jakarta Sans', sans-serif;
    letter-spacing: -0.8px;
    color: #071739;
  }
  .ms-side-brand .brand-mark {
    background: linear-gradient(135deg, #071739 0%, #4B6382 100%);
    box-shadow: 0 4px 14px rgba(7, 23, 57, 0.25);
  }
  .ms-side-brand .brand-mark i:nth-child(1) { background: #E3C39D; }
  .ms-side-brand .brand-mark i:nth-child(2) { background: #FFFFFF; }
  .ms-side-brand .brand-mark i:nth-child(3) { background: #E3C39D; }
  .ms-side-facility {
    margin: 0 4px 22px;
    padding: 12px 14px;
    border: 1px solid rgba(225, 217, 209, 0.8);
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.65);
    box-shadow: 0 2px 8px rgba(7, 23, 57, 0.03);
  }
  .ms-side-facility small {
    display: block;
    color: #7D8B9B;
    font-size: 10.5px;
    font-weight: 700;
    letter-spacing: 1.2px;
    text-transform: uppercase;
  }
  .ms-side-facility strong {
    display: block;
    margin-top: 5px;
    font-size: 13.5px;
    font-weight: 700;
    color: #071739;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .ms-side-label {
    margin: 4px 14px 8px;
    color: #7D8B9B;
    font-size: 10.5px;
    font-weight: 800;
    letter-spacing: 1.2px;
    text-transform: uppercase;
  }
  .ms-side-nav {
    display: grid;
    gap: 4px;
  }
  .ms-side-nav button {
    display: flex;
    align-items: center;
    gap: 12px;
    width: 100%;
    padding: 10px 14px;
    border: 0;
    border-radius: 10px;
    background: transparent;
    color: #4B6382;
    text-align: left;
    font: 600 13.5px 'Plus Jakarta Sans', sans-serif;
    cursor: pointer;
    transition: all 0.16s ease;
  }
  .ms-side-nav button:hover {
    background: rgba(255, 255, 255, 0.65);
    color: #071739;
  }
  /* Overview pill style in steel blue */
  .ms-side-nav button[aria-current=page] {
    background: #4B6382;
    color: #ffffff;
    font-weight: 700;
    box-shadow: 0 4px 14px rgba(75, 99, 130, 0.3);
  }
  .ms-side-nav button span {
    width: 20px;
    text-align: center;
    font-size: 16px;
  }
  .ms-side-bottom {
    margin-top: auto;
    padding: 16px 8px 4px;
    border-top: 1px solid #DDD5CB;
  }
  .ms-side-bottom small {
    display: block;
    color: #6B7B8C;
    font-size: 11.5px;
    line-height: 1.6;
  }
  .ms-side-bottom button {
    margin-top: 12px;
    padding: 7px 14px;
    border: 1px solid #DDD5CB;
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.7);
    color: #4B6382;
    font-size: 12.5px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.15s ease;
  }
  .ms-side-bottom button:hover {
    background: #ffffff;
    color: #071739;
    border-color: #CDD5DB;
  }
  body.ms-workspace #dashboard,
  body.ms-workspace .workspace-page {
    margin-left: 260px;
    width: calc(100% - 260px);
    min-height: 100vh;
    background: #F4EFEA;
  }
  body.ms-workspace .preview-head {
    padding-left: 36px;
  }
  body.ms-workspace .preview-body {
    max-width: 1280px;
  }
  @media(max-width: 760px) {
    #mortusoft-sidebar {
      width: 68px;
      padding: 20px 8px 14px;
    }
    .ms-side-brand {
      justify-content: center;
      padding: 4px 0 20px;
      font-size: 0;
    }
    .ms-side-brand .brand-mark { flex: none; }
    .ms-side-facility, .ms-side-label, .ms-side-nav button b, .ms-side-bottom small, .ms-side-bottom button {
      display: none;
    }
    .ms-side-nav button {
      justify-content: center;
      padding: 12px 6px;
    }
    .ms-side-nav button span { font-size: 18px; }
    body.ms-workspace #dashboard, body.ms-workspace .workspace-page {
      margin-left: 68px;
      width: calc(100% - 68px);
    }
  }
`;

code = code.replace(/workspaceStyle\.textContent = `[\s\S]*?`;/, 'workspaceStyle.textContent = `' + coastalSidebarCss + '`;');
writeFileSync("preview/app.js", code, "utf8");
console.log("Updated preview/app.js with coastal oceanic sidebar palette!");
