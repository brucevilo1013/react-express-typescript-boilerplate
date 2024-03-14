#!/usr/bin/env node

const {promisify} = require('util');
const {join} = require('path');
const {mkdirSync, copyFileSync, unlinkSync, rmdirSync} = require('fs');
const {execSync} = require('child_process');

// Utility functions
const exec = promisify(require('child_process').exec);

async function runCmd(command) {
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

// Validate arguments
if (process.argv.length < 3) {
    console.log('Please specify the target project directory.');
    console.log('For example:');
    console.log('    npx create-vite-react-express my-app');
    console.log('    OR');
    console.log('    npm init create-vite-react-express my-app');
    process.exit(1);
}

// Define constants
const ownPath = process.cwd();
const folderName = process.argv[2];
const appPath = join(ownPath, folderName);
const repo = 'https://github.com/brucevilo1013/react-express-typescript-boilerplate';

// Check if directory already exists
try {
    mkdirSync(appPath);
} catch (err) {
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
        const useYarn = await hasYarn();
        console.log('Installing dependencies...');
        if (useYarn) {
            await runCmd('yarn run setup');
        } else {
            await runCmd('npm run setup');
        }
        console.log('Dependencies installed successfully.');

        // Copy environment variables
        copyFileSync(join(appPath, 'client', '.env.example'), join(appPath, 'client', '.env'));
        copyFileSync(join(appPath, 'server', '.env.example'), join(appPath, 'server', '.env'));
        console.log('Environment files copied.');

        // Delete .git folder
        await runCmd('npx rimraf ./.git');

        // Remove extra files
        unlinkSync(join(appPath, 'CHANGELOG.md'));
        unlinkSync(join(appPath, 'CODE_OF_CONDUCT.md'));
        unlinkSync(join(appPath, 'CONTRIBUTING.md'));
        unlinkSync(join(appPath, 'bin', 'createReactExpressApp.js'));
        rmdirSync(join(appPath, 'bin'));
        if (!useYarn) {
            unlinkSync(join(appPath, 'yarn.lock'));
        }

        console.log('Installation is now complete!');
        console.log();

        console.log('We suggest that you start by typing:');
        console.log(`    cd ${folderName}`);
        console.log(useYarn ? '    yarn dev' : '    npm run dev');
        console.log();
        console.log('Enjoy your production-ready React/Express app, which already supports a large number of ready-made features!');
        console.log('Check README.md for more info.');
    } catch (error) {
        console.log(error);
    }
}

setup();