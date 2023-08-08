const fs = require('node:fs/promises');
const path = require('node:path');
const shell = require('shelljs');
const template = require('./template.package.json');

//  UTILS
const cwd = (...p) => path.resolve(process.cwd(), ...p);
//  Random number from 0 to (limit - 1) inclusive
const rand = (limit = 1) => Math.floor(Math.random() * limit);
const pickRand = (arr = []) => arr[rand(arr.length)];
const log = (t) => console.log('\n=========', t, '=========');
const wait = (timeout = 1000) => new Promise(res => setTimeout(res, timeout));

// CONFIG
const PROJECTS_DIR_NAME = 'projects';
const PROJECTS_DIR = cwd(PROJECTS_DIR_NAME);
const PROJECTS_TO_CREATE = 30;
const NAME = 'margaritaville'; // Base name
const DESCRIPTION = 'margaritaville is a series of projects which tests some stuff in FOSSA.';
const FOSSA_API_KEY = '5107c1ee66bcb5414d58ab66bfae4760';
const FOSSA_ENDPOINT = 'http://localhost:9578';
const LICENSES = [ // Options for random license to be applied to the top-level project/package.json.
  'CPAL-1.0',
  'GPL-3.0-only',
  'LGPL-3.0-only',
  'BSD-3-Clause',
  'AAL',
  'Beerware',
  'WTFPL'
];

