const formLine = document.querySelector("input");
const box = document.querySelector(".search-results");
const article = document.querySelector(".article");
const loader = document.querySelector(".loader"); // Элемент для отображения загрузки

const debounce = (fn, debounceTime) => {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), debounceTime);
  };
};

// Отображение состояния загрузки
function toggleLoader(isLoading) {
  loader.style.display = isLoading ? "block" : "none";
}

// Асинхронный запрос к API
async function fetchRepositories(query) {
  try {
    toggleLoader(true); // Включаем индикатор загрузки

    const res = await fetch(
      `https://api.github.com/search/repositories?q=${query}&per_page=5`
    );

    if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);

    const { items } = await res.json();
    return items;
  } catch (error) {
    console.error("Ошибка загрузки данных:", error);
    return [];
  } finally {
    toggleLoader(false); // Выключаем индикатор загрузки
  }
}

// Обновление списка репозиториев
async function updateRepoList() {
  const query = formLine.value.trim();
  if (!query) {
    box.innerHTML = "";
    box.classList.remove("show"); // Скрываем список
    return;
  }

  const repositories = await fetchRepositories(query);

  box.innerHTML = ""; // Очищаем список перед добавлением
  if (repositories.length === 0) {
    box.textContent = "Ничего не найдено.";
    box.classList.add("show"); // Показываем список
    return;
  }

  repositories.forEach((repo) => {
    const li = document.createElement("li");
    li.classList.add("seach");
    li.textContent = repo.name;
    li.dataset.name = repo.name;
    li.dataset.owner = repo.owner.login;
    li.dataset.stars = repo.stargazers_count;
    box.appendChild(li);
  });

  box.classList.add("show"); // Показываем список

}

// Добавление репозитория в статью
function addRepoToArticle({ name, owner, stars }) {
  const wrap = document.createElement("div");
  wrap.classList.add("wrap");

  const info = document.createElement("div");
  info.classList.add("list");
  info.textContent = `Name: ${name} Owner: ${owner} Stars: ${stars}`;

  const button = document.createElement("button");
  button.classList.add("close");
  button.textContent = "X";

  button.addEventListener("click", () => {
    wrap.remove();
    // Если все элементы удалены, скрыть article
    if (!article.querySelector(".wrap")) {
      article.classList.remove("show");
    }
  });

  wrap.append(info, button);
  article.appendChild(wrap);

  article.classList.add("show"); // Показываем статью
}

// Обработка клика по списку репозиториев
box.addEventListener("click", (event) => {
  if (event.target.classList.contains("seach")) {
    const { name, owner, stars } = event.target.dataset;
    addRepoToArticle({ name, owner, stars });
    event.target.remove();
  }
});

// Дебаунс события ввода
formLine.addEventListener("keyup", debounce(updateRepoList, 500));