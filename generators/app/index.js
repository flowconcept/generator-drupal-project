/*eslint-env es6, node */
/**
 * @file
 *
 * Yeoman Drupal project generator definition.
 * Creates drupal-project instance with git repository and drupal profile.
 */

'use strict';

var mkdirp = require('mkdirp');

/**
 * Yeoman generator module.
 *
 * @type {function(): Environment|exports}
 */
var generators = require('yeoman-generator');
var path = require('path');
var randomstring = require('randomstring');


module.exports = generators.Base.extend({

  // The name `constructor` is important here
  constructor: function () {
    // Calling the super constructor is important so our generator is correctly set up
    generators.Base.apply(this, arguments);

    // Add commandline options
    this.option('repo', {
      desc: 'Provide repository name',
      type: String
    });
  },

  /**
   * Stage callback: prompting.
   */
  prompting: function () {
    var done = this.async();

    var questions = [{
      name: 'repoName',
      message: 'Repository name:',
      default: this.options.repo,
      store: true
    }, {
      name: 'repoUrl',
      message: 'Repository url:',
      default: function (answers) { return 'git@git.flowconcept.de:d8distro/' + answers.repoName + '.git'; },
      store: true
    }, {
      name: 'templateUrl',
      message: 'Drupal composer template repository url:',
      default: 'git@github.com:flowconcept/drupal-project.git',
      store: true
    }, {
      type: 'list',
      name: 'templateBranch',
      message: 'Drupal composer template repository branch:',
      choices: [
        {name: 'LESS', value: '8.x-less'},
        {name: 'Sass', value: '8.x-sass'}
      ],
      // Use master branch if not using flowconcept/drupa-project repository
      default: 'master',
      when: function (input) {
        return new Promise(function (resolve, reject) {
          resolve(input.templateUrl === 'git@github.com:flowconcept/drupal-project.git');
        });
      },
      store: true
    }, {
      name: 'stagingServer',
      message: 'Staging server',
      default: function (answers) { return 'staging8.flowconcept.de'; },
      store: true
    }, {
      name: 'stagingDomain',
      message: 'Staging domain',
      default: function (answers) { return answers.repoName + '.flowdemo.de'; },
      store: true
    }, {
      name: 'profileMachineName',
      message: 'Profile machine name',
      default: function (answers) { return answers.repoName + '_profile'; },
      store: true
    }, {
      name: 'profileName',
      message: 'Profile full name',
      default: function (answers) { return answers.repoName + ' Profile'},
      store: true
    }, {
      name: 'theme',
      message: 'Main theme',
      default: function (answers) { return answers.repoName; },
      store: true
    }];

    this.prompt(questions, function (answers) {
      this.dbDatabase = answers.repoName;
      // MySql limits username to 16 chars.
      this.dbUser = answers.repoName.substr(0, 15);
      this.dbPassword = randomstring.generate(16);
      this.drupalHashSalt = randomstring.generate(60);
      // Pass answers to params.
      for (var key in answers) {
        this[key] = answers[key];
      }
      done();
    }.bind(this));
  },

  /**
   * Clone repository and add drupal-project remote.
   */
  setupRepository: function () {
    this.spawnCommandSync('git', ['init'], {cwd: this.repoName});
    this.spawnCommandSync('git', ['remote', 'add', 'origin', this.repoUrl], {cwd: this.repoName});
    this.spawnCommandSync('git', ['remote', 'add', 'drupal-project', this.templateUrl], {cwd: this.repoName});
    this.spawnCommandSync('git', ['fetch', 'drupal-project'], {cwd: this.repoName});
    this.spawnCommandSync('git', ['pull', 'drupal-project', this.templateBranch], {cwd: this.repoName});
  },

  /**
   * Create the profile structure: copy files and folders.
   */
  generateProfile: function () {
    this.templateName = 'profile';
    this.templateDestination = this.repoName + '/htdocs/profiles/' + this.profileMachineName;

    // Create profile destination folder.
    mkdirp(this.templateDestination);
    this._copyFolders(['config', 'translations']);
    this._copyFiles([
      ['profile.info.yml', this.profileMachineName + '.info.yml'],
      ['profile.install', this.profileMachineName + '.install']
    ]);
  },

  /**
   * Create the profile structure: copy files and folders.
   */
  generateModules: function () {
    this.templateName = 'modules';
    this.templateDestination = this.repoName + '/htdocs/modules/custom';

    // Create destination folder.
    mkdirp(this.templateDestination);
    this._copyFolders(['site_devel']);
  },

  /**
   * Create the theme structure: copy files and folders.
   */
  generateTheme: function () {
    this.templateName = 'theme';
    this.templateDestination = this.repoName + '/htdocs/themes/' + this.theme;

    // Create theme destination folder.
    mkdirp(this.templateDestination);
    this._copyFiles([
      ['theme.info.yml', this.theme + '.info.yml']
    ]);
  },

  /**
   * Create basic configuration: apache2 vhost, drush and drupal settings.
   */
  generateConfiguration: function () {
    this.templateName = 'config';
    this.templateDestination = this.repoName + '/' + this.templateName;

    // Create config destination folder.
    mkdirp(this.templateDestination);
    this._copyFiles([
      ['config.aliases.drushrc.php', this.repoName + '.aliases.drushrc.php'],
      ['vhost.conf', this.repoName + '.conf'],
      ['default.settings.local.php', 'staging.settings.local.php']
    ]);
  },

  /**
   * Add hash_salt.
   */
  addSettingsPhp: function () {
    this.templateDestination = this.repoName + '/htdocs/sites/default';
    this._copyFiles([
      ['default.settings.php', 'settings.php']
    ]);
  },

  /**
   * Run composer install to build codebase
   */
  composerInstall: function () {
    this.spawnCommandSync('composer', ['install'], {cwd: this.repoName});
    this.spawnCommandSync('git', ['add', 'composer.lock'], {cwd: this.repoName});
  },

  /**
   * Copy files with templating.
   *
   * @param fileNames
   *  Array of array of file source paths and destination paths:
   *  [
   *    [oldfile.php, newfile.php]
   *  ]
   * @private
   */
  _copyFiles: function (fileNames) {
    try {
      var generator = this;
      fileNames.forEach(function (fileName) {
        generator.template(generator.templateName + '/' + fileName[0], generator.templateDestination + '/' + fileName[1]);
      });
    }
    catch (e) {
      this.log('Files cannot be copied.', fileNames, e);
    }
  },

  /**
   * Copy folders.
   *
   * @param folderNames
   *  Array of folder names.
   * @private
   */
  _copyFolders: function (folderNames) {
    try {
      var generator = this;
      folderNames.forEach(function (folderName) {
        generator.directory(generator.templateName + '/' + folderName, generator.templateDestination + '/' + folderName);
      });
    }
    catch (e) {
      this.log('Folder cannot be copied.', folderNames, e);
    }
  }
});
