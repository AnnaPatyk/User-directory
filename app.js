class ServerCommunicator {
  constructor(options, url) {
    this.get = options.method;
    this.url = url;
    this.async = options.async;
    this.type = options.type;
  }
  serverRequest(callback) {
    const xhr = new XMLHttpRequest();
    xhr.open(this.get, this.url, this.async);
    xhr.responseType = this.type;
    xhr.send();

    xhr.addEventListener("readystatechange", () => {
      if (xhr.readyState === 4) {
        callback(xhr.response);
      }
    });
  }
}

class RenderManager {
  constructor(postBlok, parentDiv, ul) {
    this.postBlok = postBlok;
    this.parentDiv = parentDiv;
    this.ul = ul;
  }
  render(obj) {
    this.ul.innerHTML = "";
    this.parentDiv.innerHTML = "";
    this.postBlok.innerHTML = "";

    let users = obj;
    if (!Array.isArray(users)) {
      users = obj.users;
    }
    users.forEach((user) => {
      this.ul.insertAdjacentHTML(
        "beforeend",
        `
         <li data-user-id="${user.id}">${
          user.name || user.lastName + " " + user.firstName
        }</li>
      `
      );
    });
  }

  render2(xhrResponse) {
    if (!xhrResponse || typeof xhrResponse !== "object") {
      alert("Invalid server response for rendering user details.");
      return;
    }
    this.parentDiv.innerHTML = "";
    this.postBlok.innerHTML = "";
    this.parentDiv.insertAdjacentHTML(
      "beforeend",
      `
      <p>Name:  <span>${
        xhrResponse.name || xhrResponse.lastName + " " + xhrResponse.firstName
      }</span> </p>
      <p>Username:  <span> ${xhrResponse.username}</span></p>
      <p>Address:  <span>${
        xhrResponse.address.street || xhrResponse.address.address
      } , ${xhrResponse.address.suite || xhrResponse.address.state}, ${
        xhrResponse.address.city
      }</span> </p>
      <p>Email:  <a href="${xhrResponse.email}"><span> ${
        xhrResponse.email
      }</span></a></p>
      <p>Phone: <span>${xhrResponse.phone}</span> </p>
      <p>Website:  <a href="${
        xhrResponse.website || xhrResponse.domain
      }"><span>${xhrResponse.website || xhrResponse.domain}</span></a> </p>
      <button data-user-id ="${xhrResponse.id}">Show posts</button>
      `
    );
  }

  render3(xhrResponse) {
    this.postBlok.innerHTML = "";
    let xhrResponseArr = xhrResponse;
    if (!Array.isArray(xhrResponse)) {
      if (xhrResponse.posts) {
        xhrResponseArr = xhrResponse.posts;
      } else {
        xhrResponseArr = [xhrResponse];
      }
    }
    xhrResponseArr.forEach((postUser) => {
      this.postBlok.insertAdjacentHTML(
        "beforeend",
        `
               <div>
               <h3>${postUser.title.toUpperCase()}</h3>
               <p>${postUser.body}</p></div>
            
            `
      );
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  localStorage.setItem("dummy", "https://dummyjson.com/");
  localStorage.setItem("json", "https://jsonplaceholder.typicode.com/");
  let bool;
  let url;
  let options = {
    method: "GET",
    async: true,
    type: "json",
  };
  const ul = document.getElementById("users");
  const parentDiv = document.querySelector(".user-info");
  const postBlok = document.querySelector(".post");
  let renderManager = new RenderManager(postBlok, parentDiv, ul);

  document.querySelector(".buttons").addEventListener("click", (e) => {
    let elementTarget = e.target;

    if (elementTarget.matches(".dummyjson")) {
      url = localStorage.getItem("dummy");
      bool = true;
    } else if (elementTarget.matches(".json")) {
      bool = false;
      url = localStorage.getItem("json");
    }

    let url0 = url + "users";

    let serverCommunicator = new ServerCommunicator(options, url0);
    serverCommunicator.serverRequest(renderManager.render.bind(renderManager));
  });

  document.getElementById("users").addEventListener("click", (e) => {
    let id = e.target.dataset.userId;
    let url2 = url + "users" + "/" + id;
    serverCommunicator = new ServerCommunicator(options, url2);
    serverCommunicator.serverRequest(renderManager.render2.bind(renderManager));
  });

  document.querySelector(".user-info").addEventListener("click", (e) => {
    let id = e.target.dataset.userId;
    if (e.target.tagName == "BUTTON") {
      let url3;
      if (bool) {
        url3 = url + "posts/user/" + id;
      } else {
        url3 = url + "posts/?userId=" + id;
      }

      serverCommunicator = new ServerCommunicator(options, url3);
      serverCommunicator.serverRequest(
        renderManager.render3.bind(renderManager)
      );
    }
  });
});
