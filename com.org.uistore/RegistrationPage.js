

let RegistrationPage = function(){

    this.firstName =  by.model('FirstName');
    this.lastName = by.model('LastName');
    this.address = by.model('Adress');
    this.email = by.model('EmailAdress');
    this.phone = by.model('Phone');
    this.male = by.css("[value='Male']");
    this.female = by.css("[value='FeMale']");
    this.hobbiesCricket = by.id('checkbox1');
    this.hobbiesMovies = by.id('checkbox2');
    this.hobbiesHockey = by.id('checkbox3');
    this.ddlLanguage = by.css("[class='ui-autocomplete-multiselect ui-state-default ui-widget']");
    this.ddlListOfLanguage = by.css("[class='ui-autocomplete ui-front ui-menu ui-widget ui-widget-content ui-corner-all'] li");
    this.row = by.css(".row");
    this.skill = by.model('Skill');
    this.country = by.model('country'); 
    this.ddlCountry = by.css(".select2-selection--single");
    this.ddlCountryList = by.css(".select2-results__options li")
    this.year = by.css('#yearbox option');
    this.month = by.css("[ng-model='monthbox'] option")
    this.day = by.css('#daybox option');
    this.password = by.model('Password');
    this.cnfPassword = by.model('CPassword');
    this.file = by.css('input[type="file"]');
    this.btnSubmit = by.id('submitbtn');
}
module.exports = new RegistrationPage();