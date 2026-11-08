const handleMenuClick = () => {
        const sidebar = document.querySelector('.sidebar')
        if(sidebar) {
            sidebar.classList.contains('hide') ?
            sidebar.classList.remove('hide') :
            sidebar.classList.add('hide')
        }
    }
    

const hamburgerMenu = document.querySelector('.hamburger_menu')
if (hamburgerMenu) {
    hamburgerMenu.addEventListener('click', handleMenuClick)
}