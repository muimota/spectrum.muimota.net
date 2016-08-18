module.exports = function(grunt) {

    // 1. All configuration goes here
    grunt.initConfig({
      pkg: grunt.file.readJSON('package.json'),

      connect: {
        server: {
          options: {
            base: 'dist/'
          },

        }
      },

      watch:{
        options: {
          livereload: true,
        },
        html:{
          files:['src/*.html','src/includes/*.html'],
          tasks:['includereplace']
        },
        rest:{
          files:['src/js/**/*.js','src/css/*','src/img/*'],
          tasks:['copy']
        }
      },

      includereplace: {
        main: {
          options: {
            // Task-specific options go here.
          },
          files: [
            {src: '*.html', dest: 'dist/', expand: true, cwd: 'src/'},
          ]
        }
      },

      copy: {
        main: {
          files: [
            {src: 'js/**/*.js', dest: 'dist/', expand: true, cwd: 'src/'},
            {src: '*', dest: 'dist/css/', expand: true, cwd: 'src/css'},
            {src: '*', dest: 'dist/img/', expand: true, cwd: 'src/img'},
          ],
        },
      },
    });

    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-include-replace');
    grunt.loadNpmTasks('grunt-contrib-copy');

    grunt.registerTask('default',['includereplace','copy']);
    grunt.registerTask('server',['includereplace','copy','connect','watch']);
}
