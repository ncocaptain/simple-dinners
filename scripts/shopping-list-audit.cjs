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


/**
 * End-to-end catalog simulation: use the same addIngredientsToList and
 * loadShoppingList methods as the app, but replace localStorage with an
 * in-memory store. No user's list, account, or Supabase data is touched.
 */
function simulateCompleteShoppingList(shopping, recipes) {
  const priorStorage = globalThis.localStorage;
  const priorWindow = globalThis.window;
  const priorCustomEvent = globalThis.CustomEvent;
  const values = new Map();

  globalThis.localStorage = {
    getItem(key) {
      return values.has(key) ? values.get(key) : null;
    },
    setItem(key, value) {
      values.set(key, String(value));
    },
    removeItem(key) {
      values.delete(key);
    },
    clear() {
      values.clear();
    },
  };
  globalThis.window = {
    dispatchEvent() {
      return true;
    },
  };
  globalThis.CustomEvent = class {
    constructor(type, options) {
      this.type = type;
      this.detail = options?.detail;
    }
  };

  try {
    let addedCount = 0;
    const additions = [];
    const failures = [];
    const zeroItemRecipes = [];
    const recipeNameCounts = new Map();

    for (const [index, recipe] of recipes.entries()) {
      const name = String(recipe?.name || recipe?.slug || recipe?.id || "Untitled recipe");
      addCount(recipeNameCounts, name.trim().toLowerCase());
      // Suffix is audit-only: recipes with duplicate display names should
      // not overwrite one another's ingredients during this stress test.
      const sourceLabel = name + " [audit-" + (index + 1) + "]";
      try {
        const result = shopping.addIngredientsToList(
          sourceLabel,
          String(recipe?.ingredients || "")
        );
        const count = Number(result?.addedCount || 0);
        addedCount += count;
        additions.push({
          recipe: name,
          sourceLabel,
          addedCount: count,
        });
        if (count === 0 && String(recipe?.ingredients || "").trim()) {
          zeroItemRecipes.push({ recipe: name, sourceLabel });
        }
      } catch (error) {
        failures.push({
          recipe: name,
          sourceLabel,
          message: String(error?.message || error),
        });
      }
    }

    const raw = shopping.loadRawShoppingList();
    let merged = [];
    let mergeError = null;
    try {
      merged = shopping.loadShoppingList();
    } catch (error) {
      mergeError = String(error?.stack || error);
    }

    const rawNames = new Map();
    const mergedNames = new Set(
      merged.map(item =>
        String(item?.normalizedName || "").trim().toLowerCase()
      )
    );
    const mergedSourceNames = new Map();
    const categoryCounts = new Map();
    const noSearch = [];
    const other = [];
    const invalidQuantity = [];
    const poorRetailerTerms = [];
    const missingAfterMerge = [];

    for (const item of raw) {
      const name = String(item?.normalizedName || "").trim().toLowerCase();
      addCount(rawNames, name);
      addCount(categoryCounts, String(item?.category || "Missing"));
      const searchName = String(item?.grocerySearchName || "").trim();
      if (!searchName) {
        noSearch.push({
          recipe: item.sourceRecipe,
          ingredient: item.recipeIngredientText || item.text,
          name,
        });
      }
      if (String(item.category || "") === "Other") {
        other.push({
          recipe: item.sourceRecipe,
          ingredient: item.recipeIngredientText || item.text,
          name,
        });
      }
      if (
        typeof item.quantity === "number" &&
        (!Number.isFinite(item.quantity) || item.quantity < 0)
      ) {
        invalidQuantity.push({
          recipe: item.sourceRecipe,
          ingredient: item.recipeIngredientText || item.text,
          quantity: item.quantity,
        });
      }
      if (
        /(?:^|\s)(?:\d+\/\d+|\d+)(?:\s|$)|\b(?:tbsp|tsp|cups?|to taste|optional|diced|chopped|divided|for serving)\b/i.test(searchName)
      ) {
        poorRetailerTerms.push({
          recipe: item.sourceRecipe,
          ingredient: item.recipeIngredientText || item.text,
          searchName,
        });
      }
      if (name && merged.length && !mergedNames.has(name)) {
        missingAfterMerge.push({
          recipe: item.sourceRecipe,
          ingredient: item.recipeIngredientText || item.text,
          name,
        });
      }
    }

    for (const item of merged) {
      const name = String(item?.normalizedName || "").trim().toLowerCase();
      addCount(mergedSourceNames, name);
    }

    const duplicateRecipeNames = [...recipeNameCounts.entries()]
      .filter(([, count]) => count > 1)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    return {
      summary: {
        recipesSimulated: recipes.length,
        addedIngredientRows: addedCount,
        rawSavedRows: raw.length,
        mergedRows: merged.length,
        rowsLostDuringSave: Math.max(0, addedCount - raw.length),
        mergeFailed: Boolean(mergeError),
        addFailures: failures.length,
        zeroItemRecipes: zeroItemRecipes.length,
        missingAfterMergeCandidates: missingAfterMerge.length,
        uncategorizedSavedRows: other.length,
        missingRetailerSearchTerms: noSearch.length,
        suspiciousRetailerSearchTerms: poorRetailerTerms.length,
        invalidQuantities: invalidQuantity.length,
        duplicateRecipeNameGroups: duplicateRecipeNames.length,
      },
      categoryCounts: Object.fromEntries(
        [...categoryCounts.entries()].sort((a, b) => b[1] - a[1])
      ),
      failures,
      mergeError,
      zeroItemRecipes: zeroItemRecipes.slice(0, 200),
      missingAfterMergeCandidates: missingAfterMerge.slice(0, 250),
      uncategorizedRows: other.slice(0, 250),
      missingRetailerSearchTerms: noSearch.slice(0, 250),
      suspiciousRetailerSearchTerms: poorRetailerTerms.slice(0, 250),
      invalidQuantities: invalidQuantity.slice(0, 250),
      duplicateRecipeNames,
      note:
        "Recipe add and shopping merge use production functions in isolated memory. " +
        "Missing-after-merge entries are candidates to inspect, not proof of data loss: " +
        "merging can intentionally normalize aliases. The rendered React UI and " +
        "retailer inventories are not exercised by this Node audit.",
    };
  } finally {
    if (priorStorage === undefined) delete globalThis.localStorage;
    else globalThis.localStorage = priorStorage;
    if (priorWindow === undefined) delete globalThis.window;
    else globalThis.window = priorWindow;
    if (priorCustomEvent === undefined) delete globalThis.CustomEvent;
    else globalThis.CustomEvent = priorCustomEvent;
  }
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

  // FULFILLMENT_CHOICE_AUDIT_V1
  const choiceTs = require("typescript");

  const choiceSourcePath = path.join(
    __dirname,
    "../src/core/groceryChoiceResolver.ts"
  );

  const choiceCompiledPath = path.join(
    tempDir,
    "src/core/groceryChoiceResolver.js"
  );

  fs.writeFileSync(
    choiceCompiledPath,
    choiceTs.transpileModule(
      fs.readFileSync(choiceSourcePath, "utf8"),
      {
        compilerOptions: {
          module: choiceTs.ModuleKind.CommonJS,
          target: choiceTs.ScriptTarget.ES2020
        }
      }
    ).outputText
  );

  const { resolveGroceryChoice, assessGroceryDeliveryReadiness } =
    require(choiceCompiledPath);

  // RETAILER_CATALOG_AUDIT_V1
  // Reuse the same requirement consolidation and retailer classification
  // modules as the Grocery Delivery Preview so audit and UI stay aligned.
  function loadTranspiledModule(relativePath, outputRelativePath) {
    const sourcePath = path.join(projectRoot, relativePath);
    const compiledPath = path.join(tempDir, outputRelativePath);

    fs.mkdirSync(path.dirname(compiledPath), {
      recursive: true,
    });

    fs.writeFileSync(
      compiledPath,
      choiceTs.transpileModule(
        fs.readFileSync(sourcePath, "utf8"),
        {
          compilerOptions: {
            module: choiceTs.ModuleKind.CommonJS,
            target: choiceTs.ScriptTarget.ES2020,
          },
        }
      ).outputText
    );

    return require(compiledPath);
  }

  const {
    summarizeGroceryRequirements,
  } = loadTranspiledModule(
    "src/fulfillment/groceryRequirementSummary.ts",
    "src/fulfillment/groceryRequirementSummary.js"
  );

  const {
    assessRetailerRequirement,
    assessRetailerSearchOnlyRequirement,
  } = loadTranspiledModule(
    "src/fulfillment/groceryRetailerMatch.ts",
    "src/fulfillment/groceryRetailerMatch.js"
  );

  const recipes =
    Array.isArray(
      data.ALL_RECIPES
    )
      ? data.ALL_RECIPES
      : data.DINNER_RECIPES;


  // COOKING_SPRAY_REGRESSION_V1
  // Cooking sprays are purchasable groceries.
  for (const line of [
    "Cooking spray",
    "cooking spray",
    "nonstick spray"
  ]) {
    const item =
      shopping.previewRecipeIngredientForShopping(line);

    if (
      !item ||
      !String(item.normalizedName || "").includes("spray")
    ) {
      throw new Error(
        "Cooking spray missing from Shopping List: " + line
      );
    }
  }

  // Keep ordinary water and preparation ice excluded.
  for (const line of [
    "2 cups water",
    "1/2 cup reserved pasta water",
    "crushed ice"
  ]) {
    const item =
      shopping.previewRecipeIngredientForShopping(line);

    if (item !== null) {
      throw new Error(
        "Non-shopping ingredient unexpectedly included: " + line
      );
    }
  }

  // Regression: comma-separated prep adjectives MUST NOT erase chicken.
  // The prior audit's zero add failures did not catch these omissions.
  for (const line of [
    "1 1/2 lb boneless, skinless chicken breast",
    "2 boneless, skinless chicken breasts, sliced",
    "4 boneless, skinless chicken breasts",
    "1 can (21 oz) ready-to-eat apple pie filling",
  ]) {
    const ingredient = shopping.previewRecipeIngredientForShopping(line);
    const expectedName = line.includes("chicken") ? "chicken breast" : "apple pie filling";
    if (!ingredient ||
        !String(ingredient.normalizedName || "").includes(expectedName)) {
      throw new Error(
        "Critical shopping ingredient disappeared: " + line +
        " -> " + JSON.stringify(ingredient)
      );
    }
  }


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
  const ignoredIngredientLines = [];
  const ambiguousRetailerProducts = [];
  const fulfillmentChoiceFindings = [];
  const deliveryReadinessCounts = {};
  const alternativeQuantityReviews = [];

  // Full-catalog retailer/package readiness.
  const retailerCatalogCounts = {};
  const retailerModeCounts = {};
  const retailerRequirementReviewCounts = {};
  const retailerRequirementReviews = [];
  const retailerPackageMatchIdentityCounts = new Map();
  const retailerPackageMatchUnitCounts = new Map();
  const retailerPackageMatchModeIdentityCounts = new Map();

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
        ignoredIngredientLines.push({ recipe: recipeName, raw: line });
        continue;
      }

      shoppingItems += 1;

      const choice = resolveGroceryChoice({
        normalizedName: preview.normalizedName,
        recipeIngredientText: line,
        grocerySearchName: preview.grocerySearchName
      });

      const readiness = assessGroceryDeliveryReadiness({
        normalizedName: preview.normalizedName,
        recipeIngredientText: line,
        grocerySearchName: preview.grocerySearchName,
        quantity: preview.quantity,
        unit: preview.unit,
        packageSize: preview.packageSize
      });

      deliveryReadinessCounts[readiness.state] =
        (deliveryReadinessCounts[readiness.state] || 0) + 1;

      if (readiness.needsQuantityRecalculation) {
        alternativeQuantityReviews.push({
          recipe: recipeName,
          raw: line,
          identity: preview.normalizedName,
          originalQuantity: preview.quantity,
          originalUnit: preview.unit,
          quantityOptions: readiness.quantityOptions
        });
      }

      // Classify the same ingredient through the same requirement-summary
      // and retailer-readiness modules used by Grocery Delivery Preview.
      // Shopper choices and preparation-only notes remain explicit blockers.
      if (choice.requiresSelection) {
        retailerCatalogCounts["needs-choice"] =
          (retailerCatalogCounts["needs-choice"] || 0) + 1;
      } else if (choice.status === "preparation-note") {
        retailerCatalogCounts["needs-product-review"] =
          (retailerCatalogCounts["needs-product-review"] || 0) + 1;
      } else {
        const requirementSummary = summarizeGroceryRequirements([
          {
            itemId:
              "catalog::" +
              recipeName +
              "::" +
              line,
            shoppingName:
              String(preview.normalizedName || ""),
            searchCandidate:
              String(preview.grocerySearchName || ""),
            sourceRecipe: recipeName,
            originalIngredient: line,
            quantity: preview.quantity,
            unit: preview.unit || "",
            packageSize: preview.packageSize || "",
            status: "search-candidate",
            quantityOptions: null,
            needsQuantityRecalculation: false,
            canAutoAddToCart: false,
          },
        ]);

        if (requirementSummary.reviews.length) {
          retailerCatalogCounts["needs-requirement-review"] =
            (retailerCatalogCounts["needs-requirement-review"] || 0) + 1;

          for (const review of requirementSummary.reviews) {
            retailerRequirementReviewCounts[review.reason] =
              (retailerRequirementReviewCounts[review.reason] || 0) + 1;

            if (retailerRequirementReviews.length < 250) {
              retailerRequirementReviews.push({
                recipe: recipeName,
                raw: line,
                identity: preview.normalizedName,
                search: preview.grocerySearchName,
                reason: review.reason,
                quantity: preview.quantity,
                unit: preview.unit,
                packageSize: preview.packageSize,
              });
            }
          }
        } else if (requirementSummary.searchOnly.length) {
          for (const requirement of requirementSummary.searchOnly) {
            const retailer =
              assessRetailerSearchOnlyRequirement(requirement);

            retailerCatalogCounts[retailer.status] =
              (retailerCatalogCounts[retailer.status] || 0) + 1;

            retailerModeCounts[retailer.mode] =
              (retailerModeCounts[retailer.mode] || 0) + 1;
          }
        } else {
          for (const requirement of requirementSummary.groups) {
            const retailer =
              assessRetailerRequirement(requirement);

            retailerCatalogCounts[retailer.status] =
              (retailerCatalogCounts[retailer.status] || 0) + 1;

            retailerModeCounts[retailer.mode] =
              (retailerModeCounts[retailer.mode] || 0) + 1;

            if (retailer.status === "package-match-needed") {
              const packageMatchIdentity =
                String(
                  requirement.shoppingName || ""
                ).trim().toLowerCase();

              const packageMatchUnit =
                String(
                  requirement.unit || "(none)"
                ).trim() || "(none)";

              addCount(
                retailerPackageMatchIdentityCounts,
                packageMatchIdentity
              );

              addCount(
                retailerPackageMatchUnitCounts,
                packageMatchUnit
              );

              const modeKey =
                String(retailer.mode || "unknown");

              if (
                !retailerPackageMatchModeIdentityCounts.has(
                  modeKey
                )
              ) {
                retailerPackageMatchModeIdentityCounts.set(
                  modeKey,
                  new Map()
                );
              }

              addCount(
                retailerPackageMatchModeIdentityCounts.get(
                  modeKey
                ),
                packageMatchIdentity
              );
            }
          }
        }
      }

      if (choice.status !== "ready") {
        fulfillmentChoiceFindings.push({
          recipe: recipeName,
          raw: line,
          identity: preview.normalizedName,
          search: preview.grocerySearchName,
          reason: choice.reason,
          status: choice.status,
          requiresSelection: choice.requiresSelection
        });
      }

      const identity =
        String(
          preview.normalizedName ||
            ""
        ).trim();

      // A retailer cannot reliably search for "of choice" or a
      // disjunction such as "ranch or italian dressing". Flag those
      // for a human decision instead of silently choosing a product.
      if (/\b(?:of choice|or [a-z][a-z -]+)\b/i.test(preview.normalizedName || "")) {
        ambiguousRetailerProducts.push({
          recipe: recipeName,
          raw: line,
          identity: String(preview.normalizedName || ""),
        });
      }


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

  const fullListSimulation = simulateCompleteShoppingList(shopping, recipes);

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
      ambiguousRetailerProducts: ambiguousRetailerProducts.length,
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
    fullListSimulation,
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
    ignoredIngredientLines,
    ambiguousRetailerProducts: ambiguousRetailerProducts.slice(0, 250),
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

  report.summary.fulfillmentChoices =
    fulfillmentChoiceFindings.length;

  report.summary.fulfillmentSelectionsNeeded =
    fulfillmentChoiceFindings.filter(
      item => item.requiresSelection
    ).length;

  report.deliveryReadiness = {
    statusCounts: deliveryReadinessCounts,
    alternativeQuantityReviews
  };

  report.retailerCatalogReadiness = {
    statusCounts: retailerCatalogCounts,
    modeCounts: retailerModeCounts,
    requirementReviewCounts:
      retailerRequirementReviewCounts,
    topPackageMatchIdentities:
      topEntries(
        retailerPackageMatchIdentityCounts,
        40
      ),
    packageMatchUnits:
      topEntries(
        retailerPackageMatchUnitCounts,
        20
      ),
    packageMatchByMode:
      Object.fromEntries(
        [
          ...retailerPackageMatchModeIdentityCounts.entries(),
        ].map(
          ([mode, counts]) => [
            mode,
            topEntries(counts, 20),
          ]
        )
      ),
    requirementReviews:
      retailerRequirementReviews,
  };

  report.summary.retailerSearchReady =
    retailerCatalogCounts["search-ready"] || 0;
  report.summary.retailerPackageMatchNeeded =
    retailerCatalogCounts["package-match-needed"] || 0;
  report.summary.retailerSearchOnly =
    retailerCatalogCounts["search-only"] || 0;
  report.summary.retailerRequirementReviews =
    retailerCatalogCounts["needs-requirement-review"] || 0;
  report.summary.retailerChoiceBlocked =
    retailerCatalogCounts["needs-choice"] || 0;
  report.summary.retailerProductReview =
    retailerCatalogCounts["needs-product-review"] || 0;

  report.summary.alternativeQuantityReviews =
    alternativeQuantityReviews.length;

  report.fulfillmentChoiceFindings =
    fulfillmentChoiceFindings;

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
  if (ignoredIngredientLines.length) {
    console.log("First skipped recipe ingredients:");
    for (const row of ignoredIngredientLines.slice(0, 15)) {
      console.log("  [" + row.recipe + "] " + row.raw);
    }
  }
  console.log(
    `Distinct identities: ${report.summary.distinctShoppingIdentities}`
  );
  console.log(
    `Registry coverage: ${report.summary.registryItemCoveragePercent}% of item occurrences / ${report.summary.registryDistinctCoveragePercent}% of distinct identities`
  );
  console.log(
    `Other category: ${report.summary.otherCategory}`
  );
  console.log(`Ambiguous grocery products: ${report.summary.ambiguousRetailerProducts}`);
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

  console.log("\nFull-catalog retailer readiness");
  console.log("--------------------------------");
  console.log(
    "  Search ready: " +
      report.summary.retailerSearchReady
  );
  console.log(
    "  Package match needed: " +
      report.summary.retailerPackageMatchNeeded
  );
  console.log(
    "  Search only (quantity unspecified): " +
      report.summary.retailerSearchOnly
  );
  console.log(
    "  Requirement review: " +
      report.summary.retailerRequirementReviews
  );
  console.log(
    "  Choice blocked: " +
      report.summary.retailerChoiceBlocked
  );
  console.log(
    "  Product/preparation review: " +
      report.summary.retailerProductReview
  );
  console.log(
    "  Retailer modes: " +
      JSON.stringify(retailerModeCounts)
  );
  console.log(
    "  Requirement review reasons: " +
      JSON.stringify(retailerRequirementReviewCounts)
  );

  const topPackageMatches =
    report.retailerCatalogReadiness
      .topPackageMatchIdentities;

  if (topPackageMatches.length) {
    console.log(
      "\nMost common package-match requirements:"
    );
    for (const item of topPackageMatches.slice(0, 20)) {
      console.log(
        "  " +
          String(item.count).padStart(3) +
          "  " +
          item.name
      );
    }
  }

  const packageMatchUnits =
    report.retailerCatalogReadiness
      .packageMatchUnits;

  if (packageMatchUnits.length) {
    console.log(
      "\nPackage-match requirements by unit:"
    );
    for (const item of packageMatchUnits) {
      console.log(
        "  " +
          String(item.count).padStart(4) +
          "  " +
          item.name
      );
    }
  }

  const packageMatchByMode =
    report.retailerCatalogReadiness
      .packageMatchByMode;

  for (const [mode, items] of Object.entries(
    packageMatchByMode
  )) {
    if (!items.length) continue;

    console.log(
      "\nTop package-match identities · " +
        mode +
        ":"
    );

    for (const item of items.slice(0, 15)) {
      console.log(
        "  " +
          String(item.count).padStart(4) +
          "  " +
          item.name
      );
    }
  }

  if (retailerRequirementReviews.length) {
    console.log(
      "\nFirst retailer requirement reviews:"
    );
    for (
      const item of retailerRequirementReviews.slice(0, 20)
    ) {
      console.log(
        "  [" +
          item.recipe +
          "] " +
          item.raw +
          " -> " +
          item.reason
      );
    }

    const quantityReviews =
      retailerRequirementReviews.filter(
        item => item.reason === "missing-quantity"
      );

    const unitReviews =
      retailerRequirementReviews.filter(
        item => item.reason === "missing-unit"
      );

    console.log(
      "\nRemaining missing-quantity reviews (" +
        quantityReviews.length +
        "):"
    );
    for (const item of quantityReviews) {
      console.log(
        "  [" +
          item.recipe +
          "] " +
          item.raw +
          " | parsed=" +
          JSON.stringify({
            identity: item.identity,
            quantity: item.quantity,
            unit: item.unit,
            packageSize: item.packageSize,
          })
      );
    }

    console.log(
      "\nFirst missing-unit reviews (" +
        unitReviews.length +
        " total):"
    );
    for (const item of unitReviews.slice(0, 40)) {
      console.log(
        "  [" +
          item.recipe +
          "] " +
          item.raw +
          " | parsed=" +
          JSON.stringify({
            identity: item.identity,
            quantity: item.quantity,
            unit: item.unit,
            packageSize: item.packageSize,
          })
      );
    }
  }

  console.log("\nEnd-to-end isolated Shopping List simulation");
  console.log("----------------------------------------");
  for (const [key, value] of Object.entries(fullListSimulation.summary)) {
    console.log("  " + key + ": " + value);
  }
  if (fullListSimulation.failures.length) {
    console.log("\nFirst recipe add errors:");
    for (const failure of fullListSimulation.failures.slice(0, 12)) {
      console.log("  " + failure.recipe + ": " + failure.message);
    }
  }
  if (fullListSimulation.missingAfterMergeCandidates.length) {
    console.log("\nFirst candidate missing items after merge:");
    for (const missing of fullListSimulation.missingAfterMergeCandidates.slice(0, 15)) {
      console.log("  " + missing.recipe + " -> " + missing.ingredient);
    }
  }

  console.log("\nSuspicious retailer search terms (first 10):");
  for (const item of fullListSimulation.suspiciousRetailerSearchTerms.slice(0, 10)) {
    console.log(
      "  [" + item.recipe + "] " + item.ingredient + " -> " + item.searchName
    );
  }
  console.log("\nAmbiguous grocery choices (first 15):");
  for (const item of ambiguousRetailerProducts.slice(0, 15)) {
    console.log("  [" + item.recipe + "] " + item.raw + " -> " + item.identity);
  }

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
