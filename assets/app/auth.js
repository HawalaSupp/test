window.goToCreator = function() {
    localStorage.removeItem('hasUserData');
    localStorage.removeItem('sessionStartTime');
    localStorage.removeItem('lastActiveTime');
    localStorage.removeItem('top');
    localStorage.removeItem('bottom');
    localStorage.removeItem('seriesAndNumber');
    // Do not remove user's document dates or PESEL here — keep values the user
    // entered in the creator so they remain 1:1 with the card display.
    // localStorage.removeItem('birthDay');
    // localStorage.removeItem('givenDate');
    // localStorage.removeItem('expiryDate');
    window.location.href = 'id.html';
};


