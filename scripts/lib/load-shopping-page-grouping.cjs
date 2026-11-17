// Execute the actual page's useMemo callback and its production helpers.
// AST extraction avoids mounting native/cloud UI dependencies in Node. No copied grouping logic.
const fs = require('node:fs');
const ts = require('typescript');
const { createTypeScriptLoader } = require('./load-typescript.cjs');
module.exports = function loadShoppingPageGrouping(source = fs.readFileSync('src/pages/ShoppingListPage.tsx', 'utf8')) {
  const load = createTypeScriptLoader();
  const dependencies = {};
  for (const file of [
    'src/core/shoppingProcessIngredients.ts', 'src/core/ingredientRegistry.ts', 'src/core/spanishIngredients.ts',
    'src/core/pantryShoppingCompatibility.ts', 'src/shoppingList.ts',
    'src/core/groceryCategories.ts', 'src/plus/smartShopping.ts',
    'src/i18n/index.ts', 'src/plus/smartShoppingThumbnails.ts',
    'src/core/data.ts', 'src/core/ingredientParser.ts',
    'src/core/groceryProductIdentity.ts', 'src/core/cookbookStore.ts',
    'src/core/pantryStore.ts', 'src/core/pantryUsage.ts',
  ]) Object.assign(dependencies, load(file));
  const ast = ts.createSourceFile('ShoppingListPage.tsx', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const component = ast.statements.find(s => ts.isFunctionDeclaration(s) && s.name?.text === 'ShoppingListPage');
  let callback;
  const selectors = {};
  function visit(node) {
    if (ts.isVariableDeclaration(node)) {
      const name = node.name.getText(ast);
      if (name === 'combinedItems') callback = node.initializer.arguments[0];
      if (['pantryRestockKeys', 'pantryCoveredItems', 'grouped'].includes(name)) selectors[name] = node.initializer.arguments[0].getText(ast);
    }
    ts.forEachChild(node, visit);
  }
  visit(component);
  if (!callback || !ts.isArrowFunction(callback)) throw new Error('Page grouping callback not found');
  const prefix = ast.statements.filter(s => s.pos < component.pos && !ts.isImportDeclaration(s)).map(s => s.getText(ast)).join('\n');
  const code = `${prefix}
    const group = function(shoppingItems: ShoppingItem[], pantryItems: PantryItem[] = []) ${callback.body.getText(ast)};
    group.select = function(combinedItems, pantryBuyAnywayIds = new Set(), hideChecked = false) {
      const pantryRestockKeys = (${selectors.pantryRestockKeys})();
      const pantryCoveredItems = (${selectors.pantryCoveredItems})();
      const grouped = (${selectors.grouped})();
      return { pantryCoveredItems, grouped };
    };
    return group;`;
  const compiled = ts.transpileModule(code, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  return new Function(...Object.keys(dependencies), compiled)(...Object.values(dependencies));
};
