import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

let panel : vscode.WebviewPanel | undefined;

function getWebviewContent(context: vscode.ExtensionContext, panel: vscode.WebviewPanel) {
  const webviewPath = path.join(context.extensionPath, 'src', 'webview', 'index.html');
  const htmlContent = fs.readFileSync(webviewPath, 'utf-8');

  const alpineJsPath = vscode.Uri.file(path.join(context.extensionPath, 'src', 'webview', 'js', 'alpine.min.js'));
  const alpineJsUri = panel.webview.asWebviewUri(alpineJsPath);
  const mainScriptPath = vscode.Uri.file(path.join(context.extensionPath, 'src','webview', 'js', 'main.js'));
  const mainScriptUri = panel.webview.asWebviewUri(mainScriptPath);

  const vscodeStylesPath = vscode.Uri.file(path.join(context.extensionPath, 'src', 'webview', 'css', 'vscode.css'));
  const vscodeStylesUri = panel.webview.asWebviewUri(vscodeStylesPath);
  const stylesPath = vscode.Uri.file(path.join(context.extensionPath, 'src', 'webview', 'css', 'styles.css'));
  const stylesUri = panel.webview.asWebviewUri(stylesPath);

  return htmlContent
    .replace(/{stylesUri}/g, stylesUri.toString())
    .replace(/{vscodeStylesUri}/g, vscodeStylesUri.toString())
    .replace(/{alpineJsUri}/g, alpineJsUri.toString())
    .replace(/{mainScriptUri}/g, mainScriptUri.toString());
}

function showPanel(context: vscode.ExtensionContext) {
  if (panel) {
    panel.reveal();
    return;
  }

  panel = vscode.window.createWebviewPanel(
    'api-doc-genie.panel',
    'API Doc Genie',
    vscode.ViewColumn.Beside,
    {
      enableScripts: true,
      retainContextWhenHidden: true
    }
  );

  panel.onDidDispose(() => {
    panel = undefined;
  });

  panel.webview.html = getWebviewContent(context, panel);
  panel.webview.onDidReceiveMessage((message) => {
    switch (message.type) {
      case 'apiDocGenie:showDocumentation':
        vscode.workspace.openTextDocument({
          content: message.payload.documentation,
          language: 'markdown',
        }).then((doc) => {
          vscode.window.showTextDocument(doc, {
            preview: true,
            viewColumn: vscode.ViewColumn.Active,
          });
        });
      break;
      case 'apiDocGenie:showError':
        vscode.window.showErrorMessage(message.payload.error);
      break;
      case 'apiDocGenie:askSettings':
        vscode.window.showInformationMessage(message.payload.info, 'Open settings')
          .then((selection) => {
            if (selection === 'Open settings') {
              vscode.commands.executeCommand('workbench.action.openSettings', 'api-doc-genie');
            }
          });
      break;
      default:
    }
  }, undefined, context.subscriptions);

  postMessageToPanel('apiDocGenie:token', {
    token: getTokenOpenAi(),
  });
}

function getSelectedText() {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    return '';
  }

  const selection = editor.selection;
  const text = editor.document.getText(selection);
  return text;
}

function getTokenOpenAi() {
  const config = vscode.workspace.getConfiguration('api-doc-genie');
  const token = config.get('openaiToken');

  return token || '';
}

function postMessageToPanel(type: string, payload: any) {
  if (panel) {
    panel.webview.postMessage({ type, payload });
  }
}

export function activate(context: vscode.ExtensionContext) {
	let disposable = vscode.commands.registerCommand('api-doc-genie.openApiDocGenie', () => {
    showPanel(context);
	});
	context.subscriptions.push(disposable);

  let addToEndpoint = vscode.commands.registerCommand('api-doc-genie.addToEndpoint', () => {
    const text = getSelectedText();
    showPanel(context);
    postMessageToPanel('apiDocGenie:addToEndpoint', { text });
  });
  context.subscriptions.push(addToEndpoint);

  let addToRequest = vscode.commands.registerCommand('api-doc-genie.addToRequest', () => {
    const text = getSelectedText();
    showPanel(context);
    postMessageToPanel('apiDocGenie:addToRequest', { text });
  });
  context.subscriptions.push(addToRequest);

  let addToResponse = vscode.commands.registerCommand('api-doc-genie.addToResponse', () => {
    const text = getSelectedText();
    showPanel(context);
    postMessageToPanel('apiDocGenie:addToResponse', { text });
  });
  context.subscriptions.push(addToResponse);
}

export function deactivate() {}

vscode.workspace.onDidChangeConfiguration((e) => {
  if (e.affectsConfiguration('api-doc-genie') && panel) {
    postMessageToPanel('apiDocGenie:token', {
      token: getTokenOpenAi(),
    });
  }
});
