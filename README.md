# DMS-DIGITAL-SCHEMATICS
This repository is a Schematic implementation for the following features
1. NGX-TRANSLATE for Angular 8+
2. NG-MATERIAL for Angular 8+


## Build schematics files and package

 1. Transpile typescript files to javascript
	`npm run build`
	
 2. Pack schematics as NPM package ***dms-digital-schematics-1.0.0.tgz***
	`npm pack`

## Schematics collection
**NGX-TRANSLATE** schematics alias ***ngx-i18n-module***
 - Add ngx-translate depedencies in ***package.json***
 - Create ngx-translate standalone module
 - Add standalone module to global module
 - Create i18n assets directory and files

**NG-MATERIAL** schematics alias ***ng-material-module***
 - Add ***@angular/material***  and ***@angular/cdk*** depedencies in ***package.json***
 - Add ***Hammerjs*** depedencies in ***package.json***
 - Create material standalone module
 - Add standalone module to global module
 - Add default material theme in global style css file
 - Add ***hammerjs*** depedency import in main typescript file

## Install schematics in existing project
Use NPM to install built NPM package
	`npm install --no-save /path/to/dms-digital-schematics-1.0.0.tgz`

## Execute schematic
**Execute (without install)**

*`schematics --force --debug=false /path/to/collection.json:schematic-alias`*

**Execute (with install)**
*`ng generate dms-digital-schematics:schematic-alias`*

**Example:**
*`ng generate dms-digital-schematics:ng-material-module`*
