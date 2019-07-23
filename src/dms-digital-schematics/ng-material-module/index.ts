import { normalize, Path, strings } from '@angular-devkit/core';
import { classify, dasherize } from '@angular-devkit/core/src/utils/strings';
import { apply, filter, mergeWith, move, noop, Rule, SchematicContext, SchematicsException, Source, template, Tree, url } from '@angular-devkit/schematics';
import { parseName } from '@schematics/angular/utility/parse-name';
import { buildDefaultPath } from '@schematics/angular/utility/project';
import { addImport, addImportDeclaration, addPackages, findModule } from '../schematics-utils/ast-utils';
import { printStringArray } from '../schematics-utils/string.utils';
import { NgMaterialModuleSchema } from './schema';

export function ngMaterialModule(_options: NgMaterialModuleSchema): Rule {
  return (tree: Tree, _context: SchematicContext) => {

    // Retrieve Angular project config properties
    const workspaceConfigBuffer = tree.read('angular.json');
    if (!workspaceConfigBuffer) {
      throw new SchematicsException('Not in an Angular 6+ project directory');
    }

    const workspaceConfig: any = JSON.parse(workspaceConfigBuffer.toString());
    const projectName = _options.project ? _options.project : workspaceConfig.defaultProject;
    const project = workspaceConfig.projects[projectName];

    const defaultProjectPath = buildDefaultPath(project)
    const parsedPath = parseName(defaultProjectPath, '');

    // Parameterize templates and files accordingly
    const templateSources: Source = apply(url('./templates'),
      [!_options.iconRegistry ? filter(path => !path.endsWith('.service.ts')) : noop()]);

    const rule: Rule = template({
      ..._options,
      ...strings,
      printStringArray,
    });

    // Import i18n module to existing module
    let targetModulePath: Path | string = parsedPath.path;

    if (_options.modulePath && _options.modulePath.trim().length) {
      const foundModulePath: Path | undefined = findModule(tree, _options.modulePath);

      if (targetModulePath) {
        targetModulePath = normalize(foundModulePath).toString();

        const classifiedName = `${classify(_options.prefix ? _options.prefix : 'app')}MaterialModule`;
        const importPath = `./${dasherize(<string>_options.prefix)}-material.module`;

        _context.logger.info(`
          defaultProjectPath: ${defaultProjectPath}
          parsedPath: ${parsedPath}
          targetModulePath: ${targetModulePath}
          classifiedName: ${classifiedName}
          importPath: ${importPath}
          _options.modulePath ${_options.modulePath}
        `);

        addImport(tree, {
          targetModulePath: targetModulePath,
          classfiedName: classifiedName,
          importPath: importPath,
        });

      } else {
        throw new SchematicsException(`Unable to locate target module from path ${targetModulePath}`);
      }
    }

    // Add packge.json declarations
    const depedencies: Map<string, string> = new Map();

    depedencies.set('@angular/cdk', '^8.0.0');
    depedencies.set('@angular/material', '^8.0.0');
    if (_options.importHammerGesture) {
      depedencies.set('hammerjs', '^2.0.0');
    }

    addPackages(depedencies, tree);

    // Add imports
    if (_options.importHammerGesture) {
      addImportDeclaration('hammerjs', '/src/main.ts', 'simple', tree);
    }

    if (_options.importStyle) {
      addImportDeclaration('~@angular/material/prebuilt-themes/indigo-pink.css',
        '/src/styles.css',
        'css',
        tree
      );
    }

    // Update tree
    const sourceParametrizedTemplates = apply(templateSources, [rule, move(_options.modulePath ? normalize(_options.modulePath) : '.')]);
    return mergeWith(sourceParametrizedTemplates)(tree, _context);
  };
}
