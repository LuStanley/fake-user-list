(function () {
  const BASE_URL = 'https://lighthouse-user-api.herokuapp.com'
  const INDEX_URL = BASE_URL + '/api/v1/users/'
  const data = []
  const dataPanel = document.querySelector('#data-panel')
  const pagination = document.querySelector('#pagination')
  const listDisplay = document.querySelector('#list-display')
  const pictureDisplay = document.querySelector('#picture-display')
  const switchItems = document.querySelector('#switch-items')
  const searchForm = document.querySelector('#search')
  const searchInput = document.querySelector('#search-input')


  const ITEM_PER_PAGE = 12

  let paginationData = []
  let currentPage = 1

  function getPageData(pageNum, data) {
    currentPage = pageNum
    paginationData = data || paginationData
    let offset = (pageNum - 1) * ITEM_PER_PAGE
    let pageDate = paginationData.slice(offset, offset + ITEM_PER_PAGE)

    if (switchItems.classList.contains('picture-mode')) {
      pictureFormat(pageDate)
    } else if (switchItems.classList.contains('list-mode')) {
      listFormat(pageDate)
    }
  }


  function getTotalPages(data, currentPage) {
    let totalPages = Math.ceil(data.length / ITEM_PER_PAGE) || 1
    let pageItemContent = ''
    for (let i = 0; i < totalPages; i++) {
      if (Number(currentPage) === (i + 1)) {
        pageItemContent += `
          <li class="page-item active">
        
        `
      } else {
        pageItemContent += `
          <li class="page-item">
        `

      }
      pageItemContent += `
          <a class="page-link" href="javascript:;" data-page="${i + 1}">${i + 1}</a>
        </li>
      `
    }
    pagination.innerHTML = pageItemContent

  }



  function pictureFormat(data) {
    let htmlContent = ''
    data.forEach(function (userObject) {
      htmlContent +=
        `
          <div class="col-sm-4">
            <div class="card mb-2">
              <img class="card-img-top user-avatar" data-toggle="modal" data-target="#show-user-modal" data-id="${userObject.id}" src="${userObject.avatar}" alt="Card image cap">
                <div class="card-body user-item-body">
                  <h6 class="card-title">${userObject.name} ${userObject.surname}</h6>
                  <button class="btn btn-primary btn-show-user" data-toggle="modal" data-target="#show-user-modal" data-id="${userObject.id}">More</button>
                  <button class="btn btn-info btn-add-favorite" data-id="${userObject.id}">+</button> 
                </div>
            </div>
          </div>
        `
    })
    dataPanel.innerHTML = htmlContent
  }

  //List Display
  function listFormat(data) {
    let htmlContent = ''
    data.forEach(function (item) {
      htmlContent += `
        <table class="table">
          <tbody>
            <tr>
              <td>${item.name} ${item.surname}</td>
              <td class="listButton">               
                <button class="btn btn-primary btn-show-user" data-toggle="modal" data-target="#show-user-modal" data-id="${item.id}">More</button>
                <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
              </td>
            </tr>
          </tbody>
        </table>
      `
    })

    dataPanel.innerHTML = htmlContent
  }

  function showUser(id) {
    const modalName = document.querySelector('#show-user-name')
    const modalAvatar = document.querySelector('#show-user-image')
    const url = INDEX_URL + id

    axios.get(url).then(response => {

      modalName.textContent = response.data.name + ' ' + response.data.surname
      modalAvatar.innerHTML =
        `
          <img src="${response.data.avatar}" class="img-fluid" alt="Responsive image">
        `
      userItem(response)

    })

  }

  function userItem(response) {
    const modalUserItem = document.querySelector('.user-item')
    let userItem =
      `
        <li>Email: ${response.data.email}</li>
        <li>Birthday : ${response.data.birthday}</li>
        <li>Region : ${response.data.region}</li>
        <li>Gender : ${response.data.gender}</li>
      `
    modalUserItem.innerHTML = userItem
  }

  function addFavoriteItem(id) {
    const list = JSON.parse(localStorage.getItem('favoriteUsers')) || []
    const user = data.find(item => item.id === Number(id))

    if (list.some(item => item.id === Number(id))) {
      alert(`${user.name} ${user.surname} is already in your favorite list.`)
    } else {
      list.push(user)
      alert(`Added ${user.name} ${user.surname} to your favorite list!`)
    }
    localStorage.setItem('favoriteUsers', JSON.stringify(list))
  }

  axios.get(INDEX_URL).then((response) => {
    data.push(...response.data.results)
    // console.log(data)
    getTotalPages(data, currentPage)
    getPageData(1, data)

  }).catch((err) => console.log(err))

  dataPanel.addEventListener('click', event => {
    if (event.target.matches('.user-avatar') || event.target.matches('.btn-show-user')) {
      showUser(event.target.dataset.id)
    } else if (event.target.matches('.btn-add-favorite')) {
      addFavoriteItem(event.target.dataset.id)
    }
  })

  pagination.addEventListener('click', event => {
    if (event.target.tagName === 'A') {
      getPageData(event.target.dataset.page)
      getTotalPages(data, event.target.dataset.page)
    }

  })

  switchItems.addEventListener('click', event => {
    if (event.target.id === listDisplay.id) {
      switchItems.classList.add('list-mode')
      switchItems.classList.remove('picture-mode')
      getPageData(currentPage)
    } else if (event.target.id === pictureDisplay.id) {
      switchItems.classList.add('picture-mode')
      switchItems.classList.remove('list-mode')
      getPageData(currentPage)
    }
  })

  // listen to search form submit event
  searchForm.addEventListener('submit', event => {
    let results = []
    event.preventDefault()
    const regex = new RegExp(searchInput.value, 'i')
    results = data.filter(user => user.name.match(regex))
    getTotalPages(results)
    getPageData(1, results)
  })

})()