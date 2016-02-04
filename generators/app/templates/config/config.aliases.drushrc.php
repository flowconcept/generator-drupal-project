<?php
$aliases['staging'] = array (
  'root' => '/www/<%= repoName %>/htdocs',
  'uri' => 'http://<%= stagingDomain %>',
  'remote-host' => '<%= stagingServer %>',
  'remote-user' => 'root',
  'ssh-options' => '-o StrictHostKeyChecking=no',
  'os' => 'Linux',
  'path-aliases' =>
  array (
    '%drush' => '/usr/bin/drush',
    '%dump-dir' => '/www/<%= repoName %>/dbdumps',
    '%files' => 'sites/default/files',
  ),
  'databases' =>
  array (
    'default' =>
    array (
      'default' =>
      array (
        'database' => '<%= dbDatabase %>',
        'username' => '<%= dbUser %>',
        'password' => '<%= dbPassword %>',
        'host' => 'localhost',
        'port' => '',
        'driver' => 'mysql',
        'prefix' => '',
      ),
    ),
  ),
  'command-specific' => array (
    'sql-sync' => array (
      'no-cache' => TRUE,
    ),
  ),
);
