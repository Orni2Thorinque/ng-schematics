import { HttpClient } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, '<%= assetPath %>/i18n/', '.json');
}

const translationOptions = {
  loader: {
    provide: TranslateLoader,
    useFactory: (createTranslateLoader),
    deps: [HttpClient]
  }
};

@NgModule({
  imports: [TranslateModule.forRoot(translationOptions)],
  exports: [TranslateModule],
  providers: [TranslateService]
})
export class <%= classify(prefix) %>I18nModule {

  private PLACEHOLDER = '%';

  constructor(private translate: TranslateService) {
    this.translate.addLangs(<%= printStringArray(parsedLangs) %>);
    this.translate.setDefaultLang('<%= parsedLangs[0] %>');

    // Check current user browser language
    const browserLang = this.translate.getBrowserLang();
    this.translate.use(browserLang ? browserLang : '<%= parsedLangs[0] %>');
  }

  public getTranslateValue(key: string, params ?: string | string[]): string {
    let translation = null;
    this.translate.get(key).subscribe((result) => {
      translation = result;
    });

    if (!params) {
      return translation;
    }
    return this.replace(translation, params);
  }

  private replace(chain: string = '', params: string | string[] = '') {
    let translation: string = chain;
    const values: string[] = [].concat(params);
    values.forEach((e, i) => {
      translation = translation.replace(this.PLACEHOLDER.concat(<any>i), e);
    });
    return translation;
  }
}
