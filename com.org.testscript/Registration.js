
let testSetUp = require("../TestEnviroment/Enviroment")
let Registration = require("../com.org.pages/Registration")
let testData = require("../TestData/TestData.json")

describe('Registration of user in  Automation Demo Site', () => {
    Enviroment = new testSetUp();
    let firstName = testData[0].TC01.Firstname;
    let lastName = testData[0].TC01.Lastname;
    let address = testData[0].TC01.Address;
    let email = testData[0].TC01.Email;
    let phone = testData[0].TC01.Phone;
    let gender = testData[0].TC01.Gender;
    let hobbies = testData[0].TC01.Hobbies;
    let skill = testData[0].TC01.Skills;
    let country = testData[0].TC01.Country;
    let password = testData[0].TC01.Password;
    let url = "http://demo.automationtesting.in/WebTable.html"
   
    it('Navigate to url', ()=>{
       Registration.getUrl()
    })
    it('Enter user first name and last name', () =>{
       Registration.enterUserName(firstName , lastName)
    })

    it('Enter user Address', ()=>{
        Registration.enterAddress(address)
    })

    it('Enter user Email Address' , () =>{
       Registration.enterEmail(email)
    })

    it('Enter user Phone Number' , () =>{
       Registration.enterPhoneNumber(phone)
    })

    it('Select user Gender', () =>{
       Registration.selectGender(gender);
    })

    it('Select user Hobbies', () =>{
       Registration.selectHobbies(hobbies)
    })

    it('Enter Random Language', () =>{
       Registration.enterLanguage()
    })

    it('Select Skill detais', () =>{
       Registration.selectSkill(skill)
    })

    it('Select Country details', () =>{
       Registration.selectCountry(country)
    })

    it('Select Random Country details', () =>{
       Registration.ddlSelectCountry()
    })

    it('Select Random Date of Birth', ()=>{
       Registration.selectDateOfBirth()
    })

    it('Enter password', ()=>{
       Registration.enterPassword(password);
    })

    it('Enter confirm password', ()=>{
       Registration.enterConPassword(password);
    })

    it('Upload a photo', () =>{
       Registration.fileToupload();
    })

    it('Click on Submit Button', () => {
      Registration.clickOnSubmit()
    })

    it('Verify http://demo.automationtesting.in/WebTable.html page', () => {
      Registration.verifyNewUrl(url)
    })
   
});