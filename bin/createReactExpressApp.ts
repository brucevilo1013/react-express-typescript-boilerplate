#!/usr/bin/env node typescript

/**
 *
 * Create app script
 * @todo update console log with chalk
 * */

import util from 'util';
import path from 'path';
import fs from 'fs';
import { execSync } from 'child_process';

// Utility functions
const exec = util.promisify(require('child_process').exec);

async function runCmd(command: string) {
    try {
        const {stdout, stderr} = await exec(command);
        console.log(stdout);
        console.log(stderr);
    } catch (error) {
        console.log(error);
    }
}

async function hasYarn() {
    try {
        execSync('yarnpkg --version', {stdio: 'ignore'});
        return true;
    } catch {
        return false;
    }
}

async function hasBun() {
    try {
        execSync('bun --version', {stdio: 'ignore'});
        return true;
    } catch {
        return false;
    }
}

// Validate arguments
if (process.argv.length < 3) {
    console.log('Please specify the target project directory.');
    console.log('For example:');
    console.log('    npx create-react-express-app my-app');
    console.log('    OR');
    console.log('    npm init react-express-app my-app');
    process.exit(1);
}

// Define constants
const ownPath = process.cwd();
const folderName = process.argv[2];
const appPath = path.join(ownPath, folderName);
const repo = 'https://github.com/brucevilo1013/react-express-typescript-boilerplate';

// Check if directory already exists
try {
    fs.mkdirSync(appPath);
} catch (err: any) {
    if (err.code === 'EEXIST') {
        console.log('Directory already exists. Please choose another name for the project.');
    } else {
        console.log(err);
    }
    process.exit(1);
}

async function setup() {
    try {
        // Clone repo
        console.log(`Downloading files from repo ${repo}`);
        await runCmd(`git clone --depth 1 ${repo} ${folderName}`);
        console.log('Cloned successfully.');
        console.log('');

        // Change directory
        process.chdir(appPath);

        // Install dependencies
        const useBun = await hasBun();
        const useYarn = await hasYarn();
        console.log('Installing dependencies...');
        if (useBun) {
            await runCmd('bun run setup');
        } else if (useYarn) {
            await runCmd('yarn run setup');
        } else {
            await runCmd('npm run setup');
        }
        console.log('Dependencies installed successfully.');

        // Copy environment variables
        fs.copyFileSync(path.join(appPath, '.env.example'), path.join(appPath, '.env'));
        console.log('Environment files copied.');

        // Delete .git folder
        await runCmd('npx rimraf ./.git');

        // Remove extra files
        fs.unlinkSync(path.join(appPath, 'CHANGELOG.md'));
        fs.unlinkSync(path.join(appPath, 'CODE_OF_CONDUCT.md'));
        fs.unlinkSync(path.join(appPath, 'CONTRIBUTING.md'));
        fs.unlinkSync(path.join(appPath, 'bin', 'createNodejsApp.js'));
        fs.rmdirSync(path.join(appPath, 'bin'));
        if (!useYarn) {
            fs.unlinkSync(path.join(appPath, 'yarn.lock'));
        }

        console.log('Installation is now complete!');
        console.log();

        console.log('We suggest that you start by typing:');
        console.log(`    cd ${folderName}`);
        console.log(useYarn ? '    yarn dev' : '    npm run dev');
        console.log();
        console.log('Enjoy your production-ready Node.js app, which already supports a large number of ready-made features!');
        console.log('Check README.md for more info.');
    } catch (error) {
        console.log(error);
    }
}

await setup();