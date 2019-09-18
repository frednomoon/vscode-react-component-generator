import { workspace, Uri, window } from "vscode"
import * as fse from "fs-extra"
import * as fs from "fs"
import * as path from "path"
import { pascalCase } from "change-case"
import { Observable } from "rxjs"
import {
  IndexInterface,
  CSSInterface,
  ComponentInterface
} from "./interfaces/types"
import GlobalInterface from "./interfaces/global.interface"

// import { Config as ConfigInterface } from './config.interface';

export class FileHelper {
  private static assetRootDir: string = path.join(__dirname, "../../assets")

  private static createFile = <(file: string, data: string) => Observable<{}>>(
    Observable.bindNodeCallback(fse.outputFile)
  )

  public static createComponentDir(uri: any, componentName: string): string {
    let contextMenuSourcePath
    // const globalConfig: GlobalInterface = getConfig().get("global")

    if (uri && fs.lstatSync(uri.fsPath).isDirectory()) {
      contextMenuSourcePath = uri.fsPath
    } else if (uri) {
      contextMenuSourcePath = path.dirname(uri.fsPath)
    } else {
      contextMenuSourcePath = workspace.rootPath
    }

    // let componentDir = `${contextMenuSourcePath}`
    // if (globalConfig.generateFolder) {
    const componentDir = `${contextMenuSourcePath}/${this.setName(
      componentName
    )}`
    fse.mkdirsSync(componentDir)
    // }

    return componentDir
  }

  public static createComponent(
    componentDir: string,
    componentName: string,
    suffix: string = "-withStyles"
  ): Observable<string> {
    let templateFileName =
      this.assetRootDir + `/templates/component${suffix}.template`

    const compName = this.setName(componentName)

    let componentContent = fs
      .readFileSync(templateFileName)
      .toString()
      .replace(/{componentName}/g, compName)
      .replace(/{quotes}/g, this.getQuotes())

    let filename = `${componentDir}/${compName}.js`

    // if (componentConfig.create) {
    return this.createFile(filename, componentContent).map(result => filename)
    // } else {
    // return Observable.of("")
    // }
  }

  public static createStory(
    componentDir: string,
    componentName: string
  ): Observable<string> {
    const templateFileName =
      this.assetRootDir + `/templates/component.storybook.template`

    const compName = this.setName(componentName)

    let componentContent = fs
      .readFileSync(templateFileName)
      .toString()
      .replace(/{componentName}/g, compName)
      .replace(/{quotes}/g, this.getQuotes())

    let filename = `${componentDir}/${compName}.stories.js`

    // if (componentConfig.create) {
    return this.createFile(filename, componentContent).map(result => filename)
    // } else {
    //   return Observable.of("")
    // }
  }

  public static createIndexFile(
    componentDir: string,
    componentName: string
  ): Observable<string> {
    // const globalConfig: GlobalInterface = getConfig().get("global")
    // const indexConfig: IndexInterface = getConfig().get("indexFile")

    let templateFileName = this.assetRootDir + "/templates/index.template"
    // if (indexConfig.template) {
    // templateFileName = this.resolveWorkspaceRoot(indexConfig.template)
    // }

    const compName = this.setName(componentName)
    let indexContent = fs
      .readFileSync(templateFileName)
      .toString()
      .replace(/{componentName}/g, compName)
      .replace(/{quotes}/g, this.getQuotes())

    let filename = `${componentDir}/index.js`
    // if (indexConfig.create) {
    return this.createFile(filename, indexContent).map(result => filename)
    // } else {
    // return Observable.of("")
    // }
  }

  public static resolveWorkspaceRoot = (path: string): string =>
    path.replace("${workspaceFolder}", workspace.rootPath)

  private static getQuotes = () => "'"
  // private static getQuotes = (config: GlobalInterface) =>
  //   config.quotes === "double" ? '"' : "'"

  public static setName = (name: string) => pascalCase(name)
}

export function logger(
  type: "success" | "warning" | "error",
  msg: string = ""
) {
  switch (type) {
    case "success":
      return window.setStatusBarMessage(`Success: ${msg}`, 5000)
    // return window.showInformationMessage(`Success: ${msg}`);
    case "warning":
      return window.showWarningMessage(`Warning: ${msg}`)
    case "error":
      return window.showErrorMessage(`Failed: ${msg}`)
  }
}

// export default function getConfig(uri?: Uri) {
//   return {}
//   // return workspace.getConfiguration("FNMComponentGen", uri) as any
// }

export function removeBetweenTags(remainTag, removedtag, content) {
  const escapeRegExp = s => s.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&")
  const regexPattern = RegExp(
    `${escapeRegExp(`<${removedtag}>`)}([\\S\\s]+?)${escapeRegExp(
      `</${removedtag}>`
    )}`,
    "gi"
  )
  const removeOnlyTagsPattern = new RegExp(
    `<(${escapeRegExp(remainTag)}|/${escapeRegExp(remainTag)})[^>]{0,}>`,
    "gi"
  )

  return content.replace(regexPattern, "").replace(removeOnlyTagsPattern, "")
}
