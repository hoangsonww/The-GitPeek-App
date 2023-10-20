const APIURL = "https://api.github.com/users/";

const main = document.getElementById("main");
const form = document.getElementById("form");
const search = document.getElementById("search");

const recentUsers = document.getElementById("recentUsers");
let usersHistory = ["hoangsonww"];

getUser("hoangsonww");

async function getUser(username) {
    showLoading();
    const resp = await fetch(APIURL + username);
    const respData = await resp.json();
    if (respData.message === "Not Found" || !respData.name) {
        displayNotFound();
        return;
    }
    createUserCard(respData);

    getRepos(username);
    hideLoading();
}

async function getRepos(username) {
    const resp = await fetch(APIURL + username + "/repos");
    const respData = await resp.json();

    addReposToCard(respData);
}

function createUserCard(user) {
    const cardHTML = `
        <div class="card">
            <div>
                <a href="${user.html_url}" target="_blank">
                    <img class="avatar" src="${user.avatar_url}" alt="${user.name}" />
                </a> 
            </div>
            <div class="user-info">
                <h2>${user.name}</h2>
                <p>${user.bio}</p>
                <ul class="info">
                    <li>${user.followers}<strong>Followers</strong></li>
                    <li>${user.following}<strong>Following</strong></li>
                    <li>${user.public_repos}<strong>Repos</strong></li>
                </ul>
                <li><strong>Location:</strong> ${user.location || 'Not provided'}</li>
                <li><strong>Company:</strong> ${user.company || 'Not provided'}</li>
                <li><strong>Website/Blog:</strong> <a href="${user.blog}" target="_blank">${user.blog || 'Not provided'}</a></li>
                <li><strong>Twitter:</strong> ${user.twitter_username ? `<a href="https://twitter.com/${user.twitter_username}" target="_blank">@${user.twitter_username}</a>` : 'Not provided'}</li>
                <li><strong>Joined At:</strong> ${new Date(user.created_at).toLocaleDateString()}</li>
                <li><strong>Last Updated:</strong> ${new Date(user.updated_at).toLocaleDateString()}</li>
                <div style="margin-bottom: 10px"></div>
                <div id="repos"></div>
            </div>
        </div>
    `;

    main.innerHTML = cardHTML;
}

function displayNotFound() {
    const notFoundHTML = `
        <div class="card">
            <h2>User not found</h2>
            <p>The GitHub user you searched for does not exist.</p>
            <button onclick="location.reload();" class="back-btn">Back to Main Page</button>
        </div>
    `;

    main.innerHTML = notFoundHTML;
}

function addReposToCard(repos) {
    const reposEl = document.getElementById("repos");

    repos
        .sort((a, b) => b.stargazers_count - a.stargazers_count)
        .slice(0, 10)
        .forEach((repo) => {
            const repoEl = document.createElement("a");
            repoEl.classList.add("repo");

            repoEl.href = repo.html_url;
            repoEl.target = "_blank";
            repoEl.innerText = repo.name;

            reposEl.appendChild(repoEl);
        });
}

function navigateToAbout() {
    window.location.href = "about.html";
}

function updateUserHistory(username) {
    usersHistory = [username, ...new Set(usersHistory)];
    usersHistory = usersHistory.slice(0, 5);
    renderUserHistory();
}

function renderUserHistory() {
    recentUsers.innerHTML = "Recent Users: ";
    usersHistory.forEach(user => {
        const userLink = document.createElement('a');
        userLink.textContent = user;
        userLink.href = "#";
        userLink.onclick = function() {
            getUser(user);
        };
        recentUsers.appendChild(userLink);
        recentUsers.appendChild(document.createTextNode(' ')); // Space between links
    });
}

function showLoading() {
    document.getElementById("loadingSpinner").hidden = false;
}

function hideLoading() {
    document.getElementById("loadingSpinner").hidden = true;
}


form.addEventListener("submit", (e) => {
    e.preventDefault();

    const user = search.value;

    if (user) {
        getUser(user);

        search.value = "";
    }

    updateUserHistory(user);
});