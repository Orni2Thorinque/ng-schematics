import { Injectable } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { MatIconRegistry } from '@angular/material';

@Injectable()
export class <%= classify(prefix) %>MaterialIconService {
    constructor(private iconRegistry: MatIconRegistry, private sanitizer: DomSanitizer) {
        this.iconRegistry.addSvgIcon('', sanitizer.bypassSecurityTrustResourceUrl(''));
    }

    public getRegistry(): MatIconRegistry {
        return this.iconRegistry;
    }
}
