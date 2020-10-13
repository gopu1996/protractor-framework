let log4jsGen = require("../Utlity/log4jsGen");
let ec = protractor.ExpectedConditions;

const CommonMethod = {
  
    navigateToUrl:(url) => {
            browser.get(url);
            log4jsGen.getLogger().debug("Navigated to  URL "+url);  
        },

    sendKey:(elements , sendKey) => {
            elements.sendKeys(sendKey);
            log4jsGen.getLogger().info("Send a text in a field value is:  "+sendKey);  
        },

    findElement :selector => {
           log4jsGen.getLogger().info("Returning a element :  "+selector);  
           return element(selector)
        },

    findElements: selector =>{
        log4jsGen.getLogger().info("Returning a list of elements :  "+selector); 
        return element.all(selector);
        },
        
    click: element => {
        log4jsGen.getLogger().info("Click On  :  "+element); 
        element.click(); 
        },

    waitTillElementPresent: element => {
        log4jsGen.getLogger().info("Waiting for visibility of element  :  "+element); 
        browser.wait(ec.visibilityOf(element),10000);
        },

    waitTillElementClickable: element=> {
        log4jsGen.getLogger().info("Waiting for element to be clickable  :  "+element); 
        browser.wait(ec.elementToBeClickable(element),20000);
        },

    waitStalenessOf: element=>    {
        log4jsGen.getLogger().info("Waiting for stale element  :  "+element); 
        browser.wait(EC.stalenessOf(element), 5000);
    },
    
    waitStalenessOf: element=> {
        log4jsGen.getLogger().info("Waiting for visibility element  :  "+element); 
        browser.wait(EC.visibilityOf(element), 5000);
    },


     clearInput: element =>{
        log4jsGen.getLogger().info("Clear the element  :  "+element); 
        element.clear();
        },
    
     select: element =>  {
        log4jsGen.getLogger().info("Select the element  :  "+element); 
        element.select();
        },
    
   getElementText: element =>{
            return element.getText().then(text =>{
            log4jsGen.getLogger().info("Returning text of element  :  "+text);     
            return text;
            });
        },
    genrateRandomNumber: length =>{
        log4jsGen.getLogger().info("Number genrating 1 to  :  "+length.length); 
        return Math.floor(Math.random() * length.length + 1) - 1
    }     
};

module.exports =CommonMethod;