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
    '%dump-dir' => '/www/<%= profileName %>/dbdumps',
    '%files' => 'sites/default/files',
  ),
  'databases' =>
  array (
    'default' =>
    array (
      'default' =>
      array (
        'database' => '<%= profileName %>',
        'username' => 'azuboe',
        'password' => '528TghRelM23XwK0LcE',
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
