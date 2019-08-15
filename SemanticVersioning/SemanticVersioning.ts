import * as tl from "azure-pipelines-task-lib/task";
import * as tr from "azure-pipelines-task-lib/toolrunner";

import path = require("path");
import os = require("os");
import fs = require("fs");

function setVersion(version: string) {
    tl.command("build.updatebuildnumber", null, version);
    tl.setVariable("Extension.Version", version);
}

async function run() {
    const currentDirectory = __dirname;
    const sourcesDirectory = tl.getVariable("Build.SourcesDirectory");
    const configFilePath = tl.getInput("configFile", false) || ".semver.yml";
    const doNotUsePlusSymbol = tl.getBoolInput("doNotUsePlusSymbol", false);
    const plusReplacement = tl.getInput("plusReplacement");
    const configFullPath = path.join(sourcesDirectory, configFilePath);

    try {
        const isWin32 = os.platform() == "win32";
        const file = path.join(currentDirectory, "GitVersion-502-beta1-15", "GitVersion.exe");

        let exe: tr.ToolRunner;
        if (isWin32) {
            exe = tl.tool(file);
        } else {
            exe = tl.tool("mono");
            exe.arg(file);
        }

        exe.arg([sourcesDirectory]);

        try {
            const stat = fs.statSync(configFullPath);
            if (stat.isFile()) {
                exe.arg(["/config", configFullPath]);
                console.log("Detected a semver configuration file.");
            }
        } catch (e) {
            console.log(`No detected a semver configuration file. ${configFullPath}`);
        }

        const res = await exe.execSync(<any>{
            silent: true,
        });
        const git = JSON.parse(res.stdout);
        
        let version = git.FullSemVer;
        if (doNotUsePlusSymbol) {
            if (plusReplacement === "Build.BuildId") {
                const value = tl.getVariable(plusReplacement);
                version = version.replace(/\+(.*)$/, "." + value);
            } else {
                version = version.replace("+", plusReplacement);
            }
        }
        setVersion(version);
        tl.setResult(tl.TaskResult.Succeeded, `tfx exited with return code: ${res.code}`);
    } catch (err) {
        tl.debug(err.stack);
        tl.setResult(tl.TaskResult.Failed, err);
    }
}

run();