const DEPENDENCIES = [
  {
    name: '@ensdomains/ens-contracts',
    //  Versions with the vuln
    versions: [
      '0.0.1',  '0.0.2',  '0.0.3',
      '0.0.4',  '0.0.5',  '0.0.6',
      '0.0.7',  '0.0.8',  '0.0.9',
      '0.0.10', '0.0.11', '0.0.12',
      '0.0.13', '0.0.14', '0.0.15',
      '0.0.16', '0.0.17', '0.0.18',
      '0.0.19', '0.0.20', '0.0.21',
    ],
  },
  {
    name: 'glance',
    versions: [
      '0.0.1', '0.0.2',  '0.0.3',  '0.0.4',
      '0.0.5', '0.1.1',  '0.1.2',  '0.1.4',
      '0.1.5', '0.1.6',  '0.1.7',  '0.1.8',
      '0.1.9', '0.1.10', '0.1.11', '0.1.12',
      '0.2.0', '0.2.1',  '0.2.2',  '0.2.3',
      '0.2.4', '0.2.5',  '0.2.6',  '0.2.7',
      '0.3.0', '0.4.0',  '0.4.1',  '1.0.0',
      '2.0.0', '3.0.0',  '3.0.1',  '3.0.2',
      '3.0.3', '3.0.4',  '3.0.5',  '3.0.6',
      '3.0.7', '3.0.8',  '3.0.9'
    ]
  },
  {
    name: 'lodash',
    versions: [
      '0.1.0',      '0.2.0',      '0.2.1',   '0.2.2',   '0.3.0',
      '0.5.0-rc.1', '0.5.0',      '0.5.1',   '0.5.2',   '0.6.0',
      '0.9.0',      '0.9.1',      '0.9.2',   '0.10.0',  '1.0.0-rc.1',
      '1.0.0-rc.2', '1.0.0-rc.3', '1.0.0',   '1.0.1',   '1.0.2',
      '1.1.0',      '1.1.1',      '1.2.0',   '1.2.1',   '1.3.0',
      '1.3.1',      '2.0.0',      '2.1.0',   '2.2.0',   '2.2.1',
      '3.0.1',      '3.1.0',      '3.2.0',   '3.3.0',   '3.3.1',
      '3.9.0',      '3.9.1',      '3.9.2',   '3.9.3',   '3.10.0',
      '4.2.1',      '4.3.0',      '4.4.0',   '4.5.0',   '4.5.1',
      '4.6.0',      '4.6.1',      '4.7.0',   '4.8.0',   '4.8.1',
      '4.14.1',     '4.14.2',     '4.15.0',  '4.16.0',  '4.16.1',
    ],
  },
  {
    name: 'mongoose',
    versions: [
      '5.0.1',     '5.0.2',     '5.0.3',        '5.0.4',        '5.0.5',
      '5.0.11',    '5.0.12',    '5.0.13',       '5.0.14',       '5.0.15',
      '5.1.2',     '5.1.3',     '5.1.4',        '5.1.5',        '5.1.6',
      '5.2.3',     '5.2.4',     '5.2.5',        '5.2.6',        '5.2.7',
      '5.2.18',    '5.3.0',     '5.3.1',        '5.3.2',        '5.3.3',
      '5.3.9',     '5.3.10',    '5.3.11',       '5.3.12',       '5.3.13',
      '5.4.7',     '5.4.8',     '5.4.9',        '5.4.10',       '5.4.11',
      '5.5.3',     '5.5.4',     '5.5.5',        '5.5.6',        '5.5.7',
      '5.5.13',    '5.5.14',    '5.5.15',       '5.6.0',        '5.6.1',
      '5.6.12',    '5.6.13',    '5.7.0',        '5.7.1',        '5.7.3',
      '5.7.9',     '5.7.10',    '5.7.11',       '5.7.12',       '5.7.13',
      '5.8.10',    '5.8.11',    '5.8.12',       '5.8.13',       '5.9.0',
      '5.9.17',    '5.9.18',    '5.9.19',       '5.9.20',       '5.9.21',
      '5.10.7',    '5.10.8',    '5.10.9',       '5.10.10',      '5.10.11',
      '5.10.17',   '5.10.18',   '5.10.19',      '5.11.0',       '5.11.1',
      '5.11.7',    '5.11.8',    '5.11.9',       '5.11.10',      '5.11.11',
      '5.11.17',   '5.11.18',   '5.11.19',      '5.11.20',      '5.12.0',
      '5.12.6',    '5.12.7',    '5.12.8',       '5.12.9',       '5.12.10',
      '5.13.0',    '5.13.1',    '5.13.2',       '5.13.3',       '5.13.4',
      '5.13.10',   '5.13.11',   '5.13.12',      '5.13.13',      '5.13.14',
      '5.13.15',   '5.13.16',   '5.13.17',      '5.13.18',
      '5.13.19',   '6.0.0-rc0', '6.0.0-rc1',    '6.0.0-rc2',    '6.0.0',
      '6.0.1',     '6.0.2',     '6.0.3',        '6.0.4',        '6.0.5',
      '6.0.6',     '6.0.7',     '6.0.8',        '6.0.9',        '6.0.10',
      '6.0.11',    '6.0.12',    '6.0.13',       '6.0.14',       '6.0.15',
      '6.1.5',     '6.1.6',     '6.1.7',        '6.1.8',        '6.1.9',
      '6.3.2',     '6.3.3',     '6.3.4',        '6.3.5',        '6.3.6',
      '6.4.2',     '6.4.3',     '6.4.4',        '6.4.5',        '6.4.6',
      '6.5.4',     '6.5.5',     '6.6.0',        '6.6.1',        '6.6.2',
      '6.6.3',     '6.6.4',     '6.6.5',        '6.6.6',        '6.6.7',
      '6.7.5',     '6.8.0',     '6.8.1',        '6.8.2',        '6.8.3',
      '6.10.0',    '6.10.1',    '6.10.2',       '6.10.3',       '6.10.4',
      '6.10.5',    '6.11.0',    '6.11.1',
      '6.11.4',    '6.11.5',    '7.0.0-rc0',    '7.0.0',        '7.0.1',
      '7.0.2',     '7.0.3',     '7.0.4',        '7.0.5',        '7.1.0',
      '7.1.1',     '7.1.2',     '7.2.0',        '7.2.1',        '7.2.2',
      '7.2.3',     '7.2.4',     '7.3.0',        '7.3.1',        '7.3.2',
    ],
  },
  {
    name: "remult",
    versions: [
      '0.4.9',         '0.4.10',        '0.4.11',        '0.4.12',
      '0.5.2',         '0.5.3',         '0.5.4',         '0.5.5',
      '0.7.1',         '0.7.2',         '0.7.3',         '0.7.4',
      '0.8.2',         '0.8.3',         '0.9.1',         '0.9.2',
      '0.9.15',        '0.9.16',        '0.9.17',        '0.9.18',
      '0.9.23',        '0.9.24',        '0.9.25',        '0.9.26',
      '0.10.10',       '0.10.11',       '0.10.12',       '0.10.13',
      '0.11.2',        '0.11.3',        '0.11.4',        '0.12.1',
      '0.13.5',        '0.13.6',        '0.13.7',        '0.13.8',
      '0.13.13',       '0.13.14',       '0.13.15',       '0.13.16',
      '0.14.2',        '0.14.3',        '0.14.4',        '0.14.5',
      '0.14.8',        '0.14.9',        '0.14.10',       '0.14.11',
      '0.14.25',       '0.14.26',       '0.14.27',       '0.14.28',
      '0.14.33',       '0.14.34',       '0.14.35',       '0.15.0',
      '0.15.5-exp.1',  '0.15.5-exp.2',  '0.16.0-exp.1',  '0.16.0-exp.2',
      '0.16.0-exp.7',  '0.16.0-exp.8',  '0.16.0-exp.9',  '0.16.0-exp.10',
      '0.16.1',        '0.16.2-exp.0',  '0.16.2-exp.1',  '0.16.2',
      '0.16.3-exp.4',  '0.16.3',        '0.16.4',        '0.16.5',
      '0.17.0-exp.1',  '0.17.0-exp.2',  '0.17.0-exp.3',  '0.17.0-exp.4',
      '0.17.0-exp.9',  '0.17.0-exp.10', '0.17.0',        '0.17.1',
      '0.17.2',        '0.17.3',        '0.18.0',        '0.18.1-exp.0',
      '0.18.1-exp.1',  '0.18.1-exp.2',  '0.18.1-exp.3',  '0.18.1-exp.4',
      '0.18.1-exp.41', '0.18.1',        '0.19.0-exp.2',  '0.19.0-exp.3',
      '0.19.0',        '0.19.1',        '0.19.2-exp.0',  '0.19.2',
      '0.19.3',        '0.20.0-exp.1',  '0.20.0-exp.2',  '0.20.0-exp.3',
      '0.20.0-exp.4',  '0.20.0-exp.5',  '0.20.0-exp.6',  '0.20.0-exp.7',
      '0.20.1',        '0.20.2',        '0.20.3-exp.0',  '0.20.3-exp.1',
      '0.20.3-exp.2',  '0.20.3',        '0.20.4',        '0.20.5-exp.1',
      '0.20.5-exp.2',  '0.20.5-exp.3',  '0.20.5-exp.4',  '0.20.5',
    ],
  },
  {
    name: "shescape",
    versions: [
      '0.1.0', '0.2.0',     '0.2.1', '0.3.0',
      '0.3.1', '0.4.0',     '0.4.1', '1.0.0',
      '1.1.0', '1.1.1',     '1.1.2', '1.1.3',
      '1.2.0', '1.2.1',     '1.3.0', '1.3.1',
      '1.3.2', '1.3.3',     '1.4.0', '1.5.0',
      '1.5.1', '1.5.2',     '1.5.3', '1.5.4',
      '1.5.5', '1.5.6',     '1.5.7', '1.5.8',
      '1.5.9', '1.5.10',    '1.6.0', '1.6.1',
      '1.6.2', '1.6.3',     '1.6.4', '1.6.5',
      '1.6.6', '1.6.7',     '1.7.0',
    ]
  },
  {
    name: 'svelte',
    versions: [
      '2.15.3',         '2.16.0',        '2.16.1',         '3.0.0-alpha1',
      '3.0.0-alpha4',   '3.0.0-alpha5',  '3.0.0-alpha6',   '3.0.0-alpha7',
      '3.0.0-alpha8',   '3.0.0-alpha9',  '3.0.0-beta.1',   '3.0.0-beta.2',
      '3.0.0-beta.3',   '3.0.0-beta.4',  '3.0.0-beta.5',   '3.0.0-beta.6',
      '3.0.0-beta.7',   '3.0.0-beta.8',  '3.0.0-beta.9',   '3.0.0-beta.10',
      '3.0.0-beta.23',  '3.0.0-beta.25', '3.0.0-beta.26',  '3.0.0-beta.27',
      '3.0.0-beta.28',  '3.0.0',         '3.0.1',          '3.1.0',
      '3.12.0',         '3.12.1',        '3.13.0-alpha.0', '3.13.0-alpha.1',
      '3.13.0-alpha.2', '3.13.0',        '3.14.0',         '3.14.1',
      '4.0.0-next.0',   '4.0.0-next.1',  '4.0.0-next.2',   '4.0.0-next.3',
      '4.0.0',          '4.0.1',         '4.0.2',          '4.0.3',
      '4.0.4',          '4.0.5',         '4.1.0',          '4.1.1',
      '4.1.2'
    ],
  },
  {
    name: "matrix-react-sdk",
    versions: [
      '3.32.0',                 '3.32.1',                 '3.33.0-rc.1',
      '3.33.0-rc.2',            '3.33.0',                 '3.34.0-rc.1',
      '3.34.0',                 '3.35.0-rc.1',            '3.35.1',
      '3.36.0-rc.1',            '3.36.0',                 '3.36.1',
      '3.37.0-rc.1',            '3.37.0',                 '3.38.0-rc.1',
      '3.38.0',                 '3.39.0-rc.1',            '3.39.0-rc.2',
      '3.39.0',                 '3.39.1',                 '3.40.0-rc.1',
      '3.40.0-rc.2',            '3.40.0',                 '3.40.1',
      '3.41.0-rc.1',            '3.41.0',                 '3.41.1',
      '3.42.0-rc.1',            '3.42.0',                 '3.42.1-rc.1',
      '3.42.1',                 '3.42.2-rc.1',            '3.42.2-rc.2',
      '3.42.2-rc.3',            '3.42.2-rc.4',            '3.42.3',
      '3.42.4',                 '3.43.0-rc.1',            '3.43.0',
      '3.44.0-rc.1',            '3.44.0-rc.2',            '3.44.0',
      '3.45.0-rc.2',            '3.45.0-rc.3',            '3.45.0',
      '3.46.0-rc.1',            '3.46.0',                 '3.47.0',
      '3.48.0-rc.1',            '3.48.0',                 '3.49.0-rc.1',
      '3.49.0-rc.2',            '3.49.0',                 '3.50.0',
      '3.51.0-rc.1',            '3.51.0',                 '3.52.0-rc.1',
      '3.52.0-rc.2',            '3.52.0',                 '3.53.0-rc.1',
      '3.53.0-rc.2',            '3.53.0',                 '3.54.0-rc.1',
      '3.54.0',                 '3.55.0-rc.1',            '3.55.0',
      '3.56.0',                 '3.57.0',                 '3.58.0-rc.1',
      '3.58.0-rc.2',            '3.58.0',                 '3.58.1',
      '3.59.0-rc.1',            '3.59.0-rc.2',            '3.59.0',
      '3.59.1',                 '3.60.0-rc.1',            '3.60.0-rc.2',
      '3.60.0',                 '3.61.0-rc.1',            '3.61.0',
      '3.62.0-rc.1',            '3.62.0-rc.2',            '3.62.0',
      '3.63.0-rc.2',            '3.63.0',                 '3.64.0-rc.1',
      '3.64.0-rc.2',            '3.64.0-rc.3',            '3.64.0-rc.4',
      '3.64.0',                 '3.64.1',                 '3.64.2',
      '3.65.0-rc.1',            '3.65.0',                 '3.66.0-rc.1',
      '3.66.0',                 '3.67.0-rc.1',            '3.67.0-rc.2',
      '3.67.0',                 '3.68.0-rc.1',            '3.68.0-rc.2',
      '3.68.0-rc.3',            '3.68.0',                 '3.69.0',
      '3.69.1',                 '3.70.0-rc.1',            '3.70.0',
    ],
  }
];


