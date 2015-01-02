module.exports = function(grunt) {

  require('time-grunt')(grunt);
  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    sass: {
      dist: {
        options: {
          sourcemap: true,
          style: 'compressed'
        },
        files: {
          'style/scss/project.noprefix.css': 'style/scss/project.scss'
        }
      }
    },
    autoprefixer: {
      options: {
        // Task-specific options go here.
      },
      single_file: {
        options: {
          map: true
        },
        src: 'style/scss/project.noprefix.css',
        dest: 'style/project.css'
      }
    },
    jshint: {
      all: ['Gruntfile.js', 'js/app.js']
    },
    uglify: {
      my_target: {
        options: {
          mangle: false,
          sourceMap: true
        },
        files: {
          'js/app.min.js': ['js/app.js'],
          'js/vendor.min.js': ['bower_components/jquery/dist/jquery.min.js', 'bower_components/d3/d3.js']
        }
      }
    },
    watch: {
      styles: {
        files: ['style/scss/*.scss'],
        tasks: ['sass', 'autoprefixer']
      },
      js: {
        files: ['js/nflteams.js', 'js/app.js'],
        tasks: ['jshint', 'uglify']
      },
      test: {
        files: ['js/spec/*.js'],
        tasks: ['jasmine']
      },
      html: {
        files: ['index.html'],
        tasks: []
      },
      options: {
        livereload: true,
      }
    },
    connect: {
      options: {
        port: 9000,
        // Change this to '0.0.0.0' to access the server from outside.
        hostname: 'localhost',
        livereload: 35729
      },
      livereload: {
        options: {
          open: true,
        }
      }
    },
    imagemin: {                          // Task
      static: {                          // Target
        options: {                       // Target options
          optimizationLevel: 3,
        },
        files: {                         // Dictionary of files
          'img/*.png': 'src/*.png', // 'destination': 'source'
          'img/*.jpg': 'src/*.jpg',
          'img/*.gif': 'src/*.gif'
        }
      }
    },
    grunticon: {
      myIcons: {
        files: [{
          expand: true,
          cwd: 'icons/source',
          src: ['*.svg', '*.png'],
          dest: "icons/output"
        }],
        options: {
          loadersnippet: "grunticon.loader.js",
        }
      }
    }

  });

  // Load the plugins.
  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-autoprefixer');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-imagemin');
  grunt.loadNpmTasks('grunt-grunticon');

  // Default task(s).
  grunt.registerTask('default', ['sass', 'autoprefixer', 'jshint', 'uglify', 'connect:livereload', 'watch']);
};
