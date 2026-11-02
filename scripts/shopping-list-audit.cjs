const fs = require("fs");
const os = require("os");
const path = require("path");
const ts = require("typescript");

const projectRoot = path.resolve(__dirname, "..");
const tempDir = fs.mkdtempSync(
  path.join(
    os.tmpdir(),
    "simple-dinners-shopping-audit-"
  )
);

function cleanup() {
  fs.rmSync(
    tempDir,
    {
      recursive: true,
      force: true,
    }
  );
}

function formatDiagnostic(
  diagnostic
) {
  const message =
    ts.flattenDiagnosticMessageText(
      diagnostic.messageText,
      "\n"
    );

  if (
    !diagnostic.file ||
    diagnostic.start === undefined
  ) {
    return message;
  }

  const position =
    diagnostic.file.getLineAndCharacterOfPosition(
      diagnostic.start
    );

  return `${path.relative(
    projectRoot,
    diagnostic.file.fileName
  )}:${position.line + 1}:${
    position.character + 1
  } - ${message}`;
}

function compileAuditModules() {
  const configPath = path.join(
    projectRoot,
    "tsconfig.app.json"
  );

  const configFile =
    ts.readConfigFile(
      configPath,
      ts.sys.readFile
    );

  if (configFile.error) {
    throw new Error(
      formatDiagnostic(
        configFile.error
      )
    );
  }

  const parsed =
    ts.parseJsonConfigFileContent(
      configFile.config,
      ts.sys,
      projectRoot,
      {
        noEmit: false,
        incremental: false,
        tsBuildInfoFile:
          undefined,
        outDir: tempDir,
        rootDir: projectRoot,
        module:
          ts.ModuleKind.CommonJS,
        moduleResolution:
          ts.ModuleResolutionKind
            .Node10,
        verbatimModuleSyntax:
          false,
        allowImportingTsExtensions:
          false,
        declaration: false,
        declarationMap: false,
        sourceMap: false,
        noUnusedLocals: false,
        noUnusedParameters: false,
      },
      configPath
    );

  const roots = [
    path.join(
      projectRoot,
      "src/shoppingList.ts"
    ),
    path.join(
      projectRoot,
      "src/core/data.ts"
    ),
    path.join(
      projectRoot,
      "src/core/ingredientParser.ts"
    ),
    path.join(
      projectRoot,
      "src/core/ingredientRegistry.ts"
    ),
  ];

  const program =
    ts.createProgram(
      roots,
      parsed.options
    );

  const emitResult =
    program.emit();

  const diagnostics = [
    ...ts.getPreEmitDiagnostics(
      program
    ),
    ...emitResult.diagnostics,
  ].filter(
    (diagnostic) =>
      diagnostic.category ===
      ts.DiagnosticCategory.Error
  );

  if (diagnostics.length) {
    const shown =
      diagnostics
        .slice(0, 20)
        .map(
          formatDiagnostic
        )
        .join("\n");

    throw new Error(
      `Audit compile failed:\n${shown}`
    );
  }
}

function addCount(
  map,
  key,
  amount = 1
) {
  map.set(
    key,
    (map.get(key) || 0) +
      amount
  );
}

function addSetValue(
  map,
  key,
  value
) {
  if (!map.has(key)) {
    map.set(
      key,
      new Set()
    );
  }

  map.get(key).add(value);
}

function topEntries(
  map,
  limit = 25
) {
  return [
    ...map.entries(),
  ]
    .sort(
      (first, second) =>
        second[1] -
        first[1] ||
        first[0].localeCompare(
          second[0]
        )
    )
    .slice(0, limit)
    .map(
      ([name, count]) => ({
        name,
        count,
      })
    );
}