function cleanProjects() {
  shell.rm('-rf', PROJECTS_DIR);
  shell.mkdir(PROJECTS_DIR);
}

function generatePackageJSON(projectName = '') {
  return JSON.stringify({
    ...template,
    name: projectName,
    description: DESCRIPTION,
    license: pickRand(LICENSES),
    dependencies: Object.fromEntries(
      DEPENDENCIES.map(dep => [
        dep.name,
        pickRand(dep.versions),
      ]),
    ),
  }, null, 2);
}

async function makeNewProject(index = 0) {
  const projectName = `${NAME}-${String(index + 1).padStart(3, '0')}`;
  const projectPath = cwd(PROJECTS_DIR_NAME, projectName);
  const pkgPath = cwd(PROJECTS_DIR_NAME, projectName, 'package.json');
  const packageJSONContents = generatePackageJSON(projectName);

  console.log(`🐣 === CREATING ${projectName} === 🐣`);
  await fs.mkdir(projectPath);
  shell.cd(projectPath);
  shell.exec('git init');
  shell.cd('../../');
  await fs.writeFile(pkgPath, packageJSONContents, 'utf8');
}

function listProjects() {
  return Array.from(shell.ls(PROJECTS_DIR));
}

function checkFossa() {
  if (!shell.which('fossa')) {
    shell.echo('Sorry, this script requires fossa-cli');
    shell.exit(1);
  }
}

function uploadProject(projectPath = '') {
  shell.cd(projectPath);
  shell.exec(`FOSSA_API_KEY=${FOSSA_API_KEY} fossa analyze -e ${FOSSA_ENDPOINT}`);
  shell.cd('../../');
}


(async function main() {
  log('Creating projects...');
  //  Create all projects
  cleanProjects();
  await Promise.all([
    ...Array(PROJECTS_TO_CREATE)].map((_element, i) => makeNewProject(i)
  ));

  log('Checking if fossa-cli is installed...')
  //  Check that FOSSA exists before proceeding
  checkFossa();

  log('Running FOSSA CLI on each one...');
  //  Run FOSSA CLI on each one
  for await (const projectDir of listProjects()) {
    console.log(`➡️ Running for ${projectDir}`);
    uploadProject(cwd(PROJECTS_DIR_NAME, projectDir));
    console.log('Waiting 1s before doing the next one.')
    await wait(1000);
  }
}());
