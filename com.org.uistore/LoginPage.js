
let LoginPage = function(){
    this.loginUser = by.css('.btn-primary');
    this.loginWithName = by.css("[name='userSelect'] option");
    this.btnLogin = by.css("[type='submit']");
    this.verifyUser = by.css("[class='fontBig ng-binding']");
}
module.exports = new LoginPage();