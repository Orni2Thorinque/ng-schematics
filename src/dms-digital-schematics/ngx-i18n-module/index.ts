import { normalize, Path, strings } from '@angular-devkit/core';
import { classify, dasherize } from '@angular-devkit/core/src/utils/strings';
import { apply, mergeWith, move, Rule, SchematicContext, SchematicsException, template, Tree, url } from '@angular-devkit/schematics';
import { parseName } from '@schematics/angular/utility/parse-name';
import { buildDefaultPath } from '@schematics/angular/utility/project';
import { join } from 'path';
import { addImport, findModule, addPackages } from '../schematics-utils/ast-utils';
import { printStringArray } from '../schematics-utils/string.utils';
import { NgxI18nModuleSchema } from './schema';

export function ngxI18nModule(_options: NgxI18nModuleSchema): Rule {
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
    const templateSources = url('./templates');

    const parsedLangs: Array<string> = _options.langs.split(',');
    _options.parsedLangs = parsedLangs;

    const parsedAssetPath = _options.assetPath ? join(parsedPath.path, _options.assetPath) : parsedPath.path;
    parsedLangs.forEach((lang: string) =>
      tree.create(
        `${parsedAssetPath}\\i18n\\${lang}.json`,
        `{ "KEY": "VALUE" }`
      )
    );

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

        const classifiedName = `${classify(_options.prefix ? _options.prefix : 'app')}I18nModule`;
        // const importPath = `./${dasherize(classifiedName)}`;
        const importPath = `./${dasherize(<string>_options.prefix)}-i18n.module`;

        _context.logger.info(`
          targetModulePath: ${targetModulePath}
          classifiedName: ${classifiedName}
          importPath: ${importPath}
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

    const depedencies: Map<string, string> = new Map();
    depedencies.set('@ngx-translate/core', '^11.0.1');
    depedencies.set('@ngx-translate/http-loader', '^4.0.0');
    addPackages(depedencies, tree);

    // Update tree
    const sourceParametrizedTemplates = apply(templateSources, [rule, move('/src/app')]);
    return mergeWith(sourceParametrizedTemplates);
  };
}
