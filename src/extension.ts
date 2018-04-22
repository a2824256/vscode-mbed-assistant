'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
let commandOutput: any = null;
let compileButton: vscode.StatusBarItem;

const spawnCMD = require('spawn-command');
export function activate(context: vscode.ExtensionContext) {
    checkMbedCLIInstalled()
    .then(() => {
        console.log('Installed mbed');
    })
    .catch(() => {
        console.log('if you have already installed pip, you can execute -- $ pip install mbed-cli');

        console.log('else, execute the following commands:');

        console.log('$ git clone https://github.com/ARMmbed/mbed-cli.git');

        console.log('$ cd mbed-cli');

        console.log('$ python setup.py install');
        vscode.window.showWarningMessage('Please install mbed-cli first.');
    });

    compileButton = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
    compileButton.text = `$(pencil) compile`;
    compileButton.tooltip = 'Compile current project';
    compileButton.command = 'extension.mbed.compile'; 
    compileButton.show();
    commandOutput = vscode.window.createOutputChannel('mbed-cli tasks');
    context.subscriptions.push(commandOutput);    
    context.subscriptions.push(vscode.commands.registerCommand('extension.mbed.start', () => {
        console.log('activate Mbed-CLI assistant');
    }));
    context.subscriptions.push(vscode.commands.registerCommand('extension.mbed.compile', () => {
        console.log('Starting compile');
        mbedCompileProject();
    }));
}

export function run(cmd:string, cwd:string): Promise<void> {
    return new Promise((accept, reject) => {
        let opts : any = {};
        if (vscode.workspace) {
        opts.cwd = cwd;
        }
        process = spawnCMD(cmd, opts);
        let printOutput = (data:any) => {
            commandOutput.append(data.toString());
        };
        process.stdout.on('data', printOutput);
        process.stderr.on('data', printOutput);
        process.on('close', (status:any) => {
            if (status) {
                reject(`Command \`${cmd}\` exited with status code ${status}.`);
            } else {
                accept();
            }
        });
    });
}

export function checkMbedCLIInstalled(): Promise<void> {
    return new Promise((resolve, reject) => {
        process = spawnCMD('which mbed');
        process.on('close', (status:any) => {
            if (status) {
                reject(`error`);
            } else {
                resolve();
            }  
        });
    });
}

export function generateCommand(): string {
    // const mcu = vscode.workspace.getConfiguration('mbed').get('mcu');
    // const toolchain = vscode.workspace.getConfiguration('mbed').get('toolchain');
    // const source = vscode.workspace.getConfiguration('mbed').get('source');
    // const build = vscode.workspace.getConfiguration('mbed').get('build');
    // const profile = vscode.workspace.getConfiguration('mbed').get('profile');
    // const library = vscode.workspace.getConfiguration('mbed').get('library');
    
    let cmd = `mbed compile -t GCC_ARM -m NUCLEO_L476RG`;
    // if (profile !== '') {
    //     cmd = cmd.concat(` --profile ${profile}`);
    // }
    // if (library) {
    //     cmd = cmd.concat(' --library');
    // }
    return cmd;
}

export function mbedCompileProject() {
    const cmd = generateCommand();
    let path = vscode.workspace.workspaceFolders[0].uri.path;
    console.log(path);
    exec(cmd, path)
        .then(() => {
            vscode.window.showInformationMessage(`Successfully complied`);
        }).catch((reason) => {
            commandOutput.appendLine(`> ERROR: ${reason}`);
            vscode.window.showErrorMessage(reason, 'Show Output')
            .then((action) => { commandOutput.show(); });
        });
}

export function exec(cmd:string, cwd:string): Promise<void> {
    // if (!cmd) {
    //     return;
    // }
    commandOutput.clear();
    commandOutput.show();
    commandOutput.appendLine(`> Running \`${cmd}\`...`);
    return run(cmd, cwd);
}

// this method is called when your extension is deactivated 
export function deactivate() {
    console.log('finish');
}