function main() {
  compileAuditModules();

  const shopping =
    require(
      path.join(
        tempDir,
        "src/shoppingList.js"
      )
    );

  const data =
    require(
      path.join(
        tempDir,
        "src/core/data.js"
      )
    );

  const parser =
    require(
      path.join(
        tempDir,
        "src/core/ingredientParser.js"
      )
    );

  const registry =
    require(
      path.join(
        tempDir,
        "src/core/ingredientRegistry.js"
      )
    );

  const recipes =
    Array.isArray(
      data.ALL_RECIPES
    )
      ? data.ALL_RECIPES
      : data.DINNER_RECIPES;

  const categoryCounts =
    new Map();

  const normalizedCounts =
    new Map();

  const unmappedCounts =
    new Map();

  const otherIdentityCounts =
    new Map();

  const noiseIdentityCounts =
    new Map();

  const categoryByIdentity =
    new Map();

  const searchByIdentity =
    new Map();

  const identityBySearch =
    new Map();

  const otherCategory = [];
  const missingSearch = [];
  const suspiciousNoise = [];
  const registryCategoryMismatch =
    [];

  let ingredientLines = 0;
  let shoppingItems = 0;
  let ignoredLines = 0;
  let registryMatchedItems =
    0;

  const suspiciousPattern =
    /\b(?:to taste|as needed|optional|opcional|divided|for garnish|for serving|stems removed|seeds removed|skin-on preferred|rotisserie works great|day-old preferred|side muscle removed)\b/i;

  for (const recipe of recipes) {
    const recipeName =
      String(
        recipe?.name ||
          recipe?.slug ||
          recipe?.id ||
          "Unknown recipe"
      );

    const lines =
      parser.splitIngredientLines(
        recipe?.ingredients ||
          "",
        {
          includeOptional: true,
        }
      );

    for (const line of lines) {
      ingredientLines += 1;

      const preview =
        shopping.previewRecipeIngredientForShopping(
          line
        );

      if (!preview) {
        ignoredLines += 1;
        continue;
      }

      shoppingItems += 1;

      const identity =
        String(
          preview.normalizedName ||
            ""
        ).trim();

      const search =
        String(
          preview.grocerySearchName ||
            ""
        ).trim();

      addCount(
        normalizedCounts,
        identity
      );

      addCount(
        categoryCounts,
        preview.category
      );

      addSetValue(
        categoryByIdentity,
        identity,
        preview.category
      );

      if (search) {
        addSetValue(
          searchByIdentity,
          identity,
          search
        );

        addSetValue(
          identityBySearch,
          search,
          identity
        );
      } else {
        missingSearch.push({
          recipe: recipeName,
          raw: line,
          identity,
          category:
            preview.category,
        });
      }

      if (
        preview.category ===
        "Other"
      ) {
        addCount(
          otherIdentityCounts,
          identity
        );

        otherCategory.push({
          recipe: recipeName,
          raw: line,
          identity,
          search,
        });
      }

      const noisyText = [
        preview.displayText,
        preview.normalizedName,
        preview.grocerySearchName,
      ].join(" ");

      if (
        suspiciousPattern.test(
          noisyText
        )
      ) {
        addCount(
          noiseIdentityCounts,
          identity
        );

        suspiciousNoise.push({
          recipe: recipeName,
          raw: line,
          display:
            preview.displayText,
          identity,
          search,
        });
      }

      const canonical =
        registry.findCanonicalIngredient(
          identity
        );

      if (canonical) {
        registryMatchedItems += 1;

        if (
          canonical.category !==
          preview.category
        ) {
          registryCategoryMismatch.push(
            {
              recipe:
                recipeName,
              raw: line,
              identity,
              shoppingCategory:
                preview.category,
              registryCategory:
                canonical.category,
              registryId:
                canonical.id,
            }
          );
        }
      } else {
        addCount(
          unmappedCounts,
          identity
        );
      }
    }
  }

  const categoryConflicts = [
    ...categoryByIdentity.entries(),
  ]
    .filter(
      ([, values]) =>
        values.size > 1
    )
    .map(
      ([identity, values]) => ({
        identity,
        categories: [
          ...values,
        ].sort(),
        occurrences:
          normalizedCounts.get(
            identity
          ) || 0,
      })
    )
    .sort(
      (first, second) =>
        second.occurrences -
        first.occurrences
    );

  const searchConflicts = [
    ...searchByIdentity.entries(),
  ]
    .filter(
      ([, values]) =>
        values.size > 1
    )
    .map(
      ([identity, values]) => ({
        identity,
        searchTerms: [
          ...values,
        ].sort(),
        occurrences:
          normalizedCounts.get(
            identity
          ) || 0,
      })
    )
    .sort(
      (first, second) =>
        second.occurrences -
        first.occurrences
    );

  const aliasCandidates = [
    ...identityBySearch.entries(),
  ]
    .filter(
      ([, values]) =>
        values.size > 1
    )
    .map(
      ([search, values]) => ({
        search,
        identities: [
          ...values,
        ].sort(),
      })
    )
    .sort(
      (first, second) =>
        second.identities.length -
          first.identities.length ||
        first.search.localeCompare(
          second.search
        )
    );

  const distinctIdentities =
    normalizedCounts.size;

  const matchedDistinct =
    [
      ...normalizedCounts.keys(),
    ].filter((identity) =>
      registry.findCanonicalIngredient(
        identity
      )
    ).length;

  const report = {
    generatedAt:
      new Date().toISOString(),
    summary: {
      recipes:
        recipes.length,
      ingredientLines,
      shoppingItems,
      ignoredLines,
      distinctShoppingIdentities:
        distinctIdentities,
      registryMatchedItems,
      registryItemCoveragePercent:
        shoppingItems
          ? Math.round(
              (registryMatchedItems /
                shoppingItems) *
                1000
            ) / 10
          : 0,
      registryMatchedDistinct:
        matchedDistinct,
      registryDistinctCoveragePercent:
        distinctIdentities
          ? Math.round(
              (matchedDistinct /
                distinctIdentities) *
                1000
            ) / 10
          : 0,
      otherCategory:
        otherCategory.length,
      missingSearch:
        missingSearch.length,
      suspiciousNoise:
        suspiciousNoise.length,
      categoryConflicts:
        categoryConflicts.length,
      searchConflicts:
        searchConflicts.length,
      registryCategoryMismatch:
        registryCategoryMismatch.length,
      aliasCandidateGroups:
        aliasCandidates.length,
    },
    categoryCounts:
      Object.fromEntries(
        [
          ...categoryCounts.entries(),
        ].sort(
          (first, second) =>
            second[1] -
            first[1]
        )
      ),
    topUnmapped:
      topEntries(
        unmappedCounts,
        40
      ),
    topOtherCategory:
      topEntries(
        otherIdentityCounts,
        30
      ),
    topRecipeNoise:
      topEntries(
        noiseIdentityCounts,
        30
      ),
    otherCategory:
      otherCategory.slice(
        0,
        100
      ),
    missingSearch:
      missingSearch.slice(
        0,
        100
      ),
    suspiciousNoise:
      suspiciousNoise.slice(
        0,
        100
      ),
    categoryConflicts,
    searchConflicts,
    registryCategoryMismatch:
      registryCategoryMismatch.slice(
        0,
        100
      ),
    aliasCandidates:
      aliasCandidates.slice(
        0,
        100
      ),
  };

  const outputPath =
    path.join(
      os.tmpdir(),
      "simple-dinners-shopping-list-audit.json"
    );

  fs.writeFileSync(
    outputPath,
    JSON.stringify(
      report,
      null,
      2
    )
  );

  console.log(
    "\nSimple Dinners Shopping List Audit"
  );
  console.log(
    "=================================="
  );
  console.log(
    `Recipes checked: ${report.summary.recipes}`
  );
  console.log(
    `Ingredient lines: ${report.summary.ingredientLines}`
  );
  console.log(
    `Shopping items: ${report.summary.shoppingItems}`
  );
  console.log(
    `Hidden/ignored: ${report.summary.ignoredLines}`
  );
  console.log(
    `Distinct identities: ${report.summary.distinctShoppingIdentities}`
  );
  console.log(
    `Registry coverage: ${report.summary.registryItemCoveragePercent}% of item occurrences / ${report.summary.registryDistinctCoveragePercent}% of distinct identities`
  );
  console.log(
    `Other category: ${report.summary.otherCategory}`
  );
  console.log(
    `Missing grocery search term: ${report.summary.missingSearch}`
  );
  console.log(
    `Recipe-noise warnings: ${report.summary.suspiciousNoise}`
  );
  console.log(
    `Category conflicts: ${report.summary.categoryConflicts}`
  );
  console.log(
    `Search-term conflicts: ${report.summary.searchConflicts}`
  );
  console.log(
    `Registry/category mismatches: ${report.summary.registryCategoryMismatch}`
  );
  console.log(
    `Possible alias groups: ${report.summary.aliasCandidateGroups}`
  );

  console.log(
    "\nMost common registry gaps:"
  );

  for (
    const item of
    report.topUnmapped.slice(
      0,
      20
    )
  ) {
    console.log(
      `  ${String(
        item.count
      ).padStart(3)}  ${item.name}`
    );
  }

  console.log(
    "\nMost common items landing in Other:"
  );

  if (
    report.topOtherCategory.length ===
    0
  ) {
    console.log("  None");
  } else {
    for (
      const item of
      report.topOtherCategory.slice(
        0,
        20
      )
    ) {
      console.log(
        `  ${String(
          item.count
        ).padStart(3)}  ${item.name}`
      );
    }
  }

  console.log(
    "\nRecipe-noise warnings:"
  );

  if (
    report.suspiciousNoise.length ===
    0
  ) {
    console.log("  None");
  } else {
    for (
      const item of
      report.suspiciousNoise.slice(
        0,
        20
      )
    ) {
      console.log(
        `  [${item.recipe}] ${item.raw} -> ${item.display}`
      );
    }
  }

  console.log(
    "\nRegistry/category mismatches:"
  );

  if (
    report.registryCategoryMismatch.length ===
    0
  ) {
    console.log("  None");
  } else {
    for (
      const item of
      report.registryCategoryMismatch.slice(
        0,
        30
      )
    ) {
      console.log(
        `  [${item.recipe}] ${item.identity}: Shopping=${item.shoppingCategory} / Registry=${item.registryCategory}`
      );
    }
  }

  console.log(
    "\nCategory conflicts:"
  );

  if (
    report.categoryConflicts.length ===
    0
  ) {
    console.log("  None");
  } else {
    for (
      const item of
      report.categoryConflicts.slice(
        0,
        20
      )
    ) {
      console.log(
        `  ${item.identity}: ${item.categories.join(
          " / "
        )} (${item.occurrences})`
      );
    }
  }

  console.log(
    `\nFull report: ${outputPath}\n`
  );
}

try {
  main();
} catch (error) {
  console.error(
    error instanceof Error
      ? error.stack ||
          error.message
      : error
  );
  process.exitCode = 1;
} finally {
  cleanup();
}
