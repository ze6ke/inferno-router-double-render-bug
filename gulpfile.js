const requiret=require('gulp-require-timer')

const gulp = requiret.require('gulp')
//const FileCache = requiret.require('gulp-file-cache')

requiret.require('gulp-validated-src')(gulp)

const listTasks = requiret.require('gulp-task-listing')
gulp.task('help', listTasks)

const config = {
  client: {
    name: 'client',
    stagingPath: 'staging/client',
    finalPath: 'dist/client',
    lintJs: {
      source: 'client/**/*.js'
    },
    watchPath: ['client/app/**/*.js', 'client/index.html'],
    webpackDev: './webpack.config.client.dev.js'
  }, 
  server: {
    name: 'server',
    stagingPath: 'server',
    finalPath: 'dist/server',
    browserSynch: {
      refreshDelay: 2000,
      watchPath: ['dist/**/*']
    },
    nodemon: {
      script: 'dist/server/index.js',
      watch: 'dist/server/index.js'
    }
  }
}


requiret.notifications = false 
let browserSynchHandle = null

gulp.task('clearfiles-client', clearFiles(config.client))
gulp.task('clearfiles-server', clearFiles(config.server))

gulp.task('webpack-client', runWebpackDev(config.client))

gulp.task('stagefiles-client', 
  ['clearfiles-client', 'webpack-client'], stageFiles(config.client, true))
gulp.task('stagefiles-server', ['clearfiles-server'], stageFiles(config.server, false))
gulp.task('stagefiles', ['stagefiles-server', 'stagefiles-client'])

gulp.task('launch-server', ['stagefiles'], runNodemon(config.server))
gulp.task('watchlaunch-server', ['launch-server'], watchLaunchServer(config.client, ['stagefiles-client']))

gulp.task('default', ['watchbrowsersync'])

gulp.task('launch-browsersync', ['watchlaunch-server'],launchBrowserSync())
gulp.task('reload-browsersync', reloadBrowserSync())
gulp.task('watchbrowsersync', ['watchlaunch-server', 'launch-browsersync'], watchBrowserSync(config.server, ['reload-browsersync']))


function launchBrowserSync() {
  return () => {
    const browserSynch = requiret.require('browser-sync')
    browserSynchHandle = browserSynch

    browserSynch.init({
      reloadDebounce: 2000, //I don't think that these are both necessary
      reloadThrottle: 1000,
      proxy: 'http://localhost:8000',
      port: 8888,
      host: '192.168.1.11'
    })
  }
}

function watchBrowserSync(settings, task) {
  const browserSynchWatchPath = settings.browserSynch.watchPath

  return () => {
    //the file operations that were getting done right before this were buffering
    //and triggering a flurry of event calls, this delay minimizes that.
    //That's also why the watch path was pushed up, because the directory was getting recreated
    //after the watch was registered and the watcher didn't find the new directory
    setTimeout( () => {
      watch(browserSynchWatchPath, task)()
    }, 1000)
  }
}

function reloadBrowserSync() {
  return () => {
    browserSynchHandle && browserSynchHandle.reload({stream: false})
  }
}

function watchLaunchServer(clientSettings, task) {
  const clientWatchPath = clientSettings.watchPath

  return watch(clientWatchPath, task)
}
function watch(watchPath, task) {
  return () => {
    gulp.watch(watchPath, task)
  }
}


function notImplemented(name) { //eslint-disable-line no-unused-vars
  const thisName = name
  return () => {
    console.error(`${thisName} not implemented!!!`)
  }
}

function stageFiles(settings, cleanup=false) {
  const source = settings.stagingPath + '/**'
  const destination = settings.finalPath
  const cleanupPaths = [settings.stagingPath + '/**']

  return (cb) => {
    gulp.srcN(source, 1)
      .pipe(gulp.dest(destination))
      .on('end', () => {
        if(cleanup) {
          const del = requiret.require('del')
          del.sync(cleanupPaths)
        }
        cb()
      })
  }
}

function clearFiles(settings) {
  const target = [settings.finalPath, settings.finalPath + '/**']

  return () => {
    const del = requiret.require('del')
    del.sync(target)
  }
}

function runNodemon(settings, logging=true) {
  const script = settings.nodemon.script
  const watch = settings.nodemon.watch
  const browserSynchRefreshDelay = settings.browserSynch.refreshDelay
  const args = logging ? [] : ['--nolog']

  return (cb) => {
    const nodemon = requiret.require('gulp-nodemon')
    let taskReportedComplete = false
    nodemon({
      script,
      args,
      watch
    })
      .on('start', () => {
        browserSynchHandle && browserSynchHandle.reload({stream: false})

        if(!taskReportedComplete) {
          taskReportedComplete = true
          cb()
        }
      })
      .on('quit', () => {
        console.log('nodemon quit event emitted')
      })
      .on('restart', () => {
        console.log('nodemon restart event emitted')
        setTimeout( () => {
          browserSynchHandle && browserSynchHandle.reload({stream: false})
        }, browserSynchRefreshDelay)
      })
  }
}


function runWebpackDev(settings) {
  const configFile = settings.webpackDev
  const desc = settings.name

  return runWebpack(configFile, desc)
}

function runWebpack(configFile, desc) {
  return (cb) => {
    const webpack = requiret.require('webpack')
    const gutil = requiret.require('gulp-util')
    webpack(require(configFile), (err, status) => {
      if(err) throw new gutil.PluginError(desc, err)
      gutil.log(`[${desc}]`, status.toString({
        // output options
      }))
      cb()
    })
  }
}


