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
    var asyncWait = this.async();

    var questions = [{
      name: 'repoName',
      message: 'Repository name:',
      default: this.options.repo
    }, {
      name: 'repoUrl',
      message: 'Repository url:',
      default: function(answers) { return 'git@git.flowconcept.de:d8distro/'+ answers.repoName +'.git' }
    }, {
      name: 'templateUrl',
      message: 'Drupal composer template repository url:',
      default: 'git@github.com:flowconcept/drupal-project.git'
    }];

    this.prompt(questions, function ( answers ) {
      // this.repoName = answers.repoName;
      // Pass answers to params.
      for(var key in answers) {
        this[key] = answers[key];
      }
      asyncWait();
    }.bind(this));
  },

  /**
   * Create the file structure: copy files and folders.
   */
  setupRepository: function () {
    this.spawnCommandSync('git',['clone', this.repoUrl]);
    this.destinationPath(this.repoName);
    this.spawnCommandSync('git',['remote', 'add', 'drupal-project', this.templateUrl], {cwd: this.repoName});
    this.spawnCommandSync('git',['fetch', 'drupal-project'], {cwd: this.repoName});
    this.spawnCommandSync('git',['pull', 'drupal-project', '8.x'], {cwd: this.repoName});
  },

  install: function () {
/*    this.spawnCommand('composer', ['install']); */
  }

});
