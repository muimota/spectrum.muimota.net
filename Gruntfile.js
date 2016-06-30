module.exports = function(grunt) {

    // 1. All configuration goes here
    grunt.initConfig({
      pkg: grunt.file.readJSON('package.json'),

      connect: {
        server: {
          options: {
            base: './'
          },

        }
      },

      watch:{
        options: {
          livereload: true,
        },
        script:{
          files:['src/**/*'],
          //tasks:[]
        }
      }
    });

    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-connect');

    grunt.registerTask('default',['connect','watch']);
}
