function closeNav(event) {
  document.getElementById('myNav').style.height = '0%';
  document.getElementById('header').style.visibility = 'visible';
}
var closeBtn = document.getElementById('closeBtn');
closeBtn.addEventListener('click', closeNav, false);

function openProductMenu(event) {
  document.getElementById('productNav').style.height = '100%';
}
var productsLink = document.getElementById('products-link');
productsLink.addEventListener('click', openProductMenu, false);

function productMenuExit(event) {
  document.getElementById('productNav').style.height = '0%';
}
var closeProductMenu = document.getElementById('product-menu-close');
closeProductMenu.addEventListener('click', productMenuExit, false);

function openDropdown(event) {
  if (
    event.target.id === 'products-link' ||
    event.target.id === 'p-dropdown-icon'
  ) {
    document.getElementById('products').classList.toggle('show');
  }

  if (
    event.target.id === 'login-link' ||
    event.target.id === 'l-dropdown-icon'
  ) {
    document.getElementById('login').classList.toggle('show');
  }
}
var loginLink = document.getElementById('login-link');
loginLink.addEventListener('click', openDropdown, false);
