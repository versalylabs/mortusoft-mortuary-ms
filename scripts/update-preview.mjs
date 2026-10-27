import { readFileSync, writeFileSync } from "node:fs";

let code = readFileSync("preview/app.js", "utf8");

const newSidebarCss = `
  #mortusoft-sidebar {
    position: fixed;
    z-index: 30;
    inset: 0 auto 0 0;
    width: 260px;
    padding: 24px 16px 20px;
    background: #0b0f19;
    color: #f8fafc;
    display: flex;
    flex-direction: column;
    box-shadow: 4px 0 24px rgba(0, 0, 0, 0.15);
    border-right: 1px solid rgba(255, 255, 255, 0.08);
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
    color: #ffffff;
  }
  .ms-side-brand .brand-mark {
    background: linear-gradient(135deg, #4f46e5 0%, #3730a3 100%);
    box-shadow: 0 4px 14px rgba(79, 70, 229, 0.35);
  }
  .ms-side-facility {
    margin: 0 4px 22px;
    padding: 12px 14px;
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.04);
  }
  .ms-side-facility small {
    display: block;
    color: #64748b;
    font-size: 10.5px;
    font-weight: 700;
    letter-spacing: 1.1px;
    text-transform: uppercase;
  }
  .ms-side-facility strong {
    display: block;
    margin-top: 5px;
    font-size: 13px;
    font-weight: 600;
    color: #ffffff;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .ms-side-label {
    margin: 4px 12px 8px;
    color: #64748b;
    font-size: 10.5px;
    font-weight: 700;
    letter-spacing: 1.1px;
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
    border-radius: 8px;
    background: transparent;
    color: #94a3b8;
    text-align: left;
    font: 500 13px 'Plus Jakarta Sans', sans-serif;
    cursor: pointer;
    transition: all 0.16s ease;
  }
  .ms-side-nav button:hover {
    background: rgba(255, 255, 255, 0.06);
    color: #ffffff;
  }
  .ms-side-nav button[aria-current=page] {
    background: linear-gradient(135deg, rgba(79, 70, 229, 0.9) 0%, rgba(67, 56, 202, 0.95) 100%);
    color: #ffffff;
    font-weight: 600;
    box-shadow: 0 4px 14px rgba(79, 70, 229, 0.3);
  }
  .ms-side-nav button span {
    width: 20px;
    text-align: center;
    font-size: 16px;
  }
  .ms-side-bottom {
    margin-top: auto;
    padding: 16px 8px 4px;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
  }
  .ms-side-bottom small {
    display: block;
    color: #64748b;
    font-size: 11px;
    line-height: 1.6;
  }
  .ms-side-bottom button {
    margin-top: 12px;
    padding: 7px 12px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 6px;
    background: rgba(255, 255, 255, 0.04);
    color: #cbd5e1;
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s ease;
  }
  .ms-side-bottom button:hover {
    background: rgba(255, 255, 255, 0.1);
    color: #ffffff;
  }
  body.ms-workspace #dashboard,
  body.ms-workspace .workspace-page {
    margin-left: 260px;
    width: calc(100% - 260px);
    min-height: 100vh;
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

code = code.replace(/workspaceStyle\.textContent = `[\s\S]*?`;/, 'workspaceStyle.textContent = `' + newSidebarCss + '`;');
writeFileSync("preview/app.js", code, "utf8");
console.log("Updated preview/app.js successfully!");
