/* Select All Element */
const searchInput = document.querySelector("#search");
const searchBtn = document.querySelector(".btn--search");
const searchSuggest = document.querySelector(".search__suggest");
const searchRecent = document.querySelector(".search__recent");
const clearBtn = document.querySelector(".btn--clear");
const recentContainer = document.querySelector(".recent__data");
const searchHeader = document.querySelector(".result__header");
const resultCount = document.querySelector(".result__count");
const searchResult = document.querySelector(".search__result");
const lyricSec = document.querySelector(".lyric");
const lyricHeader = document.querySelector(".lyric__header");
const lyricBody = document.querySelector(".lyric__body");
const divider = document.querySelector(".divider-lyric");
const menuBtn = document.querySelector("#btn-menu");
const menuList = document.querySelector(".menu__list");
const playBtn = document.querySelector(".fa-play");
const stopBtn = document.querySelector(".fa-stop");
const upBtn = document.querySelector(".fa-chevron-up");
const downBtn = document.querySelector(".fa-chevron-down");
const closeBtn = document.querySelector("#btn-close");

/* Initial Value */
let suggestSearchDataInit = [];
let suggestSearchData = [];
let suggestSearchFiltered = [];
let isOpen = false;
let isPlay = false;
let playScroll;
let scrollPos = 0;

/* Suggest List */
fetch("db.json")
  .then((res) => res.json())
  .then((data) => suggetPushData(data.lyrics));

function suggetPushData(data) {
  data.map((item) => {
    suggestSearchDataInit.push(item.Artist);
    suggestSearchDataInit.push(item.Title);
  });
  suggestSearchData = [...new Set(suggestSearchDataInit)];
}

/* Search Input */
searchInput.addEventListener("keyup", function (e) {
  let userInput = e.target.value;
  if (userInput) {
    suggestSearchFiltered = suggestSearchData.filter((val) =>
      val.toLocaleLowerCase().startsWith(userInput.toLocaleLowerCase())
    );
    showSuggest(suggestSearchFiltered);
    searchSuggest.querySelectorAll("li").forEach((liItem) => {
      liItem.addEventListener("click", function (e) {
        searchInput.value = e.target.textContent;
        searchSuggest.classList.remove("active");
      });
    });
  } else {
    searchSuggest.classList.remove("active");
  }
});

searchInput.addEventListener("focus", (e) => {
  if (e.target.value) {
    suggestSearchFiltered = suggestSearchData.filter((val) =>
      val.toLocaleLowerCase().startsWith(e.target.value.toLocaleLowerCase())
    );
    showSuggest(suggestSearchFiltered);
  }
});

searchInput.addEventListener("blur", (e) => {
  searchSuggest.classList.remove("active");
  e.target.style.border = "none";
});

searchInput.addEventListener("change", (e) => {
  e.target.style.border = "none";
});

function showSuggest(list) {
  let suggestList = "";
  if (!list.length) {
    let userVal = searchInput.value;
    suggestList = `<li>${userVal}</li>`;
  } else {
    list.map((li) => {
      suggestList += `<li>${li}</li>`;
    });
  }
  searchSuggest.innerHTML = suggestList;
  searchSuggest.classList.add("active");
}

/* Recent Search */
let recentSearchDataInit = localStorage.getItem("recentSearch")
  ? JSON.parse(localStorage.getItem("recentSearch"))
  : [];

localStorage.setItem("recentSearch", JSON.stringify(recentSearchDataInit));
const recentSearchData = JSON.parse(localStorage.getItem("recentSearch"));

showRecentSearch(recentSearchData);

recentItemClick();

clearBtn.addEventListener("click", () => {
  localStorage.removeItem("recentSearch");
  showRecentSearch([]);
  recentSearchDataInit = [];
});

