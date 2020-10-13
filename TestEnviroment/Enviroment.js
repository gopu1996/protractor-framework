let moment = require('moment');
let starttime = moment(new Date(),"MM-DD-YYYY HH:mm:ss");
let log4jsGen = require("../Utlity/log4jsGen");




var EnvironmentSetUp = function(){

            beforeAll(() => {
                log4jsGen.getLogger().info(moment().format("MM-DD-YYYY HH:mm:ss")+" Test Execution Started");
                log4jsGen.getLogger().info("****************************************************************************");
                browser.waitForAngularEnabled(false);
                log4jsGen.getLogger().info("Set waitForAngularEnabled = false");
                browser.ignoreSynchronization = true;
                log4jsGen.getLogger().info("Set ignoreSynchronization = true");
            });
            beforeEach(() => {
                log4jsGen.getLogger().info("Test Method Execution Started at : "+moment().format("MM-DD-YYYY HH:mm:ss"));
                log4jsGen.getLogger().info("---------------------------------------------------------------------------")
            });
           afterEach(() => {
            log4jsGen.getLogger().info("---------------------------------------------------------------------------");
            log4jsGen.getLogger().info("Test Method Execution Completed at : "+moment().format("MM-DD-YYYY HH:mm:ss"));
            });
            afterAll(() => {
                var endtime = moment(new Date(),"MM-DD-YYYY HH:mm:ss");
                var duration = moment.duration(moment(endtime).diff(starttime));
                log4jsGen.getLogger().info("****************************************************************************");
                log4jsGen.getLogger().info("Total Duration : "+duration.minutes()+" minutes "+duration.seconds()+" seconds");
                log4jsGen.getLogger().info(moment().format("MM-DD-YYYY HH:mm:ss")+" Test Execution Completed");
            });


};

module.exports = EnvironmentSetUp