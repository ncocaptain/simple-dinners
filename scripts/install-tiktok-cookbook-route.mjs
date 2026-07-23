import {
  access,
  copyFile,
  readFile,
  writeFile,
} from "node:fs/promises";

import path from "node:path";
import {
  fileURLToPath,
} from "node:url";

const scriptDirectory =
  path.dirname(
    fileURLToPath(import.meta.url)
  );

const projectDirectory =
  path.resolve(
    scriptDirectory,
    ".."
  );

const cookbookPath =
  path.join(
    projectDirectory,
    "src",
    "pages",
    "CookbookPage.tsx"
  );

await access(cookbookPath);

let source =
  await readFile(
    cookbookPath,
    "utf8"
  );

const helperName =
  "isPublicVideoRecipeUrl";

if (!source.includes(`function ${helperName}(`)) {
  const socialHelperStart =
    source.indexOf(
      "function looksLikeSocialRecipeUrl"
    );

  if (socialHelperStart < 0) {
    throw new Error(
      "Could not find looksLikeSocialRecipeUrl in CookbookPage.tsx."
    );
  }

  const nextFunctionStart =
    source.indexOf(
      "\nfunction ",
      socialHelperStart + 1
    );

  if (nextFunctionStart < 0) {
    throw new Error(
      "Could not safely locate the end of looksLikeSocialRecipeUrl."
    );
  }

  const helper = `

function isPublicVideoRecipeUrl(url: string) {
  try {
    const host = new URL(
      String(url || "").trim()
    ).hostname
      .toLowerCase()
      .replace(/\\.$/, "");

    return (
      host === "instagram.com" ||
      host.endsWith(".instagram.com") ||
      host === "tiktok.com" ||
      host.endsWith(".tiktok.com")
    );
  } catch {
    const value =
      String(url || "").toLowerCase();

    return (
      value.includes("instagram.com") ||
      value.includes("tiktok.com")
    );
  }
}
`;

  source =
    source.slice(0, nextFunctionStart) +
    helper +
    source.slice(nextFunctionStart);
}

const handleImportStart =
  source.indexOf(
    "const handleImport = async"
  );

if (handleImportStart < 0) {
  throw new Error(
    "Could not find handleImport in CookbookPage.tsx."
  );
}

const handleImportEnd =
  source.indexOf(
    "\n  const handleCaptionAssistImport",
    handleImportStart
  );

if (handleImportEnd < 0) {
  throw new Error(
    "Could not safely locate the end of handleImport."
  );
}

const handleImportBlock =
  source.slice(
    handleImportStart,
    handleImportEnd
  );

if (
  !handleImportBlock.includes(
    'fetch(`${API_BASE}/import-recipe`'
  )
) {
  if (
    handleImportBlock.includes(
      "isPublicVideoRecipeUrl"
    ) &&
    handleImportBlock.includes(
      "import-video-url"
    )
  ) {
    console.log(
      "Cookbook TikTok route already installed."
    );

    process.exit(0);
  }

  throw new Error(
    "The expected /import-recipe fetch was not found inside handleImport."
  );
}

const oldFetch = [
  'const response = await fetch(`${API_BASE}/import-recipe`, {',
  '        method: "POST",',
  '        headers: { "Content-Type": "application/json" },',
  '        body: JSON.stringify({ url: importUrl.trim() }),',
  '      });',
].join("\n");

const newFetch = [
  'const normalizedImportUrl =',
  '        importUrl.trim();',
  '',
  '      const publicVideoImport =',
  '        isPublicVideoRecipeUrl(',
  '          normalizedImportUrl',
  '        );',
  '',
  '      const importEndpoint =',
  '        publicVideoImport',
  '          ? "import-video-url"',
  '          : "import-recipe";',
  '',
  '      const response = await fetch(',
  '        `${API_BASE}/${importEndpoint}`,',
  '        {',
  '          method: "POST",',
  '          headers: {',
  '            "Content-Type":',
  '              "application/json",',
  '          },',
  '          body: JSON.stringify({',
  '            url: normalizedImportUrl,',
  '            ...(publicVideoImport',
  '              ? {',
  '                  language:',
  '                    language ||',
  '                    navigator.language ||',
  '                    "en",',
  '                }',
  '              : {}),',
  '          }),',
  '        }',
  '      );',
].join("\n");

if (!handleImportBlock.includes(oldFetch)) {
  throw new Error(
    "The Cookbook import fetch did not match the expected format. No files were changed."
  );
}

const patchedHandleImport =
  handleImportBlock.replace(
    oldFetch,
    newFetch
  );

source =
  source.slice(0, handleImportStart) +
  patchedHandleImport +
  source.slice(handleImportEnd);

const backupPath =
  `${cookbookPath}.before-tiktok-route`;

await copyFile(
  cookbookPath,
  backupPath
);

await writeFile(
  cookbookPath,
  source,
  "utf8"
);

console.log(
  "Cookbook TikTok routing installed."
);

console.log(
  `Backup created: ${backupPath}`
);

console.log(
  "Next: npm run build"
);
