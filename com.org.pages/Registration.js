let path = require('path');
let registrationUi = require("../com.org.uistore/RegistrationPage");
let commonMethod = require("../com.org.commonmethod/CommonMethod")
let log4jsGen = require("../Utlity/log4jsGen");
const CommonMethod = require('../com.org.commonmethod/CommonMethod');

const Registration = {
   
    getUrl:() =>{
        let env = browser.params.EnvBrowser.env;
        browser.get(Registration.navigateToWebsite(env));
    },
    enterUserName: (firstName , lastName) =>{
        let txtFirstName = commonMethod.findElement(registrationUi.firstName)
        commonMethod.sendKey(txtFirstName , firstName)
        let txtLastName =  commonMethod.findElement(registrationUi.lastName)
        commonMethod.sendKey(txtLastName , lastName)
    },
    enterAddress: address =>{
         let txtAddress = commonMethod.findElement(registrationUi.address)
         commonMethod.sendKey(txtAddress , address)
    },

    enterEmail: email =>{
         let txtemail = commonMethod.findElement(registrationUi.email);
         commonMethod.sendKey(txtemail , email)
 
    },

    enterPhoneNumber: number =>{
         let txtPhone = commonMethod.findElement(registrationUi.phone);
         commonMethod.sendKey(txtPhone , number)
    }, 

    selectGender: gender => {
      let radioGender = commonMethod.findElement(Registration.genderSlectedValue(gender))
      expect(radioGender.isSelected()).toBe(false);
      radioGender.click();
      expect(radioGender.isSelected()).toBe(true);
    }, 

    selectHobbies: hobbie =>{
      let hobbies = commonMethod.findElement(Registration.genderHobbiesValue(hobbie))
      expect(hobbies.isSelected()).toBe(false);
      hobbies.click();
      expect(hobbies.isSelected()).toBe(true);
    },

    enterLanguage: () =>{
      let ddlLanguage = commonMethod.findElement(registrationUi.ddlLanguage)
      commonMethod.waitTillElementClickable(ddlLanguage)
      commonMethod.click(ddlLanguage);
      let listOfLanguage =  commonMethod.findElements(registrationUi.ddlListOfLanguage)
      listOfLanguage.then(ele =>{
      commonMethod.click(listOfLanguage.get(commonMethod.genrateRandomNumber(ele)))
      commonMethod.click(commonMethod.findElement(registrationUi.row))
    })
    },

    selectSkill: skill =>{
      let skills =  commonMethod.findElement(registrationUi.skill);
      commonMethod.click(skills.$(`[value=${skill}]`))  
    },

    selectCountry: count =>{
        let country =  commonMethod.findElement(registrationUi.country);
        commonMethod.click(country.$(`[value=${count}]`))  
    },
 
    ddlSelectCountry: () =>{
        commonMethod.click(commonMethod.findElement(registrationUi.ddlCountry));
        let listCountry = commonMethod.findElements(registrationUi.ddlCountryList);
        listCountry.then(ele=>{
        commonMethod.click(listCountry.get(commonMethod.genrateRandomNumber(ele)))
     })
    } ,

    selectDateOfBirth: () =>{

        let year =  commonMethod.findElements(registrationUi.year);
        year.then(ele =>{
        commonMethod.click(year.get(commonMethod.genrateRandomNumber(ele)))
        })
    
        let month =  commonMethod.findElements(registrationUi.month);
        month.then(ele =>{
        commonMethod.click(month.get(commonMethod.genrateRandomNumber(ele)))
       })

       let day =  commonMethod.findElements(registrationUi.day);
       day.then(ele =>{
       commonMethod.click(day.get(commonMethod.genrateRandomNumber(ele)));
       })
    },
 
    enterPassword: pwd =>{

       let password = commonMethod.findElement(registrationUi.password);
       commonMethod.sendKey(password , pwd);
    },

    enterConPassword: pwd =>{
       let cnfPassword = commonMethod.findElement(registrationUi.cnfPassword);
       commonMethod.sendKey(cnfPassword , pwd);
    },
    
    fileToupload: () =>{
       let fileToUpload = '../File/cris.jpg',
       absolutePath = path.resolve(__dirname, fileToUpload);
       commonMethod.sendKey(commonMethod.findElement(registrationUi.file), absolutePath);
    },

    clickOnSubmit: () =>{
      CommonMethod.click(commonMethod.findElement(registrationUi.btnSubmit));
    }, 

    verifyNewUrl: url =>{
      browser.sleep(6000);
      let currentUrl = browser.getCurrentUrl();
      expect(currentUrl).toBe(url);
    },

    navigateToWebsite: env =>{

       if(env.toLowerCase() === 'qa'){
          log4jsGen.getLogger().debug("Navigated to QA URL "+browser.params.App.Registration.QA_URL);
          return browser.params.App.Registration.QA_URL
       }else if(env.toLowerCase() ==='dev'){
          log4jsGen.getLogger().debug("Navigated to STAGE URL "+browser.params.App.Registration.DEV_URL);
          return browser.params.App.Registration.DEV_URL
       } else {
         log4jsGen.getLogger().debug("Navigated to QA URL "+browser.params.App.Registration.QA_URL);
         return browser.params.App.Registration.QA_URL
       }
    },

    
    genderSlectedValue: gender => {
           if(gender.toLowerCase() === 'male' ){
               return registrationUi.male;
           } else if(gender.toLowerCase() === 'female'){
              return registrationUi.female
           }else{
               return null
           }
    },
    
    genderHobbiesValue: hobbies =>{
        if(hobbies.toLowerCase() === 'cricket'){
            return registrationUi.hobbiesCricket;
        }else if(hobbies.toLowerCase() === 'hockey'){
            return registrationUi.hobbiesHockey
        } else if(hobbies.toLowerCase() === 'movies'){
            return registrationUi.hobbiesMovies
        } else{
            return null
        }
    }


}
module.exports = Registration;