function showRecentSearch(data) {
  recentList = "";
  if (!data.length) {
    recentList = "<p>No recent search data...</p>";
    clearBtn.style.display = "none";
  } else {
    clearBtn.style.display = "inline-block";
    data.map((list) => {
      recentList += `
    <div class="recent__item">
      ${list}
    </div> 
    `;
    });
  }
  recentContainer.innerHTML = recentList;
}

function recentItemClick() {
  recentContainer.querySelectorAll(".recent__item").forEach((item) => {
    item.addEventListener("click", (e) => {
      showLoadingResult();
      getSearchResult(e.target.innerText);
    });
  });
}

/* Search Input Submit */
searchInput.addEventListener("keydown", (e) => {
  if (e.keyCode === 13) {
    if (searchInput.value) {
      recentSearchDataCheck();
      searchRecent.style.display = "none";
      showLoadingResult();
      getSearchResult(searchInput.value);
      searchInput.value = "";
      searchInput.blur();
    } else {
      searchInput.style.border = "2px solid red";
      searchInput.focus();
    }
  }
});

searchBtn.addEventListener("click", (e) => {
  if (searchInput.value) {
    recentSearchDataCheck();
    searchRecent.style.display = "none";
    showLoadingResult();
    getSearchResult(searchInput.value);
    searchInput.value = "";
  } else {
    searchInput.style.border = "2px solid red";
    searchInput.focus();
  }
});

function recentSearchDataCheck() {
  if (recentSearchDataInit.length <= 4) {
    recentSearchDataInit.unshift(searchInput.value);
    localStorage.setItem("recentSearch", JSON.stringify(recentSearchDataInit));
  } else {
    recentSearchDataInit.pop();
    recentSearchDataInit.unshift(searchInput.value);
    localStorage.setItem("recentSearch", JSON.stringify(recentSearchDataInit));
  }
}

/* Search Result */
function showLoadingResult() {
  searchHeader.style.display = "block";
  searchResult.style.display = "block";
  resultCount.innerHTML = "0";
  searchResult.innerHTML = `
  <div class="result__item loading">
    <i></i>
    <h4></h4>
    <p></p>
  </div>
  <div class="result__item loading">
    <i></i>
    <h4></h4>
    <p></p>
  </div>
  <div class="result__item loading">
    <i></i>
    <h4></h4>
    <p></p>
  </div>
`;
}

async function getSearchResult(userInput) {
  try {
    const res = await fetch("db.json");
    const data = await res.json();
    const filterTitle = data.lyrics.filter((lyric) => {
      return lyric.Title.toLowerCase().startsWith(userInput.toLowerCase());
    });
    const filterArtist = data.lyrics.filter((lyric) => {
      return lyric.Artist.toLowerCase().startsWith(userInput.toLowerCase());
    });
    const filteredData = [...filterTitle, ...filterArtist];
    showSearchResult(filteredData);
    showRecentSearchUpdated();
    searchRecent.style.display = "block";
  } catch (err) {
    showError(searchResult, err.message);
  }
}

function showSearchResult(data) {
  let result = "";
  if (data.length) {
    data.map((res) => {
      result += `
      <div class="result__item" data-id="${res.id}">
        <i class="fas fa-music"></i>
        <h4>${res.Title}</h4>
        <p>${res.Artist}</p>
      </div>
    `;
    });
  } else {
    result += "No data found ...";
  }
  resultCount.innerHTML = data.length;
  searchResult.innerHTML = result;
  /* Click */
  searchResult.querySelectorAll(".result__item").forEach((res) => {
    res.addEventListener("click", (e) => {
      showLyricLoading();
      getLyric(e.currentTarget.dataset.id);
    });
  });
}

function showRecentSearchUpdated() {
  recentDataUpdated = JSON.parse(localStorage.getItem("recentSearch"));
  showRecentSearch(recentDataUpdated);
  recentItemClick();
}

function showError(el, message) {
  el.innerHTML = `Error: ${message}`;
}

/* Show Lyric */
function showLyricLoading() {
  lyricSec.classList.add("show");
  divider.style.display = "none";
  menuBtn.style.display = "none";
  lyricHeader.innerHTML = "<h3>Loading...</h3>";
  lyricBody.innerHTML = "";
}

