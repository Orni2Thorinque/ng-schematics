import { join, Path } from '@angular-devkit/core';
import { DirEntry, SchematicsException, Tree } from '@angular-devkit/schematics';
import { addImportToModule } from '@schematics/angular/utility/ast-utils';
import { InsertChange } from '@schematics/angular/utility/change';
import * as ts from 'typescript';

export class AddToModuleContext {
    targetModulePath: string;
    classfiedName: string;
    importPath: string;
}

export function addImport(host: Tree, options: AddToModuleContext) {
    // Reading the module file
    const modulePath = <string>options.targetModulePath;
    const text = host.read(modulePath);
    if (text === null) {
        throw new SchematicsException(`File ${modulePath} does not exist.`);
    }
    const sourceText = text.toString('utf-8');
    const sourceFile: ts.SourceFile = ts.createSourceFile(modulePath, sourceText, ts.ScriptTarget.Latest, true);

    // Extracting other data
    const classifiedName = options.classfiedName;
    const importPath = options.importPath;

    const declarationChanges = addImportToModule(
        sourceFile,
        modulePath,         //      '/src/app/app.module.ts'
        classifiedName,     //      'AppI18nModule'
        importPath);        //      './app-i18n.module'

    const declarationRecorder = host.beginUpdate(modulePath);
    for (const change of declarationChanges) {
        if (change instanceof InsertChange) {
            declarationRecorder.insertLeft(change.pos, change.toAdd);
        }
    }

    host.commitUpdate(declarationRecorder);
};

/**
 * Function to find the "closest" module to a generated file's path.
 */
export function findModule(host: Tree, _: string): Path {
    let dir: DirEntry | null = host.getDir('src/app');

    const moduleRe = /\.module\.ts$/;
    const routingModuleRe = /-routing\.module\.ts/;
    const translateModuleRe = /-(translate|i18n)\.module\.ts/;
    const materialModuleRe = /-material\.module\.ts/;

    while (dir) {
        const matches = dir.subfiles.filter(p => moduleRe.test(p) && !routingModuleRe.test(p) && !translateModuleRe.test(p) && !materialModuleRe.test(p));

        if (matches.length == 1) {
            return join(dir.path, matches[0]);
        } else if (matches.length > 1) {
            throw new Error('More than one module matches, unable to choose target module');
        }

        dir = dir.parent;
    }

    throw new Error(`Could not find an NgModule from ${JSON.stringify(host)} and dir ${dir}`);
}
