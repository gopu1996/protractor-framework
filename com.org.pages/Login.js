const CommonMethod = require("../com.org.commonmethod/CommonMethod");
let log4jsGen = require("../Utlity/log4jsGen"); 
const LoginUi = require("../com.org.uistore/LoginPage");

const Login = {

    getUrl:  ()=>{
        let env = browser.params.EnvBrowser.env;
        browser.get(Login.navigateToWebsite(env));
    },
  
    clkAsCustomer : () =>{
         browser.sleep(3000)
         CommonMethod.findElements(LoginUi.loginUser).get(0).click();
    },

    selectUserAsLogin: username =>{
        let valueGenrated =  Login.genrateValueFromName(username);
        browser.sleep(2000)
        console.log(username , "hehheheh")
        CommonMethod.findElements(LoginUi.loginWithName).get(valueGenrated).click()
    },

    clickOnLogin: ()=>{
        CommonMethod.waitTillElementPresent(element(LoginUi.btnLogin));
        CommonMethod.click(CommonMethod.findElement(LoginUi.btnLogin));
    },
    verifyUserLogin: username =>{
        browser.sleep(4000)
        expect(CommonMethod.findElement(LoginUi.verifyUser).getText()).toBe(username);
    },
    navigateToWebsite: env =>{
       
        if(env.toLowerCase() === 'qa'){
            log4jsGen.getLogger().debug("Navigated to QA URL "+browser.params.App.Login.QA_URL);
            return browser.params.App.Login.QA_URL
        }else if(env.toLowerCase() ==='dev'){
            log4jsGen.getLogger().debug("Navigated to STAGE URL "+browser.params.App.Login.DEV_URL);
            return browser.params.App.Login.DEV_URL
        } else {
            log4jsGen.getLogger().debug("Navigated to QA URL "+browser.params.App.Login.QA_URL);
            return browser.params.App.Login.QA_URL
        }
    },

    genrateValueFromName:  name =>{
        if(name ==="Hermoine Granger" ){
          log4jsGen.getLogger().info("Return a name:  "+name);
            return '1';
        } else if (name ==="Harry Potter" ){
          log4jsGen.getLogger().info("Return a name:  "+name);
            return '2';
        } else if (name ==="Ron Weasly" ){
          log4jsGen.getLogger().info("Return a name:  "+name);
          return '3';
        }else if (name ==="Albus Dumbledore" ){
          log4jsGen.getLogger().info("Return a name:  "+name);
          return '4';
        }else if (name ==="Neville Longbottom" ){
          log4jsGen.getLogger().info("Return a name:  "+name);
          return '5';
        } else {
          log4jsGen.getLogger().error("Invalid name  "+name);
            return null;
        }
  
      }
}
module.exports = Login