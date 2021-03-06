
import {YamlCompletion} from './services/yamlCompletion';
import {JSONSchemaService} from './services/jsonSchemaService'


import { TextDocument, Position, CompletionList } from 'vscode-languageserver-types';
import { YAMLDocument} from 'yaml-ast-parser';

export interface PromiseConstructor {
    /**
     * Creates a new Promise.
     * @param executor A callback used to initialize the promise. This callback is passed two arguments:
     * a resolve callback used resolve the promise with a value or the result of another promise,
     * and a reject callback used to reject the promise with a provided reason or error.
     */
    new <T>(executor: (resolve: (value?: T | Thenable<T>) => void, reject: (reason?: any) => void) => void): Thenable<T>;

    /**
     * Creates a Promise that is resolved with an array of results when all of the provided Promises
     * resolve, or rejected when any Promise is rejected.
     * @param values An array of Promises.
     * @returns A new Promise.
     */
    all<T>(values: Array<T | Thenable<T>>): Thenable<T[]>;
    /**
     * Creates a new rejected promise for the provided reason.
     * @param reason The reason the promise was rejected.
     * @returns A new rejected Promise.
     */
    reject<T>(reason: any): Thenable<T>;

    /**
      * Creates a new resolved promise for the provided value.
      * @param value A promise.
      * @returns A promise whose internal state matches the provided promise.
      */
    resolve<T>(value: T | Thenable<T>): Thenable<T>;

}

export interface Thenable<R> {
    /**
    * Attaches callbacks for the resolution and/or rejection of the Promise.
    * @param onfulfilled The callback to execute when the Promise is resolved.
    * @param onrejected The callback to execute when the Promise is rejected.
    * @returns A Promise for the completion of which ever callback is executed.
    */
    then<TResult>(onfulfilled?: (value: R) => TResult | Thenable<TResult>, onrejected?: (reason: any) => TResult | Thenable<TResult>): Thenable<TResult>;
    then<TResult>(onfulfilled?: (value: R) => TResult | Thenable<TResult>, onrejected?: (reason: any) => void): Thenable<TResult>;
}

export interface WorkspaceContextService {
	resolveRelativePath(relativePath: string, resource: string): string;
}
/**
 * The schema request service is used to fetch schemas. The result should the schema file comment, or,
 * in case of an error, a displayable error string
 */
export interface SchemaRequestService {
	(uri: string): Thenable<string>;
}
export interface LanguageService {
	doComplete(document: TextDocument, position: Position, doc: YAMLDocument): Thenable<CompletionList>;
}

export function getLanguageService(schemaRequest: SchemaRequestService, wscontext:WorkspaceContextService): LanguageService {
  let schemaService = new JSONSchemaService(schemaRequest, wscontext);
  //TODO: maps schemas from settings.
  schemaService.registerExternalSchema('http://central.maven.org/maven2/io/fabric8/kubernetes-model/1.0.65/kubernetes-model-1.0.65-schema.json',
  ['*.yml']);

  let completer = new YamlCompletion(schemaService);
  return {
    	doComplete: completer.doComplete.bind(completer),
  }
}