async function getLyric(id) {
  try {
    const res = await fetch("db.json");
    const data = await res.json();
    const filteredData = data.lyrics.filter((lyric) => lyric.id == id);
    showLyric(filteredData[0]);
  } catch (err) {
    lyricHeader.innerHTML = "";
    showError(lyricBody, err.message);
  }
}

function showLyric(data) {
  let lyric = data.lyric.replace(/(?:\r\n|\r|\n)/g, "<br>");
  lyricHeader.innerHTML = `
    <h1>"${data.Title}"</h1>
    <h3>by ${data.Artist}</h3>
  `;
  divider.style.display = "block";
  lyricBody.innerHTML = lyric;
  menuBtn.style.display = "inline-block";
  document.title = `${data.Title} - ${data.Artist}`;
}

/* Lyric Menu */
menuBtn.addEventListener("click", function (e) {
  if (isOpen) {
    isOpen = false;
    openMenu(isOpen);
  } else {
    isOpen = true;
    openMenu(isOpen);
  }
});

closeBtn.addEventListener("click", () => {
  lyricSec.classList.remove("show");
  isOpen = false;
  openMenu(isOpen);
  stopLyric();
  lyricHeader.innerHTML = "";
  lyricBody.innerHTML = "";
  divider.style.display = "none";
  document.title = "Find Lyrics";
});

playBtn.addEventListener("click", function (e) {
  if (e.target.classList.contains("fa-play")) {
    e.target.classList.remove("fa-play");
    e.target.classList.add("fa-pause");
    playLyric();
  } else {
    e.target.classList.remove("fa-pause");
    e.target.classList.add("fa-play");
    pauseLyric();
  }
});

stopBtn.addEventListener("click", stopLyric);

upBtn.addEventListener("click", upLyric);

downBtn.addEventListener("click", downLyric);

function openMenu(bool) {
  icon = menuBtn.firstElementChild;
  if (bool) {
    menuList.classList.add("show");
    icon.classList.remove("fa-bars");
    icon.classList.add("fa-minus");
  } else {
    menuList.classList.remove("show");
    icon.classList.remove("fa-minus");
    icon.classList.add("fa-bars");
  }
}

/* Lyric Control */
function playLyric() {
  if (lyricBody.scrollTop === lyricBody.scrollHeight - lyricBody.offsetHeight) {
    playBtn.classList.remove("fa-pause");
    playBtn.classList.add("fa-play");
    return;
  }
  isPlay = true;
  scrollPos = lyricBody.scrollTop;
  playScroll = setInterval(() => {
    lyricBody.scrollTo(0, scrollPos);
    scrollPos++;
  }, 100);
}

function pauseLyric() {
  clearInterval(playScroll);
}

function downLyric() {
  scrollPos = lyricBody.scrollTop;
  lyricBody.scrollTo(0, scrollPos + 200);
  scrollPos += 200;
}

function upLyric() {
  scrollPos = lyricBody.scrollTop;
  lyricBody.scrollTo(0, scrollPos - 200);
  scrollPos -= 200;
}

function stopLyric() {
  if (isPlay) {
    isPlay = false;
    clearInterval(playScroll);
    lyricBody.scrollTo(0, 0);
    if (playBtn.classList.contains("fa-pause")) {
      playBtn.classList.remove("fa-pause");
      playBtn.classList.add("fa-play");
    }
  }
}

lyricBody.addEventListener("scroll", (e) => {
  if (isPlay) {
    if (
      Math.floor(e.target.scrollTop) ===
        e.target.scrollHeight - e.target.offsetHeight ||
      scrollPos <= 0
    ) {
      isPlay = false;
      clearInterval(playScroll);
      if (playBtn.classList.contains("fa-pause")) {
        playBtn.classList.remove("fa-pause");
        playBtn.classList.add("fa-play");
      }
    }
  }
});
