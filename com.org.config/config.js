var moment = require('moment');
var momentDurationFormatSetup = require("moment-duration-format");
var mm = require('moment-precise-range-plugin');
let details =  require('../TestEnviroment/CommonData.json')
var starttime = moment(new Date(),"MM-DD-YYYY HH:mm:ss");


exports.config = {
  

    directConnect:'true',
    capabilities: {

        platform: 'windows',
        platformVersion: '10',
        browserName: details.EnvBrowser.browser,
        chromeOptions: {
            'args': ['show-fps-counter=true'],
            'args': ['disable-extensions', 'start-maximized', '--disable-web-security','--no-sandbox'],
            'args': ['disable-infobars'],
            useAutomationExtension: false
            }

    },
    framework: details.EnvBrowser.framework,
    specs:[details.EnvBrowser.spec],
    params: require('../TestEnviroment/CommonData.json'),
    allScriptsTimeout: 20000,

     onPrepare: function() {
        browser.waitForAngularEnabled(false);
        browser.ignoreSynchronization = true;
           var HtmlReporter = require('protractor-beautiful-reporter');
           browser.driver.manage().window().maximize();
          jasmine.getEnv().addReporter(new HtmlReporter({
             baseDirectory: '../demoprotractor/Report'
          }).getJasmine2Reporter());
       },

    suites:{
        smoke: [details.EnvBrowser.smoke],
        regression: [details.EnvBrowser.regression]
    },
    jasmineNodeOpts: {
        showColors: true,
        defaultTimeoutInterval: 200000,
    }
};