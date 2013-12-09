/*
 * node-lastfm-history
 * https://github.com/bencevans/node-lastfm-history
 *
 * Copyright (c) 2013 Ben Evans
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    jshint: {

      options: {
        jshintrc: '.jshintrc',
        ignores: [
          '*.min.js',
          'node_modules/**/*',
          'public/bower_components/**/*',
          'dist/**/*',
          'coverage/**/*'
        ]
      },
      all: [
        '*.js',
        '**/*.js'
      ]

    }

  });


  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-jshint');

  // By default, lint and run all tests.
  grunt.registerTask('default', ['jshint']);

};