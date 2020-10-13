const Login = require("../com.org.pages/Login")
let testSetUp = require("../TestEnviroment/Enviroment")
let testData = require("../TestData/TestData.json")

describe('User login', () => {
    Enviroment = new testSetUp();

    let userName = testData[0].TC01.Username;
    
   it('Navigate to website url', ()=>{
      Login.getUrl();
   })

   it('Click on as customer login', ()=>{
      Login.clkAsCustomer()   
   })

   it('Select customer name which user have to login', ()=>{
      Login.selectUserAsLogin(userName)   
   })

  it('Click login button', ()=>{
      Login.clickOnLogin();
  })

  it('Verify user as customer login', ()=>{
   Login.verifyUserLogin(userName);
})

